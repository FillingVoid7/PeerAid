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
          a: "Peer-Aid is a secure platform that connects people with similar health journeys to provide mutual support. Our smart matching algorithm pairs you with peers who understand your experiences, creating meaningful connections in safe, moderated spaces."
        },
        {
          q: "How do I get started on Peer-Aid?",
          a: "Simply create your Health Profile to personalize your experience. You can choose what information to share, set your privacy preferences, and start connecting with relevant community groups immediately."
        },
        {
          q: "Is Peer-Aid free to use?",
          a: "Yes! Core features including community access, peer matching, and basic messaging are completely free. We offer premium features for enhanced functionality, but meaningful connections start at no cost."
        }
      ]
    },
    {
      category: "Privacy & Security",
      icon: <Shield className="w-5 h-5" />,
      questions: [
        {
          q: "How is my personal health information protected?",
          a: "We use military-grade 256-bit encryption, are HIPAA compliant, and follow strict data protection protocols. You have granular control over what you share, and your data is never sold or shared without your explicit consent."
        },
        {
          q: "Can I control what information is visible to others?",
          a: "Absolutely! You have complete control over your privacy settings. Choose what to share in your profile, which communities to join, and how much detail to include in discussions. Your comfort and privacy come first."
        },
        {
          q: "What happens to my data if I leave the platform?",
          a: "You can download your data at any time and request complete account deletion. When you delete your account, we permanently remove your personal information while maintaining anonymized community insights to help future members."
        }
      ]
    },
    {
      category: "Community & Matching",
      icon: <Users className="w-5 h-5" />,
      questions: [
        {
          q: "How does the peer matching algorithm work?",
          a: "Our algorithm considers your health profile, interests, communication preferences, and community activity to suggest meaningful connections. It learns from your interactions to improve recommendations while always respecting your privacy choices."
        },
        {
          q: "Are the communities moderated?",
          a: "Yes! All communities have trained moderators who ensure conversations remain supportive, respectful, and on-topic. We use both automated tools and human oversight to maintain a safe environment for everyone."
        },
        {
          q: "Can I join multiple communities?",
          a: "Of course! You can join as many communities as relevant to your interests and health journey. Each community has its own culture and focus, allowing you to find the right support for different aspects of your experience."
        }
      ]
    },
    {
      category: "Features & Support",
      icon: <Zap className="w-5 h-5" />,
      questions: [
        {
          q: "What features are available for connecting with peers?",
          a: "You can engage through community discussions, private messaging, group chats, virtual meetups, and resource sharing. We also offer mood tracking, progress journals, and goal-setting tools to support your journey."
        },
        {
          q: "Is there professional medical support available?",
          a: "While Peer-Aid focuses on peer support, we partner with healthcare professionals who volunteer their time for educational content and crisis resources. However, peer discussions never replace professional medical advice."
        },
        {
          q: "How do I report inappropriate behavior?",
          a: "Every message and post has a report function. Our moderation team reviews reports within 24 hours and takes appropriate action. We have zero tolerance for harassment, spam, or violations of our community guidelines."
        }
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
            Find answers to common questions about Peer-Aid. Can't find what you're looking for? 
            Reach out to our support team.
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

        {/* Contact Support */}
        <div className="text-center mt-12">
          <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-violet-500/5 border border-emerald-200/20 dark:border-emerald-800/20">
            <h3 className="text-lg font-semibold mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Our support team is here to help you get the most out of Peer-Aid.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a 
                href="mailto:support@peer-aid.com" 
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Contact Support
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a 
                href="#" 
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Community Guidelines
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}