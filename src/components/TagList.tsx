"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { renameTag, deleteTag } from "@/app/dashboard/tags/tag-management-actions";
import type { TagWithCount } from "@/types";

interface TagListProps {
  tags: TagWithCount[];
}

export function TagList({ tags: initialTags }: TagListProps) {
  const [tags, setTags] = useState(initialTags);
  const [renameOpen, setRenameOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithCount | null>(null);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  const openRename = (tag: TagWithCount) => {
    setEditingTag(tag);
    setNewName(tag.name);
    setRenameOpen(true);
  };

  const handleRename = () => {
    if (!editingTag || !newName.trim()) return;
    startTransition(async () => {
      const result = await renameTag(editingTag.id, newName);
      if (result.success) {
        setTags((prev) =>
          prev.map((t) =>
            t.id === editingTag.id ? { ...t, name: newName.trim() } : t
          )
        );
        toast.success("Tag renamed");
        setRenameOpen(false);
      } else {
        toast.error(result.error || "Failed to rename tag");
      }
    });
  };

  const handleDelete = (tag: TagWithCount) => {
    startTransition(async () => {
      const result = await deleteTag(tag.id);
      if (result.success) {
        setTags((prev) => prev.filter((t) => t.id !== tag.id));
        toast.success("Tag deleted");
      } else {
        toast.error(result.error || "Failed to delete tag");
      }
    });
  };

  return (
    <>
      <div className="space-y-2">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <Link href={`/dashboard?tag=${tag.id}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {tag.name}
                </Badge>
              </Link>
              <span className="text-sm text-muted-foreground">
                {tag.memory_count} {tag.memory_count === 1 ? "memory" : "memories"}
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openRename(tag)}
                disabled={isPending}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isPending}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete tag &ldquo;{tag.name}&rdquo;?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the tag from {tag.memory_count}{" "}
                      {tag.memory_count === 1 ? "memory" : "memories"}.
                      Your memories will not be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => handleDelete(tag)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename tag</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
            placeholder="Tag name"
          />
          <DialogFooter>
            <Button onClick={handleRename} disabled={isPending || !newName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
