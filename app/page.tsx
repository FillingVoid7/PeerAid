"use client";

import { 
  Navigation, 
  HeroSection, 
  FeaturesSection, 
  FAQSection, 
  Footer 
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
