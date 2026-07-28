import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Users } from "lucide-react";

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

export default function FeaturedCourses({ courses, categoryImages }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-[90rem] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-3">
              Cognitive Catalog
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Explore Courses
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 border border-border/60 rounded-sm flex items-center justify-center hover:border-primary/60 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 border border-border/60 rounded-sm flex items-center justify-center hover:border-primary/60 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scrolling shelf */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6 md:-mx-10 md:px-10"
        >
          {courses.map((course, i) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 w-[280px] md:w-[300px] group"
            >
              <Link to={`/course/${course._id}`} className="block">
                {/* Vertical slice card */}
                <div className="relative overflow-hidden rounded-sm aspect-[3/4] mb-4">
                  <img
                    src={course.image_url || categoryImages[course.category] || categoryImages.default}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  
                  {/* Difficulty badge */}
                  <div className="absolute top-4 left-4">
                    <span className="glass-terminal text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-sm">
                      {course.difficulty || "beginner"}
                    </span>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      {course.course_code && (
                        <span className="text-[10px] font-mono font-bold text-primary bg-black/40 px-2 py-0.5 rounded-sm">
                          {course.course_code}
                        </span>
                      )}
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                        {categoryLabels[course.category] || course.category}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-white leading-snug">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-3 text-white/60 text-xs">
                      {course.duration_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration_hours}h
                        </span>
                      )}
                      {course.enrollment_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.enrollment_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* View all card */}
          <div className="flex-shrink-0 w-[280px] md:w-[300px]">
            <Link
              to="/courses"
              className="block aspect-[3/4] border border-border/40 rounded-sm flex flex-col items-center justify-center gap-4 hover:border-primary/40 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full border border-border/60 flex items-center justify-center group-hover:border-primary/60 transition-colors">
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                View All Courses
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
