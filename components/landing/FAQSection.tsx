"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, HelpCircle, Shield, Users, Heart, Zap } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Getting Started",
      icon: <Heart className="w-5 h-5" />,
      questions: [
        {
          q: "What is Peer-Aid and how does it work?",
          a: "Peer-Aid connects people with similar health journeys to provide mutual support. Our smart matching algorithm pairs you with peers who understand your experiences and can offer empathy, advice, and encouragement one-on-one interactions."
        },
        {
          q: "How do I get started on Peer-Aid?",
          a: "Simply create your Health Profile based on your role Seeker or Guide. And based on the matching algorithm, you are off to good connections with peers."
        },
        {
          q: "Is Peer-Aid free to use?",
          a: "Yes! Peer-Aid is free to use."
        }
      ]
    },
    {
      category: "Privacy & Security",
      icon: <Shield className="w-5 h-5" />,
      questions: [
        {
          q: "How is my personal health information protected?",
          a: "We have used anonymity measures to ensure your data is never sold or shared without your explicit consent. Also we employ end-to-end encryption for all communications and store data securely using industry best practices."
        }
      ]
    },
    {
      category: "Community & Matching",
      icon: <Users className="w-5 h-5" />,
      questions: [
        {
          q: "How does the peer matching algorithm work?",
          a: "Our algorithm considers your health profile, interests, communication preferences, and community activity to suggest meaningful connections."
        },
      ]
    },
    {
      category: "Features & Support",
      icon: <Zap className="w-5 h-5" />,
      questions: [
        {
          q: "What features are available for connecting with peers?",
          a: "You can engage in private messaging, virtual meetups, and resource sharing."
        },
        {
          q: "Is there professional medical support available?",
          a: "This platform is designed for peer support and does not replace professional medical advice. Always consult with a healthcare professional for medical concerns."
        },
      ]
    }
  ];

  const allQuestions = faqs.flatMap(category => 
    category.questions.map(q => ({ ...q, category: category.category, icon: category.icon }))
  );

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 backdrop-blur-sm px-4 py-2 text-sm shadow-sm mb-6">
            <HelpCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-700 dark:text-emerald-300 font-medium">Got Questions?</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            <span className="block">Frequently Asked</span>
            <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about Peer-Aid.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Card className="border-0 bg-card/30 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="divide-y divide-border/50">
            {allQuestions.map((item, index) => {
              const isOpen = openIndex === index;
              
              return (
                <div key={index} className="group">
                  <button
                    className="w-full flex items-center justify-between text-left p-6 hover:bg-muted/20 transition-colors duration-200"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 text-emerald-600 mt-0.5">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">
                          {item.category}
                        </div>
                        <span className="font-semibold text-base leading-tight pr-4">
                          {item.q}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-background/50">
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                  
                  <div
                    id={`faq-panel-${index}`}
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen 
                        ? "grid-rows-[1fr] opacity-100" 
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6">
                        <div className="ml-14 pt-2 border-l-2 border-emerald-200 dark:border-emerald-800 pl-6">
                          <p className="text-muted-foreground leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
}