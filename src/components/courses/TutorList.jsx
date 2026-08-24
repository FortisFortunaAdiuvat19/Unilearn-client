import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Star, GraduationCap, MessageCircle, Loader2 } from "lucide-react";

function StarRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < Math.round(value) ? "fill-primary text-primary" : "text-border"}`} />
        ))}
      </span>
    </div>
  );
}

function RateTutor({ tutorId, courseId, onDone }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/tutors/${tutorId}/reviews`, { rating, comment, course_id: courseId });
      return res.data;
    },
    onSuccess: onDone,
  });

  return (
    <div className="border-t border-border/40 mt-3 pt-3 space-y-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}>
            <Star className={`w-5 h-5 ${n <= (hovered || rating) ? "fill-primary text-primary" : "text-border"}`} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment..."
        rows={2}
        className="w-full bg-transparent border border-border/40 rounded-sm p-2 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors resize-y"
      />
      <button
        type="button"
        disabled={rating === 0 || mutation.isPending}
        onClick={() => mutation.mutate()}
        className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {mutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Submit rating"}
      </button>
      {mutation.isError && <p className="text-xs text-destructive">Couldn't submit that rating.</p>}
    </div>
  );
}

export default function TutorList({ courseId }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ratingTutorId, setRatingTutorId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["course-tutors", courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/tutors/course/${courseId}`);
      return res.data;
    },
    enabled: !!courseId,
  });

  const connectMutation = useMutation({
    mutationFn: async (tutorId) => {
      const res = await apiClient.post(`/tutors/${tutorId}/connect`, { course_id: courseId });
      return res.data;
    },
    onSuccess: () => navigate("/community"),
  });

  const tutors = data?.tutors || [];

  if (isLoading || tutors.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <GraduationCap className="w-5 h-5 text-primary" />
        <h2 className="font-display text-2xl font-bold">Tutors for this course</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {tutors.map((tutor) => (
          <div key={tutor.tutor_id} className="border border-border/40 rounded-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-display text-base font-semibold">{tutor.name}</h3>
                {tutor.bio && <p className="text-xs text-muted-foreground mt-1">{tutor.bio}</p>}
              </div>
              <span className="text-xs font-bold text-primary whitespace-nowrap">{tutor.overall_rating}★ match</span>
            </div>
            <div className="space-y-1.5 mb-4">
              <StarRow label={`Course knowledge`} value={tutor.knowledge_rating} />
              <StarRow label={`Student reviews (${tutor.review_count})`} value={tutor.review_rating} />
              <StarRow label="Availability" value={tutor.availability_rating} />
            </div>
            <div className="flex flex-wrap gap-2">
              {user && user._id !== tutor.tutor_id && (
                <>
                  <button
                    onClick={() => connectMutation.mutate(tutor.tutor_id)}
                    disabled={connectMutation.isPending}
                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Connect
                  </button>
                  <button
                    onClick={() => setRatingTutorId(ratingTutorId === tutor.tutor_id ? null : tutor.tutor_id)}
                    className="inline-flex items-center gap-1.5 border border-border/60 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:border-primary/40 transition-colors"
                  >
                    Rate
                  </button>
                </>
              )}
            </div>
            {ratingTutorId === tutor.tutor_id && (
              <RateTutor tutorId={tutor.tutor_id} courseId={courseId} onDone={() => setRatingTutorId(null)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
