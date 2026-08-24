import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";

export default function ContentGenerator({ course }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState(null);

  const courseId = course._id || course.id;

  const handleGenerate = async () => {
    setStatus("generating");
    setError(null);

    try {
      const res = await apiClient.post(`/courses/${courseId}/generate-content`);
      const { documents_created = 0, videos_created = 0, assessment_created = false } = res.data || {};

      queryClient.invalidateQueries({ queryKey: ["course-documents", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-videos", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-assessments", courseId] });

      const parts = [];
      if (documents_created) parts.push(`${documents_created} note${documents_created === 1 ? "" : "s"}`);
      if (videos_created) parts.push(`${videos_created} video topic${videos_created === 1 ? "" : "s"}`);
      if (assessment_created) parts.push("1 practice test");
      setSummary(parts.length ? `Added ${parts.join(", ")}` : "Done, but nothing came back to add");

      setStatus("done");
      setTimeout(() => setStatus(null), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate content");
      setStatus(null);
    }
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={status === "generating"}
        className="inline-flex items-center gap-2 border border-primary/40 text-primary px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/5 transition-colors disabled:opacity-60"
      >
        {status === "generating" ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generating with Gemini...
          </>
        ) : status === "done" ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {summary || "Content generated!"}
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
