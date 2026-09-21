import React from "react";
import StudyGroups from "@/components/community/StudyGroups";
import ChatRooms from "@/components/community/ChatRooms";
import TutorSearch from "@/components/community/TutorSearch";
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

        {/* Find a Tutor */}
        <TutorSearch />

        {/* Study Groups */}
        <StudyGroups />

        {/* Chatrooms */}
        <ChatRooms />
      </div>
    </div>
  );
}
