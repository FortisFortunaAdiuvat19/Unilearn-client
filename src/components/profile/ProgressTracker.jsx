import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, TrendingUp } from "lucide-react";

const LEVELS = [100, 200, 300, 400, 500];

export default function ProgressTracker({ courses, enrollments }) {
  const totalCourses = courses.length;

  const completed = enrollments.filter((e) => e.status === "completed");
  const inProgress = enrollments.filter((e) => e.status === "active" || e.status === "paused");
  const notStarted = Math.max(0, totalCourses - completed.length - inProgress.length);
  const completionRate = totalCourses > 0 ? (completed.length / totalCourses) * 100 : 0;

  const levelStats = LEVELS.map((level) => {
    const levelCourseIds = courses.filter((c) => c.level === level).map((c) => c._id || c.id);
    const levelCompleted = completed.filter((e) => levelCourseIds.includes(e.course_id)).length;
    const total = levelCourseIds.length;
    return {
      level,
      total,
      completed: levelCompleted,
      rate: total > 0 ? (levelCompleted / total) * 100 : 0,
    };
  });

  return (
    <div className="space-y-8">
      {/* Overall progress */}
      <div className="border border-border/40 rounded-sm p-8 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-2">
              Curriculum Progress
            </p>
            <h3 className="font-display text-2xl font-bold">FUTO CS Degree Completion</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tracking {totalCourses} mandatory courses across all levels
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="font-display text-5xl font-bold text-primary">
              {Math.round(completionRate)}%
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Complete</p>
          </div>
        </div>

        {/* Main progress bar */}
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-primary rounded-full"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center border border-border/30 rounded-sm p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
            <div className="font-display text-2xl font-bold">{completed.length}</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
          </div>
          <div className="text-center border border-border/30 rounded-sm p-4">
            <Clock className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <div className="font-display text-2xl font-bold">{inProgress.length}</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">In Progress</p>
          </div>
          <div className="text-center border border-border/30 rounded-sm p-4">
            <Circle className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <div className="font-display text-2xl font-bold">{notStarted}</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Not Started</p>
          </div>
        </div>
      </div>

      {/* Per-level breakdown */}
      <div className="border border-border/40 rounded-sm p-8 md:p-10">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-display text-xl font-bold">Progress by Level</h3>
        </div>
        <div className="space-y-5">
          {levelStats.map((stat) => (
            <div key={stat.level}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Level {stat.level}</span>
                <span className="text-sm text-muted-foreground">
                  {stat.completed} / {stat.total} courses
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.rate}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-primary rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
