"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  aiEnabled?: boolean;
}

export function SearchBar({ aiEnabled = false }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const currentMode = searchParams.get("mode") ?? "keyword";
  const [value, setValue] = useState(currentQuery);
  const [semantic, setSemantic] = useState(currentMode === "semantic");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync input when URL changes externally (e.g. back/forward navigation)
  useEffect(() => {
    setValue(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    setSemantic(currentMode === "semantic");
  }, [currentMode]);

  const pushQuery = useCallback(
    (q: string, isSemantic: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      if (isSemantic && q) {
        params.set("mode", "semantic");
      } else {
        params.delete("mode");
      }
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => pushQuery(next, semantic), 300);
  };

  const handleClear = () => {
    setValue("");
    clearTimeout(timerRef.current);
    pushQuery("", false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  const toggleSemantic = () => {
    const next = !semantic;
    setSemantic(next);
    if (value) {
      clearTimeout(timerRef.current);
      pushQuery(value, next);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={semantic ? "Semantic search..." : "Search memories..."}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {aiEnabled && (
        <Button
          variant={semantic ? "default" : "outline"}
          size="sm"
          onClick={toggleSemantic}
          title={semantic ? "Switch to keyword search" : "Switch to AI semantic search"}
          className="text-xs px-3"
        >
          AI
        </Button>
      )}
    </div>
  );
}
