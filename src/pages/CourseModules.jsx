import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Lock, Sparkles, Loader2, AlertCircle, ChevronRight
} from "lucide-react";

export default function CourseModules() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();

  const { data: course } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => (await apiClient.get(`/courses/${id}`)).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["course-modules", id],
    queryFn: async () => (await apiClient.get(`/courses/${id}/modules`)).data,
    // Picks up 'generating' -> 'ready' transitions without the user
    // needing to manually refresh.
    refetchInterval: (query) =>
      query.state.data?.modules?.some((m) => m.status === "generating") ? 3000 : false,
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", id],
    queryFn: async () => {
      try {
        return (await apiClient.get(`/enrollments/course/${id}`)).data;
      } catch {
        return null;
      }
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (weekIndex) =>
      apiClient.post(`/courses/${id}/modules/${weekIndex}/generate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course-modules", id] }),
  });

  const completedWeeks = new Set(enrollment?.completed_modules || []);
  const modules = data?.modules || [];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <Link
          to={`/course/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to course
        </Link>

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-3">
          {course?.course_code}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">
          {course?.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-12">
          Work through each week's topics as a set of short lessons and quick checks.
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-20 border border-border/30 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-20 border border-border/30 rounded-sm">
            <p className="font-display text-xl font-semibold mb-2">No scheme of work yet</p>
            <p className="text-sm text-muted-foreground">
              This course doesn't have a week-by-week breakdown to build modules from.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((m, i) => (
              <motion.div
                key={m.week_index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border border-border/40 rounded-sm p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
                    {completedWeeks.has(m.week_index) ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                    ) : m.status === "ready" ? (
                      <span className="text-xs font-semibold text-muted-foreground">{i + 1}</span>
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">{m.week}</p>
                    <p className="font-medium text-sm truncate">{m.topic}</p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {m.status === "ready" ? (
                    <button
                      onClick={() => navigate(`/learn/${id}/module/${m.week_index}`)}
                      className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      {completedWeeks.has(m.week_index) ? "Review" : "Start"} <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : m.status === "generating" ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                    </span>
                  ) : m.status === "failed" && isAdmin ? (
                    <button
                      onClick={() => generateMutation.mutate(m.week_index)}
                      className="flex items-center gap-1.5 text-xs text-destructive hover:underline"
                    >
                      <AlertCircle className="w-3.5 h-3.5" /> Failed — Retry
                    </button>
                  ) : isAdmin ? (
                    <button
                      onClick={() => generateMutation.mutate(m.week_index)}
                      disabled={generateMutation.isPending}
                      className="flex items-center gap-1.5 text-xs font-medium border border-primary/40 text-primary px-3 py-1.5 rounded-sm hover:bg-primary/5 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Generate
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not yet available</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
