import React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, Star } from "lucide-react";
import CourseIcon from "./CourseIcon";
import { CATEGORY_LABELS } from "@/lib/courseCategories";

export default function CourseCard({ course }) {
  const courseId = course._id || course.id;

  return (
    <Link to={`/course/${courseId}`} className="group block h-full">
      <div className="border border-border/40 rounded-sm p-5 hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <CourseIcon category={course.category} imageUrl={course.image_url} alt={course.title} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {course.course_code && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                  {course.course_code}
                </span>
              )}
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                {CATEGORY_LABELS[course.category] || course.category}
              </span>
            </div>
            <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
              {course.title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {course.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border/30 flex-wrap">
          <span className="px-2 py-0.5 rounded-sm bg-muted/60 uppercase tracking-wider text-[10px] font-semibold">
            {course.difficulty || "beginner"}
          </span>
          {course.duration_hours > 0 && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration_hours}h</span>
          )}
          {course.enrollment_count > 0 && (
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrollment_count}</span>
          )}
          {course.rating > 0 && (
            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {course.rating.toFixed(1)}</span>
          )}
          {course.instructor_name && <span className="ml-auto truncate max-w-[40%]">{course.instructor_name}</span>}
        </div>
      </div>
    </Link>
  );
}
