"use client";

import { 
  Users, 
  Shield, 
  Clock, 
  MessageCircle, 
  Brain, 
  Heart,
  Lock,
  Smartphone,
  UserCheck,
  Globe,
  Zap,
  Award
} from "lucide-react";
import React from "react";

export default function FeaturesSection() {
  const mainFeatures = [
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Verified Health Journeys",
      description: "Every guide on our platform goes through a strict verification process. We ensure their health journeys are authentic, providing you with credible advice and genuine empathy from someone who has truly been there.",
      benefits: ["Medical documentation", "Community validation", "Authentic experiences"]
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Precision Matching", 
      description: "Finding the right person to talk to shouldn't be a guessing game. Our advanced algorithm matches you based on granular details like specific symptoms, treatment paths, and timeline similarities.",
      benefits: ["85% condition similarity", "75% symptom overlap", "70% treatment effectiveness"]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Complete Privacy Control",
      description: "Your health information is sensitive. That's why we built our platform with privacy-first architecture, allowing you to share as much or as little as you want securely.",
      benefits: ["End-to-end encryption", "Random usernames", "You control visibility"]
    }
  ];

  return (
    <section id="features" className="py-2 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium shadow-sm mb-8">
            <Zap className="w-4 h-4" />
            Powerful Features
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We've designed PeerAId to prioritize safety, relevance, and privacy.
          </p>
        </div>

        {/* Vertical Features Layout */}
        <div className="space-y-32">
          {mainFeatures.map((feature, index) => (
            <div key={index} className={`flex flex-col lg:flex-row gap-12 lg:gap-24 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Text Content */}
              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-3xl sm:text-4xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <ul className="space-y-4 pt-4">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-foreground font-medium">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-base sm:text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Graphic Area */}
              <div className="flex-1 w-full max-w-xl lg:max-w-none flex items-center justify-center">
                <div className="relative group">
                  {/* Subtle background glow for the icon */}
                  <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full group-hover:bg-emerald-500/30 transition-colors duration-500" />
                  
                  <div className="relative z-10 text-emerald-500 dark:text-emerald-400 drop-shadow-lg group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500">
                    {React.cloneElement(feature.icon as any, { className: 'w-40 h-40 sm:w-40 sm:h-40' })}
                  </div>
                  
                  {/* Small floating elements */}
                  <div className="absolute -top-6 -right-6 w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center rotate-12 group-hover:rotate-6 transition-all duration-500">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-8 -left-4 w-16 h-16 bg-emerald-500/5 rounded-2xl flex items-center justify-center -rotate-6 group-hover:-rotate-12 transition-all duration-500">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}