import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";

export default function ContentGenerator({ course }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const courseId = course._id || course.id;

  const handleGenerate = async () => {
    setStatus("generating");
    setError(null);

    try {
      // The backend now handles the Gemini LLM Prompt and DB creation
      await apiClient.post(`/courses/${courseId}/generate-content`);

      queryClient.invalidateQueries({ queryKey: ["course-documents", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-videos", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-assessments", courseId] });

      setStatus("done");
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate content");
      setStatus(null);
    }
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={status === "generating" || status === "saving"}
        className="inline-flex items-center gap-2 border border-primary/40 text-primary px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/5 transition-colors disabled:opacity-60"
      >
        {status === "generating" ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Searching web & generating...
          </>
        ) : status === "saving" ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Saving content...
          </>
        ) : status === "done" ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Content generated!
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />
            Generate Course Content
          </>
        )}
      </button>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
