import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { BookOpen, ChevronRight } from "lucide-react";
import ProgressTracker from "@/components/profile/ProgressTracker";
import CourseRecommendation from "@/components/profile/CourseRecommendation";
import CompletionSummary from "@/components/profile/CompletionSummary";
import PerformanceInsights from "@/components/profile/PerformanceInsights";
import StreakCounter from "@/components/profile/StreakCounter";
import { useAuth } from '@/lib/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  const { data: courses = [] } = useQuery({
    queryKey: ["all-courses-profile"],
    queryFn: async () => {
      const res = await apiClient.get("/courses");
      return res.data;
    },
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const res = await apiClient.get("/enrollments/me");
      return res.data;
    },
  });

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6 md:px-10">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-3">
            Student Profile
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            {user?.displayName || user?.email?.split('@')[0] || "Student"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{user?.email}</p>
        </div>

        <Link
          to="/my-courses"
          className="flex items-center justify-between border border-border/40 rounded-sm p-5 mb-8 hover:border-primary/30 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-display text-lg font-semibold">My Courses</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        <StreakCounter user={user} />

        <CompletionSummary courses={courses} enrollments={enrollments} />
        <PerformanceInsights />
        <CourseRecommendation courses={courses} enrollments={enrollments} />
        <ProgressTracker courses={courses} enrollments={enrollments} />
      </div>
    </div>
  );
}
