import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Globe, Lightbulb } from "lucide-react";

const objectives = [
  "Develop a web-based platform that facilitates knowledge and skill sharing among university students",
  "Enable peer-to-peer learning through structured courses and collaborative tools",
  "Create a community forum for academic discussions, tutorials, and resource sharing",
  "Implement progress tracking and course management for continuous learning",
  "Foster cross-disciplinary skill exchange to bridge knowledge gaps across departments",
];

const techStack = [
  { name: "React", desc: "Component-based UI framework for building dynamic interfaces" },
  { name: "Tailwind CSS", desc: "Utility-first CSS framework for rapid, consistent styling" },
  { name: "Node.js & Express", desc: "Custom backend architecture for secure API routing" },
  { name: "MongoDB", desc: "NoSQL database for flexible data schemas" },
  { name: "Firebase Auth", desc: "Secure authentication and identity management" },
];

export default function About() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[90rem] mx-auto px-6 md:px-10">
        {/* Hero */}
        <div className="max-w-3xl mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-4">
              About the Project
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              UniLearn: Knowledge & Skill Sharing for University Students
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              A web-based platform developed to facilitate knowledge and skill sharing among university 
              students at the Federal University of Technology, Owerri. UniLearn bridges the gap between 
              what students know, what they want to learn, and who they can learn from.
            </p>
          </motion.div>
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Project Objectives</h2>
            <div className="space-y-4">
              {objectives.map((obj, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{obj}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Problem Statement</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Traditional university learning is often limited to classroom instruction, leaving students 
              without accessible platforms to share their unique skills and knowledge with peers. Many students 
              possess valuable expertise in areas not covered by the formal curriculum, yet lack the tools 
              to effectively teach and learn from each other.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              UniLearn addresses this challenge by creating a dedicated digital ecosystem where students can 
              create courses, share tutorials, ask questions, and collaborate on projects—transforming 
              every student into both a teacher and a learner.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-24">
          <h2 className="font-display text-3xl font-bold mb-10">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border/30 border border-border/30 rounded-sm overflow-hidden">
            {[
              { icon: BookOpen, title: "Course Management", desc: "Create, discover, and enroll in peer-led courses across disciplines" },
              { icon: Users, title: "Community Forum", desc: "Ask questions, share tutorials, and engage in academic discussions" },
              { icon: Globe, title: "Skill Exchange", desc: "Trade skills across departments through structured learning paths" },
              { icon: Lightbulb, title: "Progress Tracking", desc: "Monitor learning journey with detailed module-level completion tracking" },
            ].map((feature) => (
              <div key={feature.title} className="bg-background p-8 group hover:bg-card transition-colors">
                <feature.icon className="w-5 h-5 text-primary mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-24">
          <h2 className="font-display text-3xl font-bold mb-10">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {techStack.map((tech) => (
              <div key={tech.name} className="border border-border/40 rounded-sm p-5 hover:border-primary/20 transition-colors">
                <h3 className="font-display text-lg font-semibold mb-1">{tech.name}</h3>
                <p className="text-sm text-muted-foreground">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attribution */}
        <div className="border-t border-border/30 pt-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold mb-4">Project Attribution</h2>
            <div className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">Student:</span> Nwankpa Fortune Chidinma</p>
              <p><span className="text-muted-foreground">Reg. Number:</span> 20211263825</p>
              <p><span className="text-muted-foreground">Department:</span> Computer Science</p>
              <p><span className="text-muted-foreground">School:</span> School of Information and Communication Technology</p>
              <p><span className="text-muted-foreground">Institution:</span> Federal University of Technology, Owerri</p>
              <p><span className="text-muted-foreground">Year:</span> 2026</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-sm text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
          >
            Start Exploring
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
