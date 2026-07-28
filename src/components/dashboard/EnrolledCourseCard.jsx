import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, BookOpen, CheckCircle2 } from "lucide-react";

const contentTypeIcons = {
  video: Play,
  text: BookOpen,
  quiz: CheckCircle2,
  exercise: BookOpen,
};

export default function EnrolledCourseCard({ enrollment, course, index }) {
  const progress = enrollment.progress || 0;
  const completedModules = enrollment.completed_modules || [];
  const modules = course.modules || [];

  const nextModuleIndex = modules.findIndex((_, i) => !completedModules.includes(i));
  const nextModule = nextModuleIndex >= 0 ? modules[nextModuleIndex] : null;
  const isCompleted = enrollment.status === "completed";

  const NextIcon = nextModule ? contentTypeIcons[nextModule.content_type] || BookOpen : null;
  
  const courseId = course._id || course.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="border border-border/40 rounded-sm overflow-hidden hover:border-primary/30 transition-colors group"
    >
      {/* Header image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={course.image_url}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-1">
            {course.course_code && (
              <span className="text-[10px] font-mono font-bold text-primary bg-black/40 px-2 py-0.5 rounded-sm">
                {course.course_code}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-wider text-white/60">
              Level {course.level}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold text-white leading-snug line-clamp-1">
            {course.title}
          </h3>
        </div>
        {isCompleted && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-sm">
              <CheckCircle2 className="w-3 h-3" /> Done
            </span>
          </div>
        )}
      </div>

      {/* Progress + next module */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            {isCompleted ? "Completed" : "In Progress"}
          </span>
          <span className="text-xs font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {nextModule ? (
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Up Next</p>
            <div className="flex items-center gap-2">
              <NextIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-sm font-medium line-clamp-1">{nextModule.title}</span>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-sm text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> All modules complete
            </p>
          </div>
        )}

        <Link
          to={`/learn/${courseId}`}
          className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          {progress > 0 ? "Continue Learning" : "Start Course"}
        </Link>
      </div>
    </motion.div>
  );
}
