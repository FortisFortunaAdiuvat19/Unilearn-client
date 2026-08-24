import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import CourseForm from "@/components/admin/CourseForm";
import { BookPlus } from "lucide-react";

export default function CreateCourse() {
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/courses", payload);
      return res.data;
    },
    onSuccess: (course) => navigate(`/course/${course._id}`),
  });

  return (
    <div className="pt-28 pb-20 max-w-3xl mx-auto px-6 md:px-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
          <BookPlus className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Create a Course</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Add a new course to the catalog. Students can browse and enroll as soon as it's saved.
      </p>

      <CourseForm
        onSubmit={(payload) => createMutation.mutate(payload)}
        isSubmitting={createMutation.isPending}
        submitError={createMutation.error?.response?.data?.message || (createMutation.isError ? "Failed to create course. Please try again." : "")}
        submitLabel="Create course"
      />
    </div>
  );
}
