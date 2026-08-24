import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { TrendingUp, RotateCcw, Youtube, Users, PartyPopper } from "lucide-react";

const actionIcons = {
  retake_test: RotateCcw,
  watch_video: Youtube,
  join_study_group: Users,
};

export default function PerformanceInsights() {
  const { data, isLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      const res = await apiClient.get("/recommendations");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="h-7 w-56 bg-muted rounded-sm mb-4 animate-pulse" />
        <div className="h-24 bg-muted rounded-sm animate-pulse" />
      </div>
    );
  }

  const recommendations = data?.recommendations || [];
  const hasResults = data?.has_results;

  if (recommendations.length === 0) {
    return (
      <div className="border border-border/40 rounded-sm p-8 md:p-10 text-center mb-8">
        <PartyPopper className="w-8 h-8 text-primary mx-auto mb-4" />
        <h3 className="font-display text-2xl font-bold mb-2">
          {hasResults ? "Nothing flagged right now" : "No test results yet"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasResults
            ? "You're at or above 70% on everything you've taken. Keep it up."
            : "Take a test or exam in one of your courses to get personalized suggestions here."}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="font-display text-2xl font-bold">Areas to Improve</h2>
      </div>
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.assessment_id} className="border border-border/40 rounded-sm p-5">
            <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  {rec.course_title}
                </p>
                <h3 className="font-display text-base font-semibold">{rec.assessment_title}</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-sm bg-rose-50 text-rose-700 whitespace-nowrap">
                {rec.score_percent}% last attempt
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {rec.suggested_actions.map((action, i) => {
                const Icon = actionIcons[action.type] || RotateCcw;
                const isExternal = action.href.startsWith("http");
                const className =
                  "inline-flex items-center gap-1.5 border border-border/60 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:border-primary/40 transition-colors";
                return isExternal ? (
                  <a key={i} href={action.href} target="_blank" rel="noopener noreferrer" className={className}>
                    <Icon className="w-3.5 h-3.5" /> {action.label}
                  </a>
                ) : (
                  <Link key={i} to={action.href} className={className}>
                    <Icon className="w-3.5 h-3.5" /> {action.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
