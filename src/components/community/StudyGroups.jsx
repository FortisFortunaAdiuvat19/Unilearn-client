import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, ArrowRight, BookOpen } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';

const avatarColors = [
  "bg-rose-100 text-rose-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];

function getAvatarProps(userId) {
  const hash = (userId || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = avatarColors[hash % avatarColors.length];
  const initials = (userId || "??").substring(0, 2).toUpperCase();
  return { color, initials };
}

export default function StudyGroups() {
  const { user: currentUser } = useAuth();

  const { data: enrollments = [] } = useQuery({
    queryKey: ["sg-enrollments"],
    queryFn: async () => {
      const res = await apiClient.get("/enrollments");
      return res.data;
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["sg-courses"],
    queryFn: async () => {
      const res = await apiClient.get("/courses");
      return res.data;
    },
  });

  const groups = React.useMemo(() => {
    const active = enrollments.filter(
      (e) => e.status === "active" || e.status === "paused"
    );
    const grouped = {};
    active.forEach((e) => {
      if (!grouped[e.course_id]) grouped[e.course_id] = [];
      grouped[e.course_id].push(e);
    });

    return Object.entries(grouped)
      .map(([courseId, members]) => {
        const course = courses.find((c) => c._id === courseId);
        return {
          courseId,
          course,
          members,
          memberCount: members.length,
          isUserEnrolled: members.some((m) => m.student_id === currentUser?.uid),
        };
      })
      .filter((g) => g.course)
      .sort((a, b) => {
        if (a.course.level !== b.course.level) return a.course.level - b.course.level;
        if (a.course.semester !== b.course.semester)
          return a.course.semester - b.course.semester;
        return b.memberCount - a.memberCount;
      });
  }, [enrollments, courses, currentUser]);

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Study Groups
          </p>
        </div>
        {groups.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {groups.length} active group{groups.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Study groups form automatically when students enroll in the same mandatory FUTO
        course. Connect with peers tackling the same curriculum to collaborate and
        share insights.
      </p>

      {groups.length === 0 ? (
        <div className="border border-border/30 rounded-sm p-8 text-center">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-display text-lg font-semibold mb-1">
            No active study groups yet
          </p>
          <p className="text-sm text-muted-foreground">
            Enroll in a course to join a study group.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, i) => (
            <motion.div
              key={group.courseId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`border rounded-sm p-5 flex flex-col ${
                group.isUserEnrolled
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/40"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  {group.course.course_code && (
                    <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                      {group.course.course_code}
                    </span>
                  )}
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5">
                    Level {group.course.level} ·{" "}
                    {group.course.semester === 1 ? "Harmattan" : "Rain"}
                  </p>
                </div>
                {group.isUserEnrolled && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary border border-primary/30 px-2 py-0.5 rounded-sm">
                    You're here
                  </span>
                )}
              </div>

              <h3 className="font-display text-base font-semibold mb-3 leading-snug">
                {group.course.title}
              </h3>

              <div className="flex items-center gap-2 mb-4 mt-auto">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 4).map((m) => {
                    const av = getAvatarProps(m.student_id);
                    return (
                      <div
                        key={m._id}
                        className={`w-8 h-8 rounded-full ${av.color} flex items-center justify-center text-[10px] font-bold border-2 border-background`}
                      >
                        {av.initials}
                      </div>
                    );
                  })}
                </div>
                <span className="text-xs text-muted-foreground">
                  {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                </span>
              </div>

              <Link
                to={`/course/${group.courseId}`}
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary hover:gap-2 transition-all"
              >
                View Course <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
