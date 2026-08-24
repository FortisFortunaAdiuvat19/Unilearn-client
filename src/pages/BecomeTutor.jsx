import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Plus, Trash2, Star, Loader2 } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Stars({ count }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < count ? "fill-primary text-primary" : "text-border"}`} />
      ))}
    </span>
  );
}

export default function BecomeTutor() {
  const queryClient = useQueryClient();
  const [bio, setBio] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [slots, setSlots] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseError, setCourseError] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-tutor-profile"],
    queryFn: async () => {
      const res = await apiClient.get("/tutors/me");
      return res.data;
    },
  });

  // React Query v5 dropped the onSuccess callback from useQuery, so the
  // form is seeded from the fetched profile here instead, once.
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (profile && !initialized) {
      setBio(profile.bio || "");
      setIsAvailable(profile.is_available ?? true);
      setSlots(profile.weekly_availability || []);
      setInitialized(true);
    }
  }, [profile, initialized]);

  const { data: courses = [] } = useQuery({
    queryKey: ["all-courses-profile"],
    queryFn: async () => {
      const res = await apiClient.get("/courses");
      return res.data;
    },
  });

  const addSlot = () => setSlots((s) => [...s, { day: "Mon", start_time: "", end_time: "" }]);
  const updateSlot = (i, key, value) =>
    setSlots((s) => s.map((slot, idx) => (idx === i ? { ...slot, [key]: value } : slot)));
  const removeSlot = (i) => setSlots((s) => s.filter((_, idx) => idx !== i));

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/tutors/me", {
        bio,
        is_available: isAvailable,
        weekly_availability: slots.filter((s) => s.start_time && s.end_time),
      });
      return res.data;
    },
    onSuccess: (data) => queryClient.setQueryData(["my-tutor-profile"], data),
  });

  const addCourseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/tutors/me", { course_id: selectedCourse });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["my-tutor-profile"], data);
      setSelectedCourse("");
      setCourseError("");
    },
    onError: (err) => {
      setCourseError(err.response?.data?.message || "Couldn't add that course.");
    },
  });

  const registeredCourseIds = new Set((profile?.courses || []).map((c) => c.course_id));
  const availableCourses = courses.filter((c) => !registeredCourseIds.has(c._id));

  if (isLoading) {
    return (
      <div className="pt-28 pb-20 max-w-2xl mx-auto px-6 md:px-10">
        <div className="h-32 bg-muted rounded-sm animate-pulse" />
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-2xl mx-auto px-6 md:px-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Become a Tutor</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Help other students in courses you've already done well in. Each course you add is checked
        against your own test results — you'll need at least 70% on one assessment for it first.
      </p>

      {(profile?.courses || []).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">You're tutoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.courses.map((c) => {
              const course = courses.find((co) => co._id === c.course_id);
              return (
                <div key={c.course_id} className="flex items-center justify-between text-sm">
                  <span>{course?.title || c.course_id}</span>
                  <Stars count={c.knowledge_rating} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add a course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Choose a course" /></SelectTrigger>
              <SelectContent>
                {availableCourses.map((c) => (
                  <SelectItem key={c._id} value={c._id}>{c.course_code} — {c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              disabled={!selectedCourse || addCourseMutation.isPending}
              onClick={() => addCourseMutation.mutate()}
            >
              {addCourseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
            </Button>
          </div>
          {courseError && <p className="text-sm text-destructive">{courseError}</p>}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Bio & availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Short bio</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="A line or two about how you can help — e.g. what you're strong at, how you like to explain things."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_available"
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-4 h-4 rounded border-input"
            />
            <Label htmlFor="is_available" className="!mt-0 cursor-pointer">
              Currently accepting students
            </Label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Weekly availability</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add time
              </Button>
            </div>
            {slots.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No time slots added — students will still see you as available, just without specific hours.
              </p>
            )}
            {slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={slot.day} onValueChange={(v) => updateSlot(i, "day", v)}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <input
                  type="time"
                  value={slot.start_time}
                  onChange={(e) => updateSlot(i, "start_time", e.target.value)}
                  className="border border-border/40 rounded-sm px-2 py-1.5 text-sm bg-transparent"
                />
                <span className="text-muted-foreground text-sm">–</span>
                <input
                  type="time"
                  value={slot.end_time}
                  onChange={(e) => updateSlot(i, "end_time", e.target.value)}
                  className="border border-border/40 rounded-sm px-2 py-1.5 text-sm bg-transparent"
                />
                <button type="button" onClick={() => removeSlot(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            className="w-full h-11"
            disabled={saveProfileMutation.isPending}
            onClick={() => saveProfileMutation.mutate()}
          >
            {saveProfileMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              "Save"
            )}
          </Button>
          {saveProfileMutation.isSuccess && (
            <p className="text-xs text-emerald-600 text-center">Saved.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
