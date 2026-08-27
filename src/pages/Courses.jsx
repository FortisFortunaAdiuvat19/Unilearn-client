import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";
import CourseCard from "@/components/courses/CourseCard";
import { CATEGORY_FILTERS } from "@/lib/courseCategories";

const levels = [
  { value: "all", label: "All Levels" },
  { value: 100, label: "100 Level" },
  { value: 200, label: "200 Level" },
  { value: 300, label: "300 Level" },
  { value: 400, label: "400 Level" },
  { value: 500, label: "500 Level" },
];

const semesters = [
  { value: "all", label: "Both Semesters" },
  { value: 1, label: "Harmattan" },
  { value: 2, label: "Rain" },
];

export default function Courses() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCat = urlParams.get("cat") || "all";
  const initialQ = urlParams.get("q") || "";

  const [search, setSearch] = useState(initialQ);
  const [category, setCategory] = useState(initialCat);
  const [level, setLevel] = useState("all");
  const [semester, setSemester] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await apiClient.get("/courses");
      return res.data;
    },
  });

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch = !search || 
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase()) ||
        c.course_code?.toLowerCase().includes(search.toLowerCase()) ||
        c.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchCat = category === "all" || c.category === category;
      const matchLevel = level === "all" || c.level === level;
      const matchSem = semester === "all" || c.semester === semester;
      return matchSearch && matchCat && matchLevel && matchSem;
    });
  }, [courses, search, category, level, semester]);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[90rem] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-3">
            FUTO CS Curriculum
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Discover Courses
          </h1>
          <p className="text-sm text-muted-foreground mt-4 max-w-2xl">
            Browse the complete Computer Science curriculum from the Federal University of Technology,
            Owerri — from 100-level foundations to 500-level advanced topics.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-10 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, code, or topic..."
                className="w-full bg-transparent border border-border/60 rounded-sm pl-12 pr-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-sm text-sm flex items-center gap-2 transition-colors ${
                showFilters ? "border-primary text-primary" : "border-border/60 text-muted-foreground hover:border-primary/60"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* Level filter */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Level:</span>
                {levels.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                      level === l.value
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/60 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              {/* Semester filter */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Semester:</span>
                {semesters.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSemester(s.value)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                      semester === s.value
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/60 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {/* Category filter */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Subject:</span>
                {CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                      category === cat.value
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/60 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="border border-border/30 rounded-sm animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-muted rounded w-20" />
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl font-semibold mb-2">No courses found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
