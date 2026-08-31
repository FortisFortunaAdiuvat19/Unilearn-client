import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, Youtube, ClipboardList, ChevronDown, ChevronUp,
  ExternalLink, FileQuestion, GraduationCap, ArrowRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import ContentGenerator from "./ContentGenerator";
import VideoSearch from "./VideoSearch";
import { useAuth } from "@/lib/AuthContext";

const sourceLabels = {
  google_drive: "Google Drive",
  generated: "AI Generated",
  web_search: "Web Search",
  manual: "Manual",
};

function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\?]+)/,
    /(?:youtu\.be\/)([^&\?]+)/,
    /(?:youtube\.com\/embed\/)([^&\?]+)/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

const tabs = [
  { id: "documents", label: "Documents", icon: FileText },
  { id: "videos", label: "Videos", icon: Youtube },
  { id: "assessments", label: "Assessments", icon: ClipboardList },
];

export default function CourseContent({ courseId, course }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("documents");
  const [expandedDoc, setExpandedDoc] = useState(null);

  const { data: documents = [] } = useQuery({
    queryKey: ["course-documents", courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}/documents`);
      return res.data;
    },
    initialData: [],
  });

  const { data: videos = [] } = useQuery({
    queryKey: ["course-videos", courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}/videos`);
      return res.data;
    },
    initialData: [],
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ["course-assessments", courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}/assessments`);
      return res.data;
    },
    initialData: [],
  });

  const totalCount = documents.length + videos.length + assessments.length;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="font-display text-2xl font-bold">
          Course Content
          {totalCount > 0 && (
            <span className="text-sm font-body font-normal text-muted-foreground ml-3">
              {totalCount} items
            </span>
          )}
        </h2>
        {user?.role === "admin" && <ContentGenerator course={course} />}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1.5 mb-6 border-b border-border/40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count =
            tab.id === "documents" ? documents.length
            : tab.id === "videos" ? videos.length
            : assessments.length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-sm">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Documents tab */}
      {activeTab === "documents" && (
        <div>
          {documents.length === 0 ? (
            <EmptyState icon={FileText} text="No documents yet. Generate course content to auto-create topic documents." />
          ) : (
            <div className="space-y-3">
              {documents.map((doc, i) => {
                const docId = doc._id || doc.id;
                const isExpanded = expandedDoc === docId;
                return (
                  <div key={docId} className="border border-border/40 rounded-sm overflow-hidden">
                    <button
                      onClick={() => setExpandedDoc(isExpanded ? null : docId)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{doc.title}</p>
                        {doc.topic && (
                          <p className="text-xs text-muted-foreground mt-0.5">{doc.topic}</p>
                        )}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border/40 px-2 py-0.5 rounded-sm">
                        {sourceLabels[doc.source_type] || doc.source_type}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="px-4 pb-4 border-t border-border/30 pt-4"
                      >
                        {doc.source_type === "google_drive" && doc.source_url ? (
                          <a
                            href={doc.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 border border-border/60 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:border-primary/40 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View on Google Drive
                          </a>
                        ) : (
                          <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
                            <ReactMarkdown>{doc.content}</ReactMarkdown>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Videos tab */}
      {activeTab === "videos" && (
        <div>
          {user?.role === "admin" && (
            <div className="mb-4">
              <VideoSearch courseId={courseId} courseTitle={course?.title} />
            </div>
          )}
          {videos.length === 0 ? (
            <EmptyState icon={Youtube} text="No videos yet. Generate course content to find relevant YouTube videos." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => {
                const videoId = getYouTubeId(video.url);
                const uniqueId = video._id || video.id;
                return (
                  <div key={uniqueId} className="border border-border/40 rounded-sm overflow-hidden">
                    {videoId ? (
                      <div className="aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={video.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-video bg-muted flex items-center justify-center"
                      >
                        <Youtube className="w-8 h-8 text-muted-foreground" />
                      </a>
                    )}
                    <div className="p-4">
                      <h4 className="font-display text-sm font-semibold mb-1 line-clamp-2">{video.title}</h4>
                      {video.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
                      )}
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                      >
                        Watch on YouTube <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Assessments tab */}
      {activeTab === "assessments" && (
        <div>
          {assessments.length === 0 ? (
            <EmptyState icon={ClipboardList} text="No assessments yet. Generate course content to create preparatory tests and exams." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.map((assessment) => {
                const isExam = assessment.type === "exam";
                const Icon = isExam ? GraduationCap : FileQuestion;
                const uniqueId = assessment._id || assessment.id;
                return (
                  <Link
                    key={uniqueId}
                    to={`/assessment/${uniqueId}`}
                    className="border border-border/40 rounded-sm p-5 hover:border-primary/30 transition-colors group block"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${isExam ? "bg-primary/10" : "bg-blue-500/10"}`}>
                        <Icon className={`w-5 h-5 ${isExam ? "text-primary" : "text-blue-600"}`} />
                      </div>
                      <div className="flex-1">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm ${isExam ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-600"}`}>
                          {isExam ? "Exam" : "Test"}
                        </span>
                        <h4 className="font-display text-base font-semibold mt-2 group-hover:text-primary transition-colors">
                          {assessment.title}
                        </h4>
                      </div>
                    </div>
                    {assessment.description && (
                      <p className="text-xs text-muted-foreground mb-3">{assessment.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      {isExam ? (
                        <>
                          <span>{assessment.objective_questions?.length || 0} objective Qs</span>
                          <span>·</span>
                          <span>{assessment.theory_questions?.length || 0} theory Qs</span>
                        </>
                      ) : (
                        <span>{assessment.theory_questions?.length || 0} theory questions</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary">
                      Take {isExam ? "Exam" : "Test"} <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="border border-dashed border-border/40 rounded-sm p-8 text-center">
      <Icon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
