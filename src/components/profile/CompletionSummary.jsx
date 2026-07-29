import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, BookOpen } from "lucide-react";

export default function CompletionSummary({ courses, enrollments }) {
  const totalCourses = courses.length;
  const completedCount = enrollments.filter((e) => e.status === "completed").length;
  const completionRate = totalCourses > 0 ? (completedCount / totalCourses) * 100 : 0;

  const circumference = 2 * Math.PI * 52;
  const strokeOffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="border border-border/40 rounded-sm p-8 md:p-10 mb-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <svg width="130" height="130" className="transform -rotate-90">
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <motion.circle
              cx="65"
              cy="65"
              r="52"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeOffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold text-primary">
              {Math.round(completionRate)}%
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Complete</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-2">
            Overall Progress
          </p>
          <h3 className="font-display text-2xl font-bold mb-4">
            FUTO CS Mandatory Courses
          </h3>
          <div className="flex items-center gap-6 justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="font-display text-xl font-bold">{completedCount}</div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-display text-xl font-bold">{totalCourses}</div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
