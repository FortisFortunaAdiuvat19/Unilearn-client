import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import TutorSearch from "@/components/tutors/TutorSearch";

export default function FindTutor() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[90rem] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-3">
            Find a Tutor
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Search and compare tutors
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Pick a course to see every available tutor for it, ranked by course knowledge, student
            reviews, and availability, so you can compare them side by side before reaching out.
          </p>
        </div>

        <TutorSearch />

        <div className="mt-16 border-t border-border/40 pt-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Know a course well yourself?{" "}
            <Link to="/become-tutor" className="text-primary hover:underline font-medium">
              Become a tutor
            </Link>{" "}
            and help other students the same way.
          </p>
        </div>
      </div>
    </div>
  );
}
