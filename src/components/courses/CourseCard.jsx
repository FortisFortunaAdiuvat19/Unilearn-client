import React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, Star } from "lucide-react";

const categoryLabels = {
  CSC: "Computer Science",
  CIT: "Computer Info Tech",
  MTH: "Mathematics",
  PHY: "Physics",
  CHM: "Chemistry",
  BIO: "Biology",
  ENG: "Engineering",
  GST: "General Studies",
  STA: "Statistics",
  IFT: "Info Technology",
  SIW: "Industrial Training",
};

export default function CourseCard({ course, categoryImages }) {
  const courseId = course._id || course.id;

  return (
    <Link to={`/course/${courseId}`} className="group block">
      <div className="border border-border/40 rounded-sm overflow-hidden hover:border-primary/30 transition-all duration-300">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={course.image_url || categoryImages?.[course.category] || categoryImages?.default}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="glass-terminal text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-sm">
              {course.difficulty || "beginner"}
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            {course.course_code && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                {course.course_code}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              {categoryLabels[course.category] || course.category}
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold leading-snug mb-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {course.duration_hours > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {course.duration_hours}h
              </span>
            )}
            {course.enrollment_count > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {course.enrollment_count}
              </span>
            )}
            {course.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" /> {course.rating.toFixed(1)}
              </span>
            )}
            {course.instructor_name && (
              <span className="ml-auto">{course.instructor_name}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
