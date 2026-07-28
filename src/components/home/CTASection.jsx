import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection({ bgImage }) {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-[90rem] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-sm"
        >
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={bgImage}
              alt="Architectural concrete texture"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-foreground/90" />
          </div>

          <div className="relative px-8 md:px-16 py-16 md:py-24 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-4">
              Join the Movement
            </p>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-background tracking-tight mb-6 max-w-3xl mx-auto leading-[1.05]">
              Your Knowledge Is Someone Else's Breakthrough
            </h2>
            <p className="text-base text-background/60 max-w-lg mx-auto mb-10 leading-relaxed">
              Start sharing what you know and discover what others have to teach. 
              The UniLearn community is growing every day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
              >
                Explore Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center gap-2 border border-background/20 text-background px-8 py-4 rounded-sm text-sm font-semibold uppercase tracking-wider hover:border-background/40 transition-colors"
              >
                Join Community
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
