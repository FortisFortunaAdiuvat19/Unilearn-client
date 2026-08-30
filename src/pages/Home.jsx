import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import FeaturesSection from "@/components/home/FeaturesSection";
import CTASection from "@/components/home/CTASection";

const HERO_IMAGE = "https://media.base44.com/images/public/6a341db2b72a28b8c01dd43f/7ba89dc2c_generated_e6b29771.png";
const BG_TEXTURE = "https://media.base44.com/images/public/6a341db2b72a28b8c01dd43f/0acbdada4_generated_6c020793.png";

export default function Home() {
  const { data: courses = [] } = useQuery({
    queryKey: ["featured-courses"],
    queryFn: async () => {
      const res = await apiClient.get("/courses?featured=true&limit=10");
      return res.data;
    },
  });

  // Fallback to all courses if no featured ones
  const { data: allCourses = [] } = useQuery({
    queryKey: ["all-courses-home"],
    queryFn: async () => {
      const res = await apiClient.get("/courses?limit=10");
      return res.data;
    },
    enabled: courses.length === 0,
  });

  const displayCourses = courses.length > 0 ? courses : allCourses;

  return (
    <div>
      <HeroSection heroImage={HERO_IMAGE} />
      <FeaturedCourses courses={displayCourses} />
      <FeaturesSection />
      <CTASection bgImage={BG_TEXTURE} />
    </div>
  );
}
