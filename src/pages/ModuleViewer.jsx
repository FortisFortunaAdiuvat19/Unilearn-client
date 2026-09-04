import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, Check, ExternalLink, PartyPopper, Loader2
} from "lucide-react";

function InfoCard({ card }) {
  return (
    <div className="h-full overflow-y-auto px-6 py-8 md:px-10 md:py-12">
      <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-6">
        {card.heading}
      </h2>
      <div className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line space-y-4 mb-8">
        {card.body}
      </div>

      {card.video_id && (
        <div className="aspect-video rounded-sm overflow-hidden border border-border/40 mb-6">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${card.video_id}`}
            title={card.video_title || card.heading}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {card.sources?.length > 0 && (
        <div className="border-t border-border/30 pt-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Further reading</p>
          <ul className="space-y-1.5">
            {card.sources.slice(0, 4).map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary/80 hover:text-primary hover:underline inline-flex items-center gap-1"
                >
                  {s.title || s.url} <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function QuizCard({ card, onAnswered }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    onAnswered(i === card.correct_index);
  };

  return (
    <div className="h-full flex flex-col justify-center px-6 py-8 md:px-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Quick Check</p>
      <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight mb-8">
        {card.question}
      </h2>
      <div className="space-y-3">
        {card.options.map((opt, i) => {
          const isCorrect = i === card.correct_index;
          const isSelected = i === selected;
          const revealed = selected !== null;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={`w-full text-left px-4 py-3.5 rounded-sm border text-sm transition-colors flex items-center justify-between gap-3 ${
                revealed && isCorrect
                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700"
                  : revealed && isSelected
                  ? "border-destructive/60 bg-destructive/10 text-destructive"
                  : "border-border/50 hover:border-primary/40"
              }`}
            >
              <span>{opt}</span>
              {revealed && isCorrect && <Check className="w-4 h-4 flex-shrink-0" />}
              {revealed && isSelected && !isCorrect && <X className="w-4 h-4 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {selected !== null && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground mt-6 leading-relaxed"
          >
            {card.explanation}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ModuleViewer() {
  const { id, weekIndex } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cardIndex, setCardIndex] = useState(0);
  const [answeredCurrent, setAnsweredCurrent] = useState(false);
  const [finished, setFinished] = useState(false);

  const { data: courseModule, isLoading } = useQuery({
    queryKey: ["module", id, weekIndex],
    queryFn: async () => (await apiClient.get(`/courses/${id}/modules/${weekIndex}`)).data,
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", id],
    queryFn: async () => {
      try {
        return (await apiClient.get(`/enrollments/course/${id}`)).data;
      } catch {
        return null;
      }
    },
  });

  const { data: allModules } = useQuery({
    queryKey: ["course-modules", id],
    queryFn: async () => (await apiClient.get(`/courses/${id}/modules`)).data,
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!enrollment) return;
      const idx = parseInt(weekIndex, 10);
      const newCompleted = Array.from(new Set([...(enrollment.completed_modules || []), idx]));
      const total = allModules?.modules?.length || 1;
      const progress = Math.round((newCompleted.length / total) * 100);
      return apiClient.put(`/enrollments/${enrollment._id}`, {
        completed_modules: newCompleted,
        progress,
        status: progress >= 100 ? "completed" : "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment", id] });
      queryClient.invalidateQueries({ queryKey: ["course-modules", id] });
    },
  });

  const cards = courseModule?.cards || [];
  const card = cards[cardIndex];

  const goNext = () => {
    if (cardIndex < cards.length - 1) {
      setCardIndex((i) => i + 1);
      setAnsweredCurrent(false);
    } else if (!finished) {
      setFinished(true);
      completeMutation.mutate();
    }
  };
  const goPrev = () => {
    if (cardIndex > 0) {
      setCardIndex((i) => i - 1);
      setAnsweredCurrent(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" && (card?.type !== "quiz" || answeredCurrent)) goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") navigate(`/learn/${id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const canAdvance = card?.type !== "quiz" || answeredCurrent;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!courseModule || cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-xl font-semibold mb-2">This module isn't ready yet</p>
        <Link to={`/learn/${id}`} className="text-sm text-primary hover:underline">
          Back to modules
        </Link>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <PartyPopper className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Module complete</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm">
          You've finished {courseModule.topic}. Keep going with the next one whenever you're ready.
        </p>
        <Link
          to={`/learn/${id}`}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
        >
          Back to modules
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-40 flex flex-col">
      {/* Progress + close */}
      <div className="flex items-center gap-3 px-4 md:px-6 pt-4 pb-3 border-b border-border/30 flex-shrink-0">
        <button
          onClick={() => navigate(`/learn/${id}`)}
          className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-muted transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex-1 flex gap-1">
          {cards.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full bg-primary transition-all duration-300 ${
                  i < cardIndex ? "w-full" : i === cardIndex ? "w-1/2" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 overflow-hidden relative max-w-2xl w-full mx-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cardIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(e, info) => {
              if (info.offset.x < -80 && canAdvance) goNext();
              else if (info.offset.x > 80) goPrev();
            }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {card.type === "quiz" ? (
              <QuizCard card={card} onAnswered={() => setAnsweredCurrent(true)} />
            ) : (
              <InfoCard card={card} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border/30 flex-shrink-0 max-w-2xl w-full mx-auto">
        <button
          onClick={goPrev}
          disabled={cardIndex === 0}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-xs text-muted-foreground">{cardIndex + 1} / {cards.length}</span>
        <button
          onClick={goNext}
          disabled={!canAdvance}
          className="flex items-center gap-1.5 text-sm font-medium text-primary disabled:opacity-30 disabled:pointer-events-none"
        >
          {cardIndex === cards.length - 1 ? "Finish" : "Next"} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
