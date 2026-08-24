import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";

export default function HeroSection({ heroImage }) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Vertical rules background */}
      <div className="absolute inset-0 vertical-rules opacity-30 pointer-events-none" />

      {/* Parallax quote */}
      <div className="absolute top-1/3 left-0 right-0 pointer-events-none select-none overflow-hidden">
        <p className="text-[12vw] md:text-[8vw] font-display font-bold text-border/40 whitespace-nowrap leading-none">
          Knowledge is Power
        </p>
      </div>

      <div className="relative max-w-[90rem] mx-auto px-6 md:px-10 pt-32 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Typography */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-6">
                University Knowledge Platform
              </p>
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[0.95] tracking-tight mb-8">
                Share
                <br />
                Knowledge,
                <br />
                <span className="text-primary">Shape</span> Futures
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed mb-10">
                A peer-to-peer learning ecosystem where university students exchange skills, 
                collaborate on projects, and accelerate academic growth.
              </p>
            </motion.div>

            {/* Search Bar — "Teleport to Subject" */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative max-w-lg"
            >
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
                Teleport to Subject
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, skills, topics..."
                  className="w-full bg-transparent border border-border/60 rounded-sm pl-12 pr-14 py-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-sm hover:bg-primary/90 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex gap-10 mt-12"
            >
              {[
                { value: "500+", label: "Courses" },
                { value: "2.4k", label: "Students" },
                { value: "150+", label: "Instructors" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl md:text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto lg:ml-auto">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-sm" />
              <img
                src={heroImage}
                alt="Glass prism refracting light representing knowledge dispersion"
                className="w-full h-full object-cover rounded-sm"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 glass-terminal rounded-sm px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Live</p>
                <p className="text-sm font-medium mt-0.5">24 active sessions</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
