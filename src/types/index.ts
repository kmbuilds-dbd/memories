export interface Memory {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  memory_id: string;
  user_id: string;
  type: "photo" | "video";
  storage_path: string;
  thumbnail_path: string | null;
  display_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface MemoryTag {
  memory_id: string;
  tag_id: string;
  created_at: string;
}

export interface CreateMemoryInput {
  content: string;
  tagNames: string[];
  mediaFiles: MediaFileInput[];
}

export interface MediaFileInput {
  storagePath: string;
  type: "photo" | "video";
  displayOrder: number;
}

export interface StagedFile {
  id: string;
  file: File;
  type: "photo" | "video";
  preview: string;
  status: "pending" | "compressing" | "uploading" | "done" | "error";
  storagePath?: string;
  error?: string;
}

export interface CreateMemoryResult {
  success: boolean;
  memoryId?: string;
  error?: string;
}

export interface UpdateMemoryInput {
  memoryId: string;
  content: string;
  tagNames: string[];
  newMediaFiles: MediaFileInput[];
  deletedMediaIds: string[];
}

export interface ExistingMedia {
  id: string;
  type: "photo" | "video";
  storagePath: string;
  url: string;
}

export interface MemoryPreview {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags: { id: string; name: string }[];
  media: { id: string; type: "photo" | "video"; storage_path: string; url: string }[];
}

export interface MemoryPage {
  memories: MemoryPreview[];
  nextCursor: string | null;
}

export interface MemoryFilters {
  query?: string;
  tagId?: string;
  mode?: "keyword" | "semantic";
}

export interface TagWithCount extends Tag {
  memory_count: number;
}

// Phase 6: Calendar, Stats, Year in Review

export interface CalendarDay {
  date: string;
  count: number;
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
}

export interface UserStats {
  totalMemories: number;
  totalMedia: number;
  memoriesThisMonth: number;
  memoriesThisWeek: number;
  currentStreak: number;
  longestStreak: number;
  topTags: { name: string; count: number }[];
  firstMemoryDate: string | null;
  averagePerWeek: number;
}

export interface YearInReviewMonth {
  month: number;
  monthName: string;
  memoryCount: number;
  memories: MemoryPreview[];
}

export interface YearInReview {
  year: number;
  totalMemories: number;
  totalMedia: number;
  topTags: { name: string; count: number }[];
  months: YearInReviewMonth[];
  availableYears: number[];
}

// Phase 7: AI Semantic Search + Tag Discovery

export interface SemanticSearchResult extends MemoryPreview {
  similarity: number;
}

export interface TagSuggestion {
  memoryId: string;
  memoryContentPreview: string;
  suggestedTags: string[];
  reasoning: string;
}

export interface TagDiscoveryResult {
  suggestions: TagSuggestion[];
  newTagIdeas: { name: string; description: string }[];
}

export interface EmbeddingStatus {
  totalMemories: number;
  embeddedCount: number;
  unembeddedCount: number;
}
