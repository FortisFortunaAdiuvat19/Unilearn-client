import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { Search, GraduationCap, X } from "lucide-react";
import TutorList from "@/components/courses/TutorList";

export default function TutorSearch() {
  const [query, setQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data: courses = [] } = useQuery({
    queryKey: ["all-courses-tutor-search"],
    queryFn: async () => {
      const res = await apiClient.get("/courses");
      return res.data;
    },
  });

  const matches = useMemo(() => {
    if (!query.trim() || selectedCourse) return [];
    const q = query.toLowerCase();
    return courses
      .filter((c) => c.course_code?.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, courses, selectedCourse]);

  return (
    <div className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <GraduationCap className="w-5 h-5 text-primary" />
        <h2 className="font-display text-2xl font-bold">Find a Tutor</h2>
      </div>

      {!selectedCourse ? (
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by course code or title — e.g. CSC 201"
            className="w-full bg-transparent border border-border/40 rounded-sm pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
          />
          {matches.length > 0 && (
            <div className="absolute z-10 mt-1 w-full border border-border/40 rounded-sm bg-background shadow-lg max-h-72 overflow-y-auto">
              {matches.map((c) => (
                <button
                  key={c._id}
                  onClick={() => { setSelectedCourse(c); setQuery(""); }}
                  className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors border-b border-border/20 last:border-0"
                >
                  <span className="text-xs font-mono font-bold text-primary mr-2">{c.course_code}</span>
                  <span className="text-sm">{c.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm">
              <span className="font-mono font-bold text-primary">{selectedCourse.course_code}</span>
              <span className="text-muted-foreground"> — {selectedCourse.title}</span>
            </span>
            <button
              onClick={() => setSelectedCourse(null)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Change course
            </button>
          </div>
          <TutorList courseId={selectedCourse._id} showEmpty />
        </div>
      )}
    </div>
  );
}
