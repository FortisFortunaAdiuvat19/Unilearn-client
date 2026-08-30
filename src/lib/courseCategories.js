import {
  Code2, Cpu, Sigma, Atom, FlaskConical, Dna, Wrench,
  BookOpen, BarChart3, Network, Briefcase, GraduationCap,
} from "lucide-react";

// Full display names — used on course cards and the course detail page.
export const CATEGORY_LABELS = {
  CSC: "Computer Science",
  CIT: "Computer Info Tech",
  MTH: "Mathematics",
  PHY: "Physics",
  CHM: "Chemistry",
  BIO: "Biology",
  ENG: "Engineering",
  GST: "General Studies",
  STA: "Statistics",
  IFT: "Info Technology",
  SIW: "Industrial Training",
};

// Short labels for filter pills, where space is tight.
export const CATEGORY_SHORT_LABELS = {
  CSC: "CSC",
  CIT: "CIT",
  MTH: "Math",
  PHY: "Physics",
  CHM: "Chem",
  BIO: "Biology",
  ENG: "Engineering",
  GST: "Gen. Studies",
  STA: "Stats",
  IFT: "IT",
  SIW: "SIWES",
};

export const CATEGORY_ICONS = {
  CSC: Code2,
  CIT: Cpu,
  MTH: Sigma,
  PHY: Atom,
  CHM: FlaskConical,
  BIO: Dna,
  ENG: Wrench,
  GST: BookOpen,
  STA: BarChart3,
  IFT: Network,
  SIW: Briefcase,
};
export const DEFAULT_CATEGORY_ICON = GraduationCap;

export const CATEGORY_COLORS = {
  CSC: "bg-blue-500/10 text-blue-600",
  CIT: "bg-indigo-500/10 text-indigo-600",
  MTH: "bg-violet-500/10 text-violet-600",
  PHY: "bg-amber-500/10 text-amber-600",
  CHM: "bg-emerald-500/10 text-emerald-600",
  BIO: "bg-green-500/10 text-green-600",
  ENG: "bg-orange-500/10 text-orange-600",
  GST: "bg-slate-500/10 text-slate-600",
  STA: "bg-rose-500/10 text-rose-600",
  IFT: "bg-cyan-500/10 text-cyan-600",
  SIW: "bg-teal-500/10 text-teal-600",
};
export const DEFAULT_CATEGORY_COLOR = "bg-primary/10 text-primary";

// Derived from CATEGORY_SHORT_LABELS so a new category only ever needs to
// be added in one place — this list was previously hand-maintained
// separately in Courses.jsx and had quietly fallen out of sync (STA and
// IFT were missing, so courses in those categories had no filter button,
// even though "All Subjects" still included them).
export const CATEGORY_FILTERS = [
  { value: "all", label: "All Subjects" },
  ...Object.entries(CATEGORY_SHORT_LABELS).map(([value, label]) => ({ value, label })),
];
