"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { fetchUserTags } from "@/app/dashboard/capture/tag-actions";
import type { Tag } from "@/types";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");
  const [existingTags, setExistingTags] = useState<Tag[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserTags().then(setExistingTags);
  }, []);

  const filtered = input.trim()
    ? existingTags.filter(
        (t) =>
          t.name.includes(input.trim().toLowerCase()) &&
          !tags.includes(t.name)
      )
    : [];

  const showCreate =
    input.trim() &&
    !tags.includes(input.trim().toLowerCase()) &&
    !existingTags.some((t) => t.name === input.trim().toLowerCase());

  const suggestions = [
    ...filtered.map((t) => ({ label: t.name, value: t.name })),
    ...(showCreate
      ? [{ label: `Create "${input.trim()}"`, value: input.trim().toLowerCase() }]
      : []),
  ];

  const addTag = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (normalized && !tags.includes(normalized)) {
      onChange([...tags, normalized]);
    }
    setInput("");
    setShowDropdown(false);
    setHighlightIndex(-1);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        addTag(suggestions[highlightIndex].value);
      } else if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="text-sm font-medium">Tags</label>
      <div className="relative">
        <div className="flex flex-wrap gap-1.5 rounded-md border p-2 focus-within:ring-2 focus-within:ring-ring">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowDropdown(true);
              setHighlightIndex(-1);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => {
              // Delay to allow click on dropdown
              setTimeout(() => setShowDropdown(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? "Add tags..." : ""}
            className="h-7 min-w-[120px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>

        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
            {suggestions.map((s, i) => (
              <button
                key={s.value}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${
                  i === highlightIndex ? "bg-accent" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(s.value);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
