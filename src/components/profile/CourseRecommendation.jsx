import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, GraduationCap, BookOpen } from "lucide-react";

export default function CourseRecommendation({ courses, enrollments }) {
  const completedCourseIds = new Set(
    enrollments.filter((e) => e.status === "completed").map((e) => e.course_id)
  );
  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  const availableCourses = courses
    .filter((c) => !completedCourseIds.has(c._id || c.id) && !enrolledCourseIds.has(c._id || c.id))
    .sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      if (a.semester !== b.semester) return a.semester - b.semester;
      return (a.course_code || "").localeCompare(b.course_code || "");
    });

  const currentLevel = Math.max(
    0,
    ...enrollments
      .map((e) => courses.find((c) => (c._id || c.id) === e.course_id)?.level)
      .filter(Boolean)
  );

  const levelCompletion = {};
  courses.forEach((c) => {
    if (!levelCompletion[c.level]) levelCompletion[c.level] = { total: 0, completed: 0 };
    levelCompletion[c.level].total++;
    if (completedCourseIds.has(c._id || c.id)) levelCompletion[c.level].completed++;
  });

  if (availableCourses.length === 0) {
    return (
      <div className="border border-border/40 rounded-sm p-8 md:p-10 text-center mb-8">
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
        <h3 className="font-display text-2xl font-bold mb-2">Curriculum Complete!</h3>
        <p className="text-sm text-muted-foreground">
          You've completed or enrolled in all mandatory FUTO CS courses. Outstanding work!
        </p>
      </div>
    );
  }

  const recommendation = availableCourses[0];
  const recLevelData = levelCompletion[recommendation.level];

  let reason;
  if (currentLevel === 0) {
    reason = "Start your journey with the foundational course of the FUTO CS curriculum.";
  } else if (recommendation.level > currentLevel) {
    reason = `You've progressed through Level ${currentLevel}. Time to advance to Level ${recommendation.level}.`;
  } else {
    reason = `Continue completing your Level ${recommendation.level} mandatory courses.`;
  }

  return (
    <div className="border border-primary/30 rounded-sm overflow-hidden bg-primary/5 mb-8">
      <div className="p-8 md:p-10">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Recommended Next
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {recommendation.course_code && (
                <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-sm">
                  {recommendation.course_code}
                </span>
              )}
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Level {recommendation.level} ·{" "}
                {recommendation.semester === 1 ? "Harmattan" : "Rain"} Semester
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold mb-3">{recommendation.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
              {recommendation.description}
            </p>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <GraduationCap className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
              <span>{reason}</span>
            </div>
          </div>

          <div className="flex md:flex-col items-center justify-center gap-4 md:min-w-[160px]">
            {recLevelData && (
              <div className="text-center">
                <div className="font-display text-2xl font-bold">
                  {recLevelData.completed}/{recLevelData.total}
                </div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Level {recommendation.level} Done
                </p>
              </div>
            )}
            <Link
              to={`/course/${recommendation._id || recommendation.id}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              View Course
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {availableCourses.length > 1 && (
          <div className="mt-6 pt-6 border-t border-border/30 flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span>
              {availableCourses.length - 1} more course
              {availableCourses.length - 1 !== 1 ? "s" : ""} waiting in your curriculum
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
