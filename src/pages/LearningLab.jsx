import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, ChevronLeft, ChevronRight, Check, Play, FileText,
  HelpCircle, Dumbbell, BookOpen, ArrowLeft
} from "lucide-react";

const contentIcons = {
  video: Play,
  text: FileText,
  quiz: HelpCircle,
  exercise: Dumbbell,
};

export default function LearningLab() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  const { data: course } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${id}`);
      return res.data;
    },
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", id],
    queryFn: async () => {
      const res = await apiClient.get(`/enrollments/course/${id}`);
      return res.data;
    },
  });

  const completedModules = useMemo(() => {
    return new Set(enrollment?.completed_modules || []);
  }, [enrollment]);

  const markCompleteMutation = useMutation({
    mutationFn: async (moduleIndex) => {
      if (!enrollment) return;
      const newCompleted = [...(enrollment.completed_modules || [])];
      if (!newCompleted.includes(moduleIndex)) {
        newCompleted.push(moduleIndex);
      }
      const totalModules = course?.modules?.length || 1;
      const progress = Math.round((newCompleted.length / totalModules) * 100);
      
      await apiClient.put(`/enrollments/${enrollment._id}`, {
        completed_modules: newCompleted,
        progress,
        status: progress >= 100 ? "completed" : "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment", id] });
    },
  });

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const modules = course.modules || [];
  const currentModule = modules[currentModuleIndex];
  const progress = enrollment?.progress || 0;

  const goNext = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-terminal border-b border-border/30">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-sm border border-border/50 hover:border-primary/50 transition-colors"
              aria-label="Toggle compass"
            >
              <Compass className="w-4 h-4" />
            </button>
            <Link to={`/course/${id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-display font-semibold text-foreground">{course.title}</span>
            </Link>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{progress}%</span>
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/10 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-[57px] left-0 bottom-0 w-80 bg-background border-r border-border/30 z-40 overflow-y-auto"
            >
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Modules</p>
                <div className="space-y-1">
                  {modules.map((mod, i) => {
                    const Icon = contentIcons[mod.content_type] || BookOpen;
                    const isComplete = completedModules.has(i);
                    const isCurrent = i === currentModuleIndex;
                    return (
                      <button
                        key={i}
                        onClick={() => { setCurrentModuleIndex(i); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-sm text-left transition-colors ${
                          isCurrent ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 ${
                          isComplete ? "bg-primary/10" : "bg-muted"
                        }`}>
                          {isComplete ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm truncate ${isCurrent ? "font-medium" : ""}`}>{mod.title}</p>
                          {mod.duration_minutes && (
                            <p className="text-[10px] text-muted-foreground">{mod.duration_minutes} min</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content — centered for flow state */}
      <div className="pt-[80px] pb-24 px-6">
        <div className="max-w-[60rem] mx-auto">
          {currentModule ? (
            <motion.div
              key={currentModuleIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Module {currentModuleIndex + 1} of {modules.length}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-6">
                {currentModule.title}
              </h1>

              {currentModule.content_type && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-sm text-xs text-muted-foreground mb-8">
                  {React.createElement(contentIcons[currentModule.content_type] || BookOpen, { className: "w-3 h-3" })}
                  {currentModule.content_type} {currentModule.duration_minutes && `· ${currentModule.duration_minutes} min`}
                </div>
              )}

              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {currentModule.description || "Content for this module is being prepared. Check back soon!"}
                </p>
              </div>

              {/* Mark complete + navigation */}
              <div className="mt-12 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={goPrev}
                  disabled={currentModuleIndex === 0}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {!completedModules.has(currentModuleIndex) ? (
                  <button
                    onClick={() => markCompleteMutation.mutate(currentModuleIndex)}
                    disabled={markCompleteMutation.isPending}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                  >
                    <Check className="w-4 h-4" /> Mark Complete
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm text-primary font-medium">
                    <Check className="w-4 h-4" /> Completed
                  </span>
                )}

                <button
                  onClick={goNext}
                  disabled={currentModuleIndex === modules.length - 1}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <h2 className="font-display text-2xl font-bold mb-3">No Modules Yet</h2>
              <p className="text-sm text-muted-foreground">This course doesn't have any modules. Check back later!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
