import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

// --- Configuration ---

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MEMORIES_USER_ID = process.env.MEMORIES_USER_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !MEMORIES_USER_ID) {
  console.error(
    "Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MEMORIES_USER_ID"
  );
  process.exit(1);
}

const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

const userId = MEMORIES_USER_ID;

// --- Helpers ---

interface MemoryRow {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  memory_tags?: { tags: { id: string; name: string } }[];
  media?: { id: string; type: string; storage_path: string }[];
}

function formatMemory(row: MemoryRow) {
  const tags =
    (row.memory_tags as { tags: { id: string; name: string } }[])
      ?.map((mt) => mt.tags)
      .filter(Boolean) ?? [];

  const media =
    (row.media as { id: string; type: string; storage_path: string }[]) ?? [];

  return {
    id: row.id,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: tags.map((t) => t.name),
    media_count: media.length,
  };
}

// --- MCP Server ---

const server = new McpServer({
  name: "memories",
  version: "1.0.0",
});

// Tool: list_memories
server.tool(
  "list_memories",
  "List memories in reverse chronological order. Supports keyword search and tag filtering.",
  {
    query: z
      .string()
      .optional()
      .describe("Search keyword to filter memories by content"),
    tag: z
      .string()
      .optional()
      .describe("Filter by tag name"),
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(20)
      .describe("Number of memories to return (default 20, max 50)"),
    cursor: z
      .string()
      .optional()
      .describe(
        "Pagination cursor from a previous response (format: created_at|id)"
      ),
  },
  async ({ query, tag, limit, cursor }) => {
    const isTagFiltered = !!tag;
    let tagId: string | null = null;

    if (isTagFiltered) {
      const { data: tagRow } = await supabase
        .from("tags")
        .select("id")
        .eq("user_id", userId)
        .eq("name", tag!.trim().toLowerCase())
        .single();

      if (!tagRow) {
        return {
          content: [
            { type: "text" as const, text: `Tag "${tag}" not found.` },
          ],
        };
      }
      tagId = tagRow.id;
    }

    const selectStr = isTagFiltered
      ? "id, content, created_at, updated_at, memory_tags!inner(tag_id, tags(id, name)), media(id, type, storage_path)"
      : "id, content, created_at, updated_at, memory_tags(tags(id, name)), media(id, type, storage_path)";

    let dbQuery = supabase
      .from("memories")
      .select(selectStr)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit + 1);

    if (query) {
      dbQuery = dbQuery.ilike("content", `%${query}%`);
    }

    if (isTagFiltered && tagId) {
      dbQuery = dbQuery.eq("memory_tags.tag_id", tagId);
    }

    if (cursor) {
      const [cursorDate, cursorId] = cursor.split("|");
      dbQuery = dbQuery.or(
        `created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursorId})`
      );
    }

    const { data: rows, error } = await dbQuery;

    if (error) {
      return {
        content: [
          { type: "text" as const, text: `Error: ${error.message}` },
        ],
        isError: true,
      };
    }

    const allRows = (rows ?? []) as unknown as MemoryRow[];
    const hasMore = allRows.length > limit;
    const slice = hasMore ? allRows.slice(0, limit) : allRows;

    const memories = slice.map(formatMemory);

    let nextCursor: string | null = null;
    if (hasMore && memories.length > 0) {
      const last = memories[memories.length - 1];
      nextCursor = `${last.created_at}|${last.id}`;
    }

    const result = {
      memories,
      total_returned: memories.length,
      has_more: hasMore,
      next_cursor: nextCursor,
    };

    return {
      content: [
        { type: "text" as const, text: JSON.stringify(result, null, 2) },
      ],
    };
  }
);

// Tool: get_memory
server.tool(
  "get_memory",
  "Get a single memory by ID with full details including tags and media info.",
  {
    memory_id: z.string().describe("The UUID of the memory to retrieve"),
  },
  async ({ memory_id }) => {
    const { data: memory, error } = await supabase
      .from("memories")
      .select(
        "id, content, created_at, updated_at, memory_tags(tags(id, name)), media(id, type, storage_path, display_order)"
      )
      .eq("id", memory_id)
      .eq("user_id", userId)
      .single();

    if (error || !memory) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Memory not found: ${error?.message ?? "no matching record"}`,
          },
        ],
        isError: true,
      };
    }

    const row = memory as unknown as MemoryRow;
    const tags =
      (row.memory_tags as { tags: { id: string; name: string } }[])
        ?.map((mt) => mt.tags)
        .filter(Boolean) ?? [];

    const media =
      (row.media as unknown as {
        id: string;
        type: string;
        storage_path: string;
        display_order: number;
      }[]) ?? [];

    const result = {
      id: row.id,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      tags: tags.map((t) => ({ id: t.id, name: t.name })),
      media: media.map((m) => ({
        id: m.id,
        type: m.type,
        display_order: m.display_order,
      })),
    };

    return {
      content: [
        { type: "text" as const, text: JSON.stringify(result, null, 2) },
      ],
    };
  }
);

// Tool: create_memory
server.tool(
  "create_memory",
  "Create a new memory with optional tags. Captures the current timestamp automatically.",
  {
    content: z
      .string()
      .min(1)
      .describe("The text content of the memory — what made this moment matter?"),
    tags: z
      .array(z.string())
      .optional()
      .describe("Optional list of tag names to attach to this memory"),
  },
  async ({ content, tags }) => {
    const trimmed = content.trim();
    if (!trimmed) {
      return {
        content: [
          { type: "text" as const, text: "Error: Content cannot be empty." },
        ],
        isError: true,
      };
    }

    // Insert memory
    const { data: memory, error: memoryError } = await supabase
      .from("memories")
      .insert({ user_id: userId, content: trimmed })
      .select("id, created_at")
      .single();

    if (memoryError || !memory) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Failed to create memory: ${memoryError?.message ?? "unknown error"}`,
          },
        ],
        isError: true,
      };
    }

    // Handle tags
    const appliedTags: string[] = [];
    for (const tagName of tags ?? []) {
      const name = tagName.trim().toLowerCase();
      if (!name) continue;

      const { data: existingTag } = await supabase
        .from("tags")
        .select("id")
        .eq("user_id", userId)
        .eq("name", name)
        .single();

      let tagId: string;
      if (existingTag) {
        tagId = existingTag.id;
      } else {
        const { data: newTag, error: tagError } = await supabase
          .from("tags")
          .insert({ user_id: userId, name })
          .select("id")
          .single();

        if (tagError || !newTag) continue;
        tagId = newTag.id;
      }

      await supabase
        .from("memory_tags")
        .insert({ memory_id: memory.id, tag_id: tagId });
      appliedTags.push(name);
    }

    const result = {
      id: memory.id,
      created_at: memory.created_at,
      tags: appliedTags,
      message: "Memory created successfully.",
    };

    return {
      content: [
        { type: "text" as const, text: JSON.stringify(result, null, 2) },
      ],
    };
  }
);

// Tool: update_memory
server.tool(
  "update_memory",
  "Update a memory's content and/or tags.",
  {
    memory_id: z.string().describe("The UUID of the memory to update"),
    content: z
      .string()
      .optional()
      .describe("New text content (if omitted, content stays unchanged)"),
    tags: z
      .array(z.string())
      .optional()
      .describe(
        "New complete list of tag names. If provided, replaces all existing tags."
      ),
  },
  async ({ memory_id, content, tags }) => {
    // Verify ownership
    const { data: existing } = await supabase
      .from("memories")
      .select("id, content")
      .eq("id", memory_id)
      .eq("user_id", userId)
      .single();

    if (!existing) {
      return {
        content: [
          { type: "text" as const, text: "Memory not found." },
        ],
        isError: true,
      };
    }

    // Update content if provided
    if (content !== undefined) {
      const trimmed = content.trim();
      if (!trimmed) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Error: Content cannot be empty.",
            },
          ],
          isError: true,
        };
      }

      const { error: updateError } = await supabase
        .from("memories")
        .update({ content: trimmed, updated_at: new Date().toISOString() })
        .eq("id", memory_id);

      if (updateError) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to update: ${updateError.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    // Update tags if provided
    if (tags !== undefined) {
      // Get current tags
      const { data: currentTagLinks } = await supabase
        .from("memory_tags")
        .select("tag_id, tags(name)")
        .eq("memory_id", memory_id);

      const currentTagNames = new Set(
        (currentTagLinks ?? [])
          .map(
            (link) =>
              (link.tags as unknown as { name: string })?.name
          )
          .filter(Boolean)
      );

      const desiredTagNames = new Set(
        tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
      );

      // Remove tags no longer desired
      for (const link of currentTagLinks ?? []) {
        const name = (link.tags as unknown as { name: string })?.name;
        if (name && !desiredTagNames.has(name)) {
          await supabase
            .from("memory_tags")
            .delete()
            .eq("memory_id", memory_id)
            .eq("tag_id", link.tag_id);
        }
      }

      // Add new tags
      for (const tagName of desiredTagNames) {
        if (currentTagNames.has(tagName)) continue;

        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("user_id", userId)
          .eq("name", tagName)
          .single();

        let tagId: string;
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const { data: newTag, error: tagError } = await supabase
            .from("tags")
            .insert({ user_id: userId, name: tagName })
            .select("id")
            .single();

          if (tagError || !newTag) continue;
          tagId = newTag.id;
        }

        await supabase
          .from("memory_tags")
          .insert({ memory_id, tag_id: tagId });
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            id: memory_id,
            message: "Memory updated successfully.",
          }),
        },
      ],
    };
  }
);

// Tool: delete_memory
server.tool(
  "delete_memory",
  "Permanently delete a memory and all its associated media, tags links.",
  {
    memory_id: z.string().describe("The UUID of the memory to delete"),
  },
  async ({ memory_id }) => {
    // Verify ownership
    const { data: existing } = await supabase
      .from("memories")
      .select("id")
      .eq("id", memory_id)
      .eq("user_id", userId)
      .single();

    if (!existing) {
      return {
        content: [
          { type: "text" as const, text: "Memory not found." },
        ],
        isError: true,
      };
    }

    // Get media storage paths
    const { data: mediaRows } = await supabase
      .from("media")
      .select("storage_path")
      .eq("memory_id", memory_id);

    const storagePaths =
      mediaRows?.map((m) => m.storage_path as string) ?? [];

    // Delete from storage
    if (storagePaths.length > 0) {
      await supabase.storage.from("media").remove(storagePaths);
    }

    // Delete memory_tags
    await supabase.from("memory_tags").delete().eq("memory_id", memory_id);

    // Delete media rows
    await supabase.from("media").delete().eq("memory_id", memory_id);

    // Delete memory
    const { error: deleteError } = await supabase
      .from("memories")
      .delete()
      .eq("id", memory_id);

    if (deleteError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Failed to delete: ${deleteError.message}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            id: memory_id,
            message: "Memory deleted successfully.",
          }),
        },
      ],
    };
  }
);

// Tool: search_memories
server.tool(
  "search_memories",
  "Search memories using full-text keyword search across content.",
  {
    query: z
      .string()
      .min(1)
      .describe("The search query to find in memory content"),
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(20)
      .describe("Max results to return (default 20)"),
  },
  async ({ query, limit }) => {
    const { data: rows, error } = await supabase
      .from("memories")
      .select(
        "id, content, created_at, updated_at, memory_tags(tags(id, name)), media(id, type, storage_path)"
      )
      .eq("user_id", userId)
      .ilike("content", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return {
        content: [
          { type: "text" as const, text: `Search error: ${error.message}` },
        ],
        isError: true,
      };
    }

    const memories = ((rows ?? []) as unknown as MemoryRow[]).map(formatMemory);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { query, results: memories, total: memories.length },
            null,
            2
          ),
        },
      ],
    };
  }
);

// Tool: list_tags
server.tool(
  "list_tags",
  "List all tags with the number of memories associated with each tag.",
  {},
  async () => {
    // Get all tags
    const { data: tags, error } = await supabase
      .from("tags")
      .select("id, name, created_at")
      .eq("user_id", userId)
      .order("name");

    if (error) {
      return {
        content: [
          { type: "text" as const, text: `Error: ${error.message}` },
        ],
        isError: true,
      };
    }

    // Get counts for each tag
    const tagsWithCounts = [];
    for (const tag of tags ?? []) {
      const { count } = await supabase
        .from("memory_tags")
        .select("*", { count: "exact", head: true })
        .eq("tag_id", tag.id);

      tagsWithCounts.push({
        id: tag.id,
        name: tag.name,
        memory_count: count ?? 0,
      });
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { tags: tagsWithCounts, total: tagsWithCounts.length },
            null,
            2
          ),
        },
      ],
    };
  }
);

// Tool: get_stats
server.tool(
  "get_stats",
  "Get statistics about the user's memories — total counts, streaks, top tags, and activity summary.",
  {},
  async () => {
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalMemoriesRes,
      totalMediaRes,
      thisMonthRes,
      thisWeekRes,
      topTagsRes,
      firstMemoryRes,
      streakRes,
    ] = await Promise.all([
      supabase
        .from("memories")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("media")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("memories")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfMonth),
      supabase
        .from("memories")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfWeek.toISOString()),
      supabase.rpc("get_top_tags_for_year", {
        p_user_id: userId,
        p_year: now.getFullYear(),
      }),
      supabase
        .from("memories")
        .select("created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1),
      supabase.rpc("get_user_streaks", { p_user_id: userId }),
    ]);

    const totalMemories = totalMemoriesRes.count ?? 0;
    const totalMedia = totalMediaRes.count ?? 0;
    const memoriesThisMonth = thisMonthRes.count ?? 0;
    const memoriesThisWeek = thisWeekRes.count ?? 0;

    const topTags = (
      (topTagsRes.data as { name: string; count: number }[]) ?? []
    ).slice(0, 5);

    const firstMemoryDate =
      firstMemoryRes.data && firstMemoryRes.data.length > 0
        ? (firstMemoryRes.data[0].created_at as string)
        : null;

    const streakData = streakRes.data as
      | { current_streak: number; longest_streak: number }[]
      | null;
    const currentStreak = streakData?.[0]?.current_streak ?? 0;
    const longestStreak = streakData?.[0]?.longest_streak ?? 0;

    let averagePerWeek = 0;
    if (firstMemoryDate && totalMemories > 0) {
      const firstDate = new Date(firstMemoryDate);
      const diffMs = now.getTime() - firstDate.getTime();
      const diffWeeks = Math.max(diffMs / (7 * 24 * 60 * 60 * 1000), 1);
      averagePerWeek = Math.round((totalMemories / diffWeeks) * 10) / 10;
    }

    const result = {
      total_memories: totalMemories,
      total_media: totalMedia,
      memories_this_month: memoriesThisMonth,
      memories_this_week: memoriesThisWeek,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      average_per_week: averagePerWeek,
      top_tags_this_year: topTags,
      first_memory_date: firstMemoryDate,
    };

    return {
      content: [
        { type: "text" as const, text: JSON.stringify(result, null, 2) },
      ],
    };
  }
);

// Tool: get_calendar
server.tool(
  "get_calendar",
  "Get a calendar view showing which days have memories for a given month.",
  {
    year: z.number().describe("Year (e.g. 2025)"),
    month: z.number().min(1).max(12).describe("Month (1-12)"),
  },
  async ({ year, month }) => {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

    const { data, error } = await supabase.rpc("get_calendar_days", {
      p_user_id: userId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      return {
        content: [
          { type: "text" as const, text: `Error: ${error.message}` },
        ],
        isError: true,
      };
    }

    const days = (
      (data as { day: string; count: number }[]) ?? []
    ).map((d) => ({
      date: d.day,
      count: Number(d.count),
    }));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ year, month, days }, null, 2),
        },
      ],
    };
  }
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Memories MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
