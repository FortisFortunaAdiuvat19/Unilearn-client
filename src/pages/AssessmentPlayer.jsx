import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, X, FileQuestion, GraduationCap,
  Award, AlertCircle, Loader2, Lightbulb
} from "lucide-react";

// Should match IMPROVEMENT_THRESHOLD in unilearn-server/routes/recommendations.js —
// there's no shared code between the two repos, so this is duplicated on purpose.
const IMPROVEMENT_THRESHOLD = 70;

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

  // Videos and top tutor for this course, fetched only once results are
  // showing and only used if the score is low enough to suggest them.
  // Videos share a query key with CourseContent.jsx, so it's usually
  // already cached.
  const { data: courseVideos = [] } = useQuery({
    queryKey: ["course-videos", assessment?.course_id],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${assessment.course_id}/videos`);
      return res.data;
    },
    enabled: !!assessment?.course_id && submitted,
  });

  const { data: courseTutors } = useQuery({
    queryKey: ["course-tutors", assessment?.course_id],
    queryFn: async () => {
      const res = await apiClient.get(`/tutors/course/${assessment.course_id}`);
      return res.data;
    },
    enabled: !!assessment?.course_id && submitted,
  });
  const topTutor = courseTutors?.tutors?.[0];

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
  const hasObjective = objectiveQuestions.length > 0;
  const hasTheory = theoryQuestions.length > 0;

  // Which sections actually exist, in a fixed order. This is driven by what
  // content the assessment actually has, not by its "test" vs "exam" type
  // label — that label is just a badge, and a "test" can still contain
  // objective questions (previously those were silently never shown).
  const sections = [
    ...(hasObjective ? ["objective"] : []),
    ...(hasTheory ? ["theory"] : []),
  ];
  const totalSteps = sections.length;
  const currentSection = sections[step];
  const isLastSection = step === sections.length - 1;

  const objectiveScore = objectiveQuestions.reduce((acc, q, i) => {
    return acc + (objectiveAnswers[i] === q.correct_option ? 1 : 0);
  }, 0);
  const objectiveMax = objectiveQuestions.length;
  const objectivePct = objectiveMax > 0 ? Math.round((objectiveScore / objectiveMax) * 100) : 0;

  const stepNames = sections.map((s) => (s === "objective" ? "Objective Section" : "Theory Section"));
  const currentStepName = submitted ? "Results" : stepNames[step];

  const handleRetake = () => {
    setSubmitted(false);
    setStep(0);
    setTheoryAnswers({});
    setObjectiveAnswers({});
    submitMutation.reset();
  };

  const needsImprovement = hasObjective && objectivePct < IMPROVEMENT_THRESHOLD;

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
        {!submitted && totalSteps > 0 && (
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold">{currentStepName}</h2>
          </div>
        )}

        {/* No questions at all — shouldn't normally happen, but don't show a blank page */}
        {!submitted && totalSteps === 0 && (
          <div className="border border-border/40 rounded-sm p-8 text-center">
            <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">This assessment doesn't have any questions yet.</p>
          </div>
        )}

        {/* OBJECTIVE SECTION */}
        {!submitted && currentSection === "objective" && (
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
              {isLastSection ? (
                <button
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-60"
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
              ) : (
                <button
                  onClick={() => setStep(step + 1)}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                >
                  Next: Theory Section <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
            {isLastSection && submitMutation.isError && (
              <p className="text-sm text-destructive text-right">
                {submitMutation.error?.response?.data?.message || "Failed to submit. Please try again."}
              </p>
            )}
          </motion.div>
        )}

        {/* THEORY SECTION */}
        {!submitted && currentSection === "theory" && (
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
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
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
              {hasObjective ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="font-display text-4xl font-bold text-primary">{objectiveScore}</span>
                    <span className="font-display text-2xl text-muted-foreground">/ {objectiveMax}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Objective score: {objectivePct}% correct
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Submitted. Review your answers below.
                </p>
              )}
            </div>

            {/* Ways to improve — only when there's an objective score below the threshold */}
            {needsImprovement && (
              <div className="border border-primary/30 bg-primary/5 rounded-sm p-5 mb-8">
                <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" /> Ways to improve
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleRetake}
                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                  >
                    Retake this {isExam ? "exam" : "test"}
                  </button>
                  {courseVideos[0] && (
                    <a
                      href={courseVideos[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border border-border/60 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:border-primary/40 transition-colors"
                    >
                      Watch: {courseVideos[0].title}
                    </a>
                  )}
                  {topTutor && (
                    <Link
                      to={`/course/${assessment.course_id}`}
                      className="inline-flex items-center gap-1.5 border border-border/60 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:border-primary/40 transition-colors"
                    >
                      Connect with {topTutor.name} ({topTutor.overall_rating}★)
                    </Link>
                  )}
                  <Link
                    to="/community"
                    className="inline-flex items-center gap-1.5 border border-border/60 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:border-primary/40 transition-colors"
                  >
                    Find classmates to study with
                  </Link>
                </div>
              </div>
            )}

            {/* Objective results */}
            {hasObjective && objectiveQuestions.map((q, i) => {
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
            {hasTheory && (
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
                onClick={handleRetake}
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
