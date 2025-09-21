import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { CourseInput } from "@/components/course-input";
import { FeaturesShowcase } from "@/components/features-showcase";
import { ChatInterface } from "@/components/chat-interface";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <CourseInput />
        <FeaturesShowcase />
        <ChatInterface />
      </main>
    </div>
  );
};

export default Index;
