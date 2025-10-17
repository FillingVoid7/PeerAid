"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Users,
  Shield,
  CheckCircle,
  Brain,
  UserCheck,
  ArrowRight,
  Info,
  Handshake,
  ArrowLeft,
} from "lucide-react";

export default function AboutPage() {
  const missionPoints = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Empathy First",
      description: "Every feature designed with compassion and understanding",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Evidence-Based",
      description: "Real experiences and verified results guide our platform",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community-Driven",
      description: "Built by and for our users' real needs",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy by Design",
      description: "Your data belongs to you, always",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Your Health Profile",
      description:
        "Build your profile as a Seeker or Guide with your health journey details.",
      icon: <UserCheck className="w-8 h-8" />,
      color: "from-emerald-500 to-cyan-600",
    },
    {
      step: "02",
      title: "Get Smart Matches",
      description:
        "Our algorithm connects you with verified peers who understand your experience.",
      icon: <Brain className="w-8 h-8" />,
      color: "from-violet-500 to-purple-600",
    },
    {
      step: "03",
      title: "Start Conversations",
      description:
        "Chat privately with your matches in secure, encrypted messaging spaces.",
      icon: <Handshake className="w-8 h-8" />,
      color: "from-rose-500 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex justify-left p-4 md:p-8">
        <Button
          variant="ghost"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all duration-300 group px-4 py-2 rounded-xl"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </Button>
      </div>
      {/* Hero Section */}
      <section className="relative py-8 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-br from-emerald-400/20 via-cyan-400/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-violet-400/15 via-purple-400/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              <span className="inline">Revolutionizing </span>
              <span className="inline bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent">
                Health Support
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              PeerAId is the first peer-to-peer health experience platform that
              connects you with verified individuals who have overcome the exact
              health challenges you're facing.
            </p>
          </div>
        </div>
      </section>

      {/* What is PeerAId */}
      <section className="py-20 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  What is PeerAId?
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  PeerAId bridges the gap between those currently experiencing
                  health issues and those who have successfully navigated
                  similar challenges. We provide verified, experience-based
                  guidance through secure chat conversations with your health
                  twins.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl border bg-card/70 backdrop-blur-lg p-8 shadow-2xl">
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 blur-lg" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-gradient-to-br from-violet-400/15 to-purple-400/15 blur-lg" />

                <div className="relative space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
                    <p className="text-muted-foreground mb-6">
                      To create a world where no one has to face health
                      challenges alone.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {missionPoints.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 text-emerald-600">
                          {point.icon}
                        </div>
                        <div>
                          <h5 className="font-medium">{point.title}</h5>
                          <p className="text-sm text-muted-foreground">
                            {point.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How PeerAId Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              How PeerAId Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <Card
                key={index}
                className="border-0 bg-background/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                <CardContent className="p-8 text-center relative">
                  <div className="absolute top-4 right-4 text-6xl font-bold text-muted-foreground/10">
                    {step.step}
                  </div>

                  <div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {step.icon}
                  </div>

                  <h3 className="text-lg font-bold mb-4 group-hover:text-emerald-600 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-violet-500/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Find Your Health Twin?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands who have found support, answers, and hope through
              PeerAId
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group px-8 py-6 text-lg"
                asChild
              >
                <Link href="/auth/login">
                  <Heart className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Start Your Journey - It's Free
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 hover:bg-muted/50 backdrop-blur-sm group px-8 py-6 text-lg"
                asChild
              >
                <Link href="/#features">
                  <Users className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Learn More About Features
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
