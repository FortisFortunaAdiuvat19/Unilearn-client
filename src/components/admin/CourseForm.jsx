import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";

const CATEGORIES = ["CSC", "CIT", "MTH", "PHY", "CHM", "BIO", "ENG", "GST", "STA", "IFT", "SIW"];
const LEVELS = [100, 200, 300, 400, 500];
const CONTENT_TYPES = ["video", "text", "quiz", "exercise"];

const toFormState = (course) => ({
  title: course?.title || "",
  course_code: course?.course_code || "",
  description: course?.description || "",
  long_description: course?.long_description || "",
  category: course?.category || "",
  level: course?.level ? String(course.level) : "",
  semester: course?.semester ? String(course.semester) : "",
  difficulty: course?.difficulty || "beginner",
  image_url: course?.image_url || "",
  instructor_name: course?.instructor_name || "",
  instructor_bio: course?.instructor_bio || "",
  duration_hours: course?.duration_hours != null ? String(course.duration_hours) : "",
  outcomes: (course?.outcomes || []).join(", "),
  tags: (course?.tags || []).join(", "),
  is_featured: course?.is_featured || false,
});

const toModulesState = (course) =>
  (course?.modules || []).map((m) => ({
    title: m.title || "",
    description: m.description || "",
    duration_minutes: m.duration_minutes != null ? String(m.duration_minutes) : "",
    content_type: m.content_type || "text",
  }));

// initialValues: an existing Course object to pre-fill (edit mode), or
// omitted/null for a blank form (create mode).
// onSubmit(payload): called with the built payload once validation passes.
// isSubmitting / submitError: reflect the caller's mutation state.
export default function CourseForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitError = "",
  submitLabel = "Save",
}) {
  const [form, setForm] = useState(() => toFormState(initialValues));
  const [modules, setModules] = useState(() => toModulesState(initialValues));
  const [formError, setFormError] = useState("");

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const addModule = () =>
    setModules((m) => [...m, { title: "", description: "", duration_minutes: "", content_type: "text" }]);
  const updateModule = (index, key, value) =>
    setModules((m) => m.map((mod, i) => (i === index ? { ...mod, [key]: value } : mod)));
  const removeModule = (index) => setModules((m) => m.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim() || !form.course_code.trim() || !form.category || !form.level || !form.semester) {
      setFormError("Title, course code, category, level, and semester are required.");
      return;
    }

    onSubmit({
      title: form.title.trim(),
      course_code: form.course_code.trim(),
      description: form.description.trim(),
      long_description: form.long_description.trim(),
      category: form.category,
      level: Number(form.level),
      semester: Number(form.semester),
      difficulty: form.difficulty,
      image_url: form.image_url.trim(),
      instructor_name: form.instructor_name.trim(),
      instructor_bio: form.instructor_bio.trim(),
      duration_hours: form.duration_hours ? Number(form.duration_hours) : undefined,
      outcomes: form.outcomes.split(",").map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      is_featured: form.is_featured,
      modules: modules.map((m) => ({
        title: m.title.trim(),
        description: m.description.trim(),
        duration_minutes: m.duration_minutes ? Number(m.duration_minutes) : undefined,
        content_type: m.content_type,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Data Structures and Algorithms"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course_code">Course code</Label>
              <Input
                id="course_code"
                placeholder="CSC 201"
                value={form.course_code}
                onChange={(e) => updateField("course_code", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={form.level} onValueChange={(v) => updateField("level", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={String(l)}>{l} level</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={form.semester} onValueChange={(v) => updateField("semester", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Harmattan (1st)</SelectItem>
                  <SelectItem value="2">Rain (2nd)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={form.difficulty} onValueChange={(v) => updateField("difficulty", v)}>
              <SelectTrigger className="md:w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Short description</Label>
            <Textarea
              id="description"
              placeholder="One or two sentences shown on the course card."
              rows={2}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="long_description">Full description</Label>
            <Textarea
              id="long_description"
              placeholder="What this course covers, in more detail — shown on the course page."
              rows={5}
              value={form.long_description}
              onChange={(e) => updateField("long_description", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instructor & details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instructor_name">Instructor name</Label>
              <Input
                id="instructor_name"
                value={form.instructor_name}
                onChange={(e) => updateField("instructor_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_hours">Duration (hours)</Label>
              <Input
                id="duration_hours"
                type="number"
                min="0"
                value={form.duration_hours}
                onChange={(e) => updateField("duration_hours", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructor_bio">Instructor bio</Label>
            <Textarea
              id="instructor_bio"
              rows={2}
              value={form.instructor_bio}
              onChange={(e) => updateField("instructor_bio", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">Cover image URL</Label>
            <Input
              id="image_url"
              placeholder="https://..."
              value={form.image_url}
              onChange={(e) => updateField("image_url", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              id="is_featured"
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => updateField("is_featured", e.target.checked)}
              className="w-4 h-4 rounded border-input"
            />
            <Label htmlFor="is_featured" className="!mt-0 cursor-pointer">
              Feature this course on the homepage
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Outcomes & tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="outcomes">Learning outcomes</Label>
            <Input
              id="outcomes"
              placeholder="Separate with commas — e.g. Build a REST API, Write unit tests"
              value={form.outcomes}
              onChange={(e) => updateField("outcomes", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Separate with commas — e.g. backend, databases"
              value={form.tags}
              onChange={(e) => updateField("tags", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Modules</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addModule}>
            <Plus className="w-4 h-4 mr-1" /> Add module
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {modules.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No modules yet — add at least one so students have something to work through in the learning lab.
            </p>
          )}
          {modules.map((mod, i) => (
            <div key={i} className="border border-border/60 rounded-lg p-4 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeModule(i)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Remove module ${i + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Module {i + 1}
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={mod.title}
                    onChange={(e) => updateModule(i, "title", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={mod.duration_minutes}
                      onChange={(e) => updateModule(i, "duration_minutes", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={mod.content_type}
                      onValueChange={(v) => updateModule(i, "content_type", v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={mod.description}
                  onChange={(e) => updateModule(i, "description", e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {formError && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {formError}
        </div>
      )}
      {submitError && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {submitError}
        </div>
      )}

      <Button type="submit" className="w-full h-12 font-medium" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
