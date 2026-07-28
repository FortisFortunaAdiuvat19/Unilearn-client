import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, MessageSquare, Award, Lightbulb, Share2 } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Peer-Led Courses",
    description: "Students create and share courses on their areas of expertise, building a collaborative knowledge base.",
  },
  {
    icon: Users,
    title: "Skill Exchange",
    description: "Trade skills across disciplines. A CS student teaches coding while learning graphic design.",
  },
  {
    icon: MessageSquare,
    title: "Community Forum",
    description: "Ask questions, share tutorials, and engage in academic discussions with peers across departments.",
  },
  {
    icon: Award,
    title: "Track Progress",
    description: "Monitor your learning journey with detailed progress tracking and completion certificates.",
  },
  {
    icon: Lightbulb,
    title: "AI-Powered Insights",
    description: "Get personalized course recommendations based on your interests and learning patterns.",
  },
  {
    icon: Share2,
    title: "Collaborative Projects",
    description: "Form study groups, work on projects together, and build your academic portfolio.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 border-t border-border/30">
      <div className="max-w-[90rem] mx-auto px-6 md:px-10">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-3">
            Platform Architecture
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Built for the Modern Scholar
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            UniLearn transforms how university students discover, share, and master knowledge 
            through a purpose-built digital ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30 border border-border/30 rounded-sm overflow-hidden">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-background p-8 md:p-10 group hover:bg-card transition-colors duration-300"
            >
              <feature.icon className="w-5 h-5 text-primary mb-5 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
