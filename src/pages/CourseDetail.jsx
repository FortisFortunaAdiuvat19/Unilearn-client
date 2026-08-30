import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { motion } from "framer-motion";
import { Clock, Users, Star, ArrowRight, Pencil, Trash2 } from "lucide-react";
import CourseContent from "@/components/courses/CourseContent";
import TutorList from "@/components/courses/TutorList";
import CourseIcon from "@/components/courses/CourseIcon";
import { CATEGORY_LABELS } from "@/lib/courseCategories";
import { useAuth } from '@/lib/AuthContext';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showStickyBar, setShowStickyBar] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${id}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/courses/${id}`);
    },
    onSuccess: () => navigate("/courses"),
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/enrollments`, { course_id: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", id] });
      queryClient.invalidateQueries({ queryKey: ["enrollment", id] });
    },
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/enrollments/course/${id}`);
        return res.data;
      } catch (error) {
        // If not enrolled, a 404 is expected
        return null;
      }
    },
    enabled: !!user,
  });

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="pt-28 pb-20 max-w-[90rem] mx-auto px-6 md:px-10">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-12 bg-muted rounded w-96" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-[4/3] bg-muted rounded-sm" />
            </div>
            <div className="lg:col-span-3 space-y-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="pt-28 pb-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Course Not Found</h1>
        <Link to="/courses" className="text-primary text-sm hover:underline">
          Back to Courses
        </Link>
      </div>
    );
  }


  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[90rem] mx-auto px-6 md:px-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link to="/courses" className="hover:text-primary transition-colors">Courses</Link>
          <span>/</span>
          <span className="text-foreground">{course.title}</span>
        </div>

        {user?.role === "admin" && (
          <div className="flex items-center gap-2 mb-6 -mt-4">
            <Link
              to={`/admin/edit-course/${course._id}`}
              className="inline-flex items-center gap-1.5 border border-border/60 px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider hover:border-primary/40 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="inline-flex items-center gap-1.5 border border-destructive/40 text-destructive px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-destructive/5 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{course.title}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This also removes its documents, videos, assessments, and student enrollments. This can't be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                    Delete course
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Left — Static Anchor */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28">
              <div className="flex items-start gap-5 mb-6">
                <CourseIcon
                  category={course.category}
                  imageUrl={course.image_url}
                  alt={course.title}
                  size="lg"
                  className="mt-1"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {course.course_code && (
                      <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-sm">
                        {course.course_code}
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                      {CATEGORY_LABELS[course.category] || course.category}
                    </span>
                  </div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                    {course.title}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 flex-wrap">
                {course.level && (
                  <span className="px-2.5 py-1 border border-border/60 rounded-sm text-xs uppercase tracking-wider">
                    {course.level} Level
                  </span>
                )}
                {course.semester && (
                  <span className="px-2.5 py-1 border border-border/60 rounded-sm text-xs uppercase tracking-wider">
                    {course.semester === 1 ? "Harmattan Semester" : "Rain Semester"}
                  </span>
                )}
                {course.difficulty && (
                  <span className="px-2.5 py-1 border border-border/60 rounded-sm text-xs uppercase tracking-wider">
                    {course.difficulty}
                  </span>
                )}
                {course.duration_hours > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {course.duration_hours} hours
                  </span>
                )}
                {course.enrollment_count > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {course.enrollment_count} enrolled
                  </span>
                )}
                {course.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" /> {course.rating.toFixed(1)}
                  </span>
                )}
              </div>

              {enrollment ? (
                <Link
                  to={`/learn/${course._id}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-4 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                >
                  Continue Learning
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending || !user}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-4 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {!user ? "Login to Enroll" : enrollMutation.isPending ? "Enrolling..." : "Enroll Now — Free"}
                </button>
              )}

              {course.instructor_name && (
                <div className="mt-8 pt-6 border-t border-border/30">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Instructor</p>
                  <p className="font-display text-lg font-semibold">{course.instructor_name}</p>
                  {course.instructor_bio && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{course.instructor_bio}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right — Narrative Scroll */}
          <div className="lg:col-span-3">
            {/* Description */}
            {(course.long_description || course.description) && (
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold mb-4">About This Course</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {course.long_description || course.description}
                </p>
              </div>
            )}

            {/* Course Content - Documents, Videos, Assessments */}
            <CourseContent courseId={course._id} course={course} />

            {/* Tutors for this course */}
            <TutorList courseId={course._id} />

            {/* Tags */}
            {course.tags?.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-4">Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 border border-border/50 rounded-sm text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky enrollment bar */}
      {showStickyBar && !enrollment && user && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 glass-terminal border-t border-border/30 z-40"
        >
          <div className="max-w-[90rem] mx-auto px-6 md:px-10 py-3 flex items-center justify-between">
            <div className="hidden sm:block">
              <p className="font-display text-sm font-semibold truncate">{course.title}</p>
              <p className="text-xs text-muted-foreground">Free enrollment</p>
            </div>
            <button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
