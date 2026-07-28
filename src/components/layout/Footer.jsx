import React from "react";
import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "Platform",
    links: [
      { label: "Discover Courses", path: "/courses" },
      { label: "Community", path: "/community" },
      { label: "About UniLearn", path: "/about" },
    ],
  },
  {
    title: "Subjects",
    links: [
      { label: "Computer Science", path: "/courses?cat=CSC" },
      { label: "Mathematics", path: "/courses?cat=MTH" },
      { label: "Physics", path: "/courses?cat=PHY" },
      { label: "Chemistry", path: "/courses?cat=CHM" },
      { label: "Engineering", path: "/courses?cat=ENG" },
      { label: "General Studies", path: "/courses?cat=GST" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Tutorials", path: "/community" },
      { label: "Study Groups", path: "/community" },
      { label: "Skill Exchange", path: "/community" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", path: "/about" },
      { label: "Guidelines", path: "/about" },
      { label: "Contact", path: "/about" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/50 mt-32">
      <div className="max-w-[90rem] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-6">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display text-sm font-bold">U</span>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">
                Uni<span className="text-primary">Learn</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A web-based platform for knowledge and skill sharing among university students. 
              Learn, share, grow together.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-foreground/70 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} UniLearn — Federal University of Technology, Owerri
          </p>
          <p className="text-xs text-muted-foreground">
            Nwankpa Fortune Chidinma · 20211263825
          </p>
        </div>
      </div>
    </footer>
  );
}
