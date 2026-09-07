import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/") return null;

  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className="fixed top-24 left-4 md:left-8 z-40 w-10 h-10 flex items-center justify-center rounded-sm border border-border/50 bg-background/80 backdrop-blur-sm hover:border-primary/50 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
  );
}
