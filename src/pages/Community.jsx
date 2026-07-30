import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import EnrolledCourseCard from "@/components/dashboard/EnrolledCourseCard";
import StudyGroups from "@/components/community/StudyGroups";
import ChatRooms from "@/components/community/ChatRooms";
import { useAuth } from '@/lib/AuthContext';

export default function Community() {
  const { user } = useAuth();

  const { data: courses = [] } = useQuery({
    queryKey: ["all-courses-dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/courses");
      return res.data;
    },
  });

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const res = await apiClient.get("/enrollments/me");
      return res.data;
    },
  });

  const enrolledCourses = enrollments
    .map((e) => {
      const course = courses.find((c) => c._id === e.course_id);
      return { enrollment: e, course };
    })
    .filter((e) => e.course);

  const completedCount = enrolledCourses.filter(
    (e) => e.enrollment.status === "completed"
  ).length;
  const inProgressCount = enrolledCourses.filter(
    (e) => e.enrollment.status !== "completed"
  ).length;
  const avgProgress =
    enrolledCourses.length > 0
      ? enrolledCourses.reduce(
          (sum, e) => sum + (e.enrollment.progress || 0),
          0
        ) / enrolledCourses.length
      : 0;

  const stats = [
    { label: "Enrolled", value: enrolledCourses.length, icon: BookOpen, color: "text-primary" },
    { label: "In Progress", value: inProgressCount, icon: Clock, color: "text-amber-500" },
    { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Avg Progress", value: `${Math.round(avgProgress)}%`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[90rem] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-3">
            Community
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Welcome back, {user?.displayName?.split(" ")[0] || user?.email?.split('@')[0] || "Student"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Track your progress, join study groups, and collaborate in chatrooms.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border border-border/40 rounded-sm p-5"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <div className="font-display text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Continue Learning */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-6">Continue Learning</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="border border-border/30 rounded-sm animate-pulse"
                  >
                    <div className="h-32 bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-muted rounded w-2/3" />
                      <div className="h-2 bg-muted rounded w-full" />
                      <div className="h-8 bg-muted rounded w-full" />
                    </div>
                  </div>
                ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="text-center py-16 border border-border/30 rounded-sm">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">
                No courses yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Enroll in courses to start tracking your progress here.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((item, i) => (
                <EnrolledCourseCard
                  key={item.enrollment._id}
                  enrollment={item.enrollment}
                  course={item.course}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* Study Groups */}
        <StudyGroups />

        {/* Chatrooms */}
        <ChatRooms />
      </div>
    </div>
  );
}
