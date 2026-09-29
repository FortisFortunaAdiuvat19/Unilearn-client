import React, { useState } from "react";
import apiClient from "@/api/apiClient";
import { ClipboardCheck, Loader2, CheckCircle2 } from "lucide-react";

// Admin-only trigger for the one, fixed tutor_qualification assessment a
// course needs before students can become tutors for it (see BecomeTutor.jsx
// and AssessmentPlayer.jsx). Distinct from ContentGenerator: this call is
// idempotent server-side — the first click generates it with Gemini, every
// click after that just confirms it already exists rather than spending
// another Gemini call to regenerate it.
export default function TutorAssessmentGenerator({ course }) {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  const courseId = course._id || course.id;

  const handleGenerate = async () => {
    setStatus("generating");
    setError(null);

    try {
      const res = await apiClient.post(`/courses/${courseId}/tutor-assessment`);
      const { created } = res.data || {};
      setMessage(created ? "Tutor assessment generated" : "Tutor assessment already exists");
      setStatus("done");
      setTimeout(() => setStatus(null), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate tutor assessment");
      setStatus(null);
    }
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={status === "generating"}
        className="inline-flex items-center gap-2 border border-amber-500/40 text-amber-600 px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-amber-500/5 transition-colors disabled:opacity-60"
      >
        {status === "generating" ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generating with Gemini...
          </>
        ) : status === "done" ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {message}
          </>
        ) : (
          <>
            <ClipboardCheck className="w-3.5 h-3.5" />
            Generate Tutor Assessment
          </>
        )}
      </button>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
