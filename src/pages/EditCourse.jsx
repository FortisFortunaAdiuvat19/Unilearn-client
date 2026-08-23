import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import CourseForm from "@/components/admin/CourseForm";
import { Pencil, AlertCircle } from "lucide-react";

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${id}`);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.put(`/courses/${id}`, payload);
      return res.data;
    },
    onSuccess: (updated) => navigate(`/course/${updated._id}`),
  });

  if (isLoading) {
    return (
      <div className="pt-28 pb-20 max-w-3xl mx-auto px-6 md:px-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded-sm" />
          <div className="h-32 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="pt-28 pb-20 max-w-3xl mx-auto px-6 md:px-10 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Course not found</h1>
        <Link to="/courses" className="text-primary hover:underline text-sm">
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-3xl mx-auto px-6 md:px-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
          <Pencil className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Edit Course</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Editing <span className="font-medium text-foreground">{course.title}</span>. Changes are visible to students as soon as they're saved.
      </p>

      <CourseForm
        initialValues={course}
        onSubmit={(payload) => updateMutation.mutate(payload)}
        isSubmitting={updateMutation.isPending}
        submitError={updateMutation.error?.response?.data?.message || (updateMutation.isError ? "Failed to save changes. Please try again." : "")}
        submitLabel="Save changes"
      />
    </div>
  );
}
