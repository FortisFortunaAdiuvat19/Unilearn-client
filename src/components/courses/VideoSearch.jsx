import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Check, Loader2, Youtube, ExternalLink } from "lucide-react";

function formatViews(n) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K views`;
  return `${n} views`;
}

export default function VideoSearch({ courseId, courseTitle }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(courseTitle || "");
  const [results, setResults] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());

  const searchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.get("/youtube/search", { params: { q: query } });
      return res.data.results || [];
    },
    onSuccess: (data) => setResults(data),
  });

  const addMutation = useMutation({
    mutationFn: async (video) => {
      const description = [video.channel, video.duration_display].filter(Boolean).join(" — ");
      const res = await apiClient.post(`/courses/${courseId}/videos`, {
        title: video.title,
        url: video.url,
        description,
        duration_minutes: video.duration_minutes || undefined,
      });
      return res.data;
    },
    onSuccess: (_data, video) => {
      setAddedIds((prev) => new Set(prev).add(video.video_id));
      queryClient.invalidateQueries({ queryKey: ["course-videos", courseId] });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 border border-primary/40 text-primary px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/5 transition-colors">
          <Youtube className="w-3.5 h-3.5" /> Add Video
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search YouTube</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => { e.preventDefault(); if (query.trim()) searchMutation.mutate(); }}
          className="flex gap-2 mb-4"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. binary search trees explained"
          />
          <Button type="submit" disabled={!query.trim() || searchMutation.isPending}>
            {searchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>

        {searchMutation.isError && (
          <p className="text-sm text-destructive mb-4">
            {searchMutation.error?.response?.data?.message
              || (searchMutation.error?.request
                    ? `No response from the server (${searchMutation.error.message}). This usually means a CORS or network issue reaching the backend.`
                    : searchMutation.error?.message)
              || "Search failed."}
          </p>
        )}

        {searchMutation.isSuccess && results.length === 0 && (
          <p className="text-sm text-muted-foreground">No results for that search.</p>
        )}

        <div className="space-y-3">
          {results.map((video) => {
            const isAdded = addedIds.has(video.video_id);
            return (
              <div key={video.video_id} className="flex gap-3 border border-border/40 rounded-sm p-3">
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt=""
                    className="w-32 h-20 object-cover rounded-sm flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {video.channel}
                    {video.duration_display && ` · ${video.duration_display}`}
                    {formatViews(video.view_count) && ` · ${formatViews(video.view_count)}`}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Preview
                    </a>
                    <button
                      onClick={() => addMutation.mutate(video)}
                      disabled={isAdded || addMutation.isPending}
                      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary disabled:opacity-60 disabled:text-muted-foreground"
                    >
                      {isAdded ? (
                        <><Check className="w-3.5 h-3.5" /> Added</>
                      ) : (
                        <><Plus className="w-3.5 h-3.5" /> Add to course</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
