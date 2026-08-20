import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, X, FileQuestion, GraduationCap,
  Award, AlertCircle, Loader2
} from "lucide-react";

export default function AssessmentPlayer() {
  const { id } = useParams();

  const { data: assessment, isLoading } = useQuery({
    queryKey: ["assessment", id],
    queryFn: async () => {
      const res = await apiClient.get(`/assessments/${id}`);
      return res.data;
    },
  });

  const isExam = assessment?.type === "exam";
  const totalSteps = isExam ? 2 : 1;
  const [step, setStep] = useState(0);
  const [theoryAnswers, setTheoryAnswers] = useState({});
  const [objectiveAnswers, setObjectiveAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const objective_answers = (assessment?.objective_questions || []).map((_, i) =>
        typeof objectiveAnswers[i] === "number" ? objectiveAnswers[i] : null
      );
      const theory_answers = (assessment?.theory_questions || []).map((_, i) =>
        theoryAnswers[i] || ""
      );
      const res = await apiClient.post(`/assessments/${id}/submit`, {
        objective_answers,
        theory_answers,
      });
      return res.data;
    },
    onSuccess: () => setSubmitted(true),
  });

  if (isLoading) {
    return (
      <div className="pt-28 pb-20 max-w-3xl mx-auto px-6 md:px-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="pt-28 pb-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Assessment Not Found</h1>
        <Link to="/courses" className="text-primary text-sm hover:underline">Back to Courses</Link>
      </div>
    );
  }

  const objectiveQuestions = assessment.objective_questions || [];
  const theoryQuestions = assessment.theory_questions || [];

  const objectiveScore = objectiveQuestions.reduce((acc, q, i) => {
    return acc + (objectiveAnswers[i] === q.correct_option ? 1 : 0);
  }, 0);
  const objectiveMax = objectiveQuestions.length;
  const objectivePct = objectiveMax > 0 ? Math.round((objectiveScore / objectiveMax) * 100) : 0;

  const stepNames = isExam ? ["Objective Section", "Theory Section"] : ["Theory Questions"];
  const currentStepName = submitted ? "Results" : stepNames[step];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        {/* Header */}
        <Link to={`/course/${assessment.course_id}`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Course
        </Link>

        <div className="flex items-center gap-3 mb-2">
          {isExam ? (
            <GraduationCap className="w-5 h-5 text-primary" />
          ) : (
            <FileQuestion className="w-5 h-5 text-blue-600" />
          )}
          <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm ${isExam ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-600"}`}>
            {isExam ? "Preparatory Exam" : "Preparatory Test"}
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">{assessment.title}</h1>
        {assessment.description && (
          <p className="text-sm text-muted-foreground mb-8">{assessment.description}</p>
        )}

        {/* Progress bar */}
        {!submitted && totalSteps > 1 && (
          <div className="flex items-center gap-2 mb-8">
            {stepNames.map((name, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs ${step >= i ? "text-foreground font-medium" : "text-muted-foreground"}`}>{name}</span>
                </div>
                {i < stepNames.length - 1 && <div className={`h-px w-8 ${step > i ? "bg-primary" : "bg-border"}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Current step label */}
        {!submitted && (
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold">{currentStepName}</h2>
          </div>
        )}

        {/* OBJECTIVE SECTION */}
        {!submitted && isExam && step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {objectiveQuestions.map((q, i) => (
              <div key={i} className="border border-border/40 rounded-sm p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="font-mono text-xs text-muted-foreground mt-0.5">Q{i + 1}</span>
                  <p className="text-sm font-medium flex-1">{q.question}</p>
                </div>
                <div className="space-y-2 ml-8">
                  {q.options?.map((opt, j) => (
                    <button
                      key={j}
                      onClick={() => setObjectiveAnswers({ ...objectiveAnswers, [i]: j })}
                      className={`w-full text-left px-4 py-2.5 rounded-sm text-sm border transition-colors ${
                        objectiveAnswers[i] === j
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/40 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <span className="font-mono text-xs mr-2">{String.fromCharCode(65 + j)})</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
              >
                Next: Theory Section <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* THEORY SECTION */}
        {!submitted && (isExam ? step === 1 : step === 0) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {theoryQuestions.map((q, i) => (
              <div key={i} className="border border-border/40 rounded-sm p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="font-mono text-xs text-muted-foreground mt-0.5">Q{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{q.question}</p>
                    {q.max_marks && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Max marks: {q.max_marks}
                      </span>
                    )}
                  </div>
                </div>
                <textarea
                  value={theoryAnswers[i] || ""}
                  onChange={(e) => setTheoryAnswers({ ...theoryAnswers, [i]: e.target.value })}
                  placeholder="Write your answer here..."
                  rows={5}
                  className="w-full bg-transparent border border-border/40 rounded-sm p-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors resize-y ml-8"
                />
              </div>
            ))}
            <div className="flex justify-between items-center">
              {isExam && (
                <button
                  onClick={() => setStep(0)}
                  className="inline-flex items-center gap-2 border border-border/60 px-5 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider hover:border-primary/40 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors ml-auto disabled:opacity-60"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit {isExam ? "Exam" : "Test"} <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            {submitMutation.isError && (
              <p className="text-sm text-destructive text-right">
                {submitMutation.error?.response?.data?.message || "Failed to submit. Please try again."}
              </p>
            )}
          </motion.div>
        )}

        {/* RESULTS */}
        {submitted && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Score summary */}
            <div className="border border-border/40 rounded-sm p-6 mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Award className="w-6 h-6 text-primary" />
                <h2 className="font-display text-2xl font-bold">Results</h2>
              </div>
              {isExam && objectiveMax > 0 && (
                <>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="font-display text-4xl font-bold text-primary">{objectiveScore}</span>
                    <span className="font-display text-2xl text-muted-foreground">/ {objectiveMax}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Objective score: {objectivePct}% correct
                  </p>
                </>
              )}
              {!isExam && (
                <p className="text-sm text-muted-foreground">
                  Theory test submitted. Review your answers below.
                </p>
              )}
            </div>

            {/* Objective results */}
            {isExam && objectiveQuestions.map((q, i) => {
              const isCorrect = objectiveAnswers[i] === q.correct_option;
              const selected = objectiveAnswers[i];
              return (
                <div key={i} className="border border-border/40 rounded-sm p-4 mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? "bg-emerald-100" : "bg-rose-100"}`}>
                      {isCorrect ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2">{q.question}</p>
                      <div className="space-y-1 ml-2">
                        {q.options?.map((opt, j) => (
                          <div
                            key={j}
                            className={`text-xs px-3 py-1.5 rounded-sm ${
                              j === q.correct_option
                                ? "bg-emerald-50 text-emerald-700 font-medium"
                                : j === selected
                                ? "bg-rose-50 text-rose-700"
                                : "text-muted-foreground"
                            }`}
                          >
                            {String.fromCharCode(65 + j)}) {opt}
                            {j === q.correct_option && " ✓"}
                            {j === selected && !isCorrect && " ✗ Your answer"}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Theory results */}
            {theoryQuestions.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Theory Answers
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Theory answers are shown alongside sample answers for self-review. In a real written exam, an examiner would assess your response.
                </p>
                <div className="space-y-4">
                  {theoryQuestions.map((q, i) => (
                    <div key={i} className="border border-border/40 rounded-sm p-5">
                      <p className="text-sm font-medium mb-3">{q.question}</p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Your Answer</p>
                          <div className="bg-muted/40 rounded-sm p-3 text-sm text-foreground min-h-[60px]">
                            {theoryAnswers[i]?.trim() || <span className="text-muted-foreground italic">No answer provided</span>}
                          </div>
                        </div>
                        {q.sample_answer && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-emerald-600 mb-1">Sample Answer / Key Concepts</p>
                            <div className="bg-emerald-50 rounded-sm p-3 text-sm text-emerald-800">
                              {q.sample_answer}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center mt-8">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setStep(0);
                  setTheoryAnswers({});
                  setObjectiveAnswers({});
                  submitMutation.reset();
                }}
                className="inline-flex items-center gap-2 border border-border/60 px-5 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider hover:border-primary/40 transition-colors"
              >
                Retake
              </button>
              <Link
                to={`/course/${assessment.course_id}`}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
              >
                Back to Course <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
