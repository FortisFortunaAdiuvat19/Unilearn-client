import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";
import StudyGroups from "@/components/community/StudyGroups";
import ChatRooms from "@/components/community/ChatRooms";
import { useAuth } from '@/lib/AuthContext';

export default function Community() {
  const { user } = useAuth();

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[90rem] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-3">
            Community
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Welcome back, {user?.displayName?.split(" ")[0] || user?.email?.split('@')[0] || "Student"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Find a tutor, join study groups, and collaborate in chatrooms.
          </p>
        </div>

        {/* Find a Tutor — now its own page; this is a pointer to it */}
        <Link
          to="/find-tutor"
          className="mb-16 flex items-center justify-between gap-4 border border-border/40 rounded-sm p-6 hover:border-primary/40 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Find a Tutor</h2>
              <p className="text-sm text-muted-foreground">Search by course and compare tutors by rating and availability.</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
        </Link>

        {/* Study Groups */}
        <StudyGroups />

        {/* Chatrooms */}
        <ChatRooms />
      </div>
    </div>
  );
}
