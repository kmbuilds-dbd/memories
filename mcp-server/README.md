# Memories MCP Server

An MCP (Model Context Protocol) server that lets Claude interact with your Memories app — creating, browsing, searching, and managing your memories directly from conversation.

## Setup

### 1. Get your Supabase credentials

You need three values:

- **SUPABASE_URL** — your Supabase project URL (e.g. `https://xxx.supabase.co`)
- **SUPABASE_SERVICE_ROLE_KEY** — found in Supabase Dashboard → Settings → API → `service_role` key
- **MEMORIES_USER_ID** — your user's UUID from the `auth.users` table

To find your user ID, run this in the Supabase SQL editor:

```sql
SELECT id, email FROM auth.users;
```

### 2. Build

```bash
cd mcp-server
npm install
npm run build
```

### 3. Configure Claude

Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "memories": {
      "command": "node",
      "args": ["/absolute/path/to/memories/mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key",
        "MEMORIES_USER_ID": "your-user-uuid"
      }
    }
  }
}
```

For Claude Code, add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "memories": {
      "command": "node",
      "args": ["/absolute/path/to/memories/mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key",
        "MEMORIES_USER_ID": "your-user-uuid"
      }
    }
  }
}
```

### 4. Restart Claude

After saving the config, restart Claude Desktop or Claude Code. You should see the Memories tools available.

## Available Tools

| Tool | Description |
|------|-------------|
| `list_memories` | Browse memories with optional keyword search and tag filtering. Supports pagination. |
| `get_memory` | Get a single memory by ID with full details (tags, media info). |
| `create_memory` | Create a new memory with optional tags. |
| `update_memory` | Update a memory's content and/or replace its tags. |
| `delete_memory` | Permanently delete a memory and its associated data. |
| `search_memories` | Full-text keyword search across memory content. |
| `list_tags` | List all tags with memory counts. |
| `get_stats` | Get stats — totals, streaks, top tags, activity. |
| `get_calendar` | Get a calendar view of which days have memories for a given month. |

## Example prompts

- "What memories do I have from last week?"
- "Create a memory: Had an amazing hike at Mt. Tam today, the sunset was unreal. Tag it with hiking and nature."
- "Search my memories for anything about cooking"
- "Show me my memory stats"
- "What tags do I use the most?"
