import React from "react";
import { Flame } from "lucide-react";

export default function StreakCounter({ user }) {
  const current = user?.current_streak || 0;
  const longest = user?.longest_streak || 0;

  return (
    <div className="flex items-center gap-4 border border-border/40 rounded-sm px-5 py-4 mb-12">
      <div className="w-11 h-11 rounded-sm bg-orange-500/10 flex items-center justify-center flex-shrink-0">
        <Flame className="w-5 h-5 text-orange-500" />
      </div>
      <div>
        <p className="font-display text-2xl font-bold leading-none">
          {current} {current === 1 ? "day" : "days"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Login streak{longest > current ? ` \u00b7 Best: ${longest} days` : ""}
        </p>
      </div>
    </div>
  );
}
