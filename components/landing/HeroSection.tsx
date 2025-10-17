"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useCallback, useMemo } from "react";
import profileService from "@/lib/Services/profileService";
import { 
  Heart, 
  Users, 
  Shield, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Play,
  Star,
  CheckCircle
} from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const isAuthed = Boolean(session?.user?.id);

  useEffect(() => {
    let isMounted = true;
    const checkProfile = async () => {
      if (!session?.user?.id) {
        setHasProfile(null);
        return;
      }
      try {
        const res = await profileService.checkProfileExists(session.user.id);
        if (!isMounted) return;
        setHasProfile(res.success ? res.hasProfile : false);
      } catch {
        if (!isMounted) return;
        setHasProfile(false);
      }
    };
    checkProfile();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  const handleGuideProfile = useCallback(() => {
    if (!isAuthed) {
      router.push("/auth/login");
      return;
    }
    if (hasProfile) {
      router.push("/healthProfile/viewProfile");
      return;
    }
    router.push("/healthProfile/createProfile");
  }, [isAuthed, hasProfile, router]);

  const handleHealthProfile = useCallback(() => {
    if (!isAuthed) {
      router.push("/auth/login");
      return;
    }
    if (hasProfile) {
      router.push("/healthProfile/viewProfile");
      return;
    }
    router.push("/healthProfile/createProfile");
  }, [isAuthed, hasProfile, router]);

  const healthProfileCtaLabel = useMemo(() => {
    if (!isAuthed) return "Start Your Journey";
    if (hasProfile === null) return "Checking your profile...";
    return hasProfile ? "View Your Profile" : "Create Your Profile";
  }, [isAuthed, hasProfile]);

  const stats = [
    {
      icon: <Users className="w-5 h-5" />,
      value: "92%",
      label: "Better Matches",
      description: "More relevant than traditional forums"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      value: "87%",
      label: "More Confident",
      description: "In health decisions after using PeerAId"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      value: "94%",
      label: "Trust Verification",
      description: "Appreciate our verification system"
    }
  ];

  const features = [
    {
      title: "Verified Health Journeys",
      description: "Every guide has been through the health journey they're advising on.",
      icon: <Shield className="w-6 h-6" />,
      color: "from-emerald-500 to-cyan-600"
    },
    {
      title: "Precision Matching",
      description: "Our algorithm goes beyond simple keywords to find your exact health twin.",
      icon: <Users className="w-6 h-6" />,
      color: "from-violet-500 to-purple-600"
    },
    {
      title: "Secure Communication",
      description: "Private, encrypted messaging and audio calls that protect your identity.",
      icon: <Heart className="w-6 h-6" />,
      color: "from-rose-500 to-pink-600"
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        {/* Main gradient orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-br from-emerald-400/30 via-cyan-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-violet-400/20 via-purple-400/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-br from-rose-400/10 via-pink-400/5 to-transparent rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-300" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-700" />
        <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-1100" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {/* Hero Header */}
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 backdrop-blur-sm px-4 py-2 text-sm shadow-lg">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">Building compassionate connections</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                <span className="inline">Find Your </span>
                <span className="inline bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent">
                  Health Twin
                </span>
                <span className="block text-xl sm:text-2xl lg:text-3xl mt-6 font-normal text-muted-foreground leading-relaxed">Connect with People Who Truly Understand Your Journey</span>
              </h1>
              
              {/* <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                PeerAId is the first peer-to-peer health experience platform that connects you with verified individuals who have overcome the exact health challenges you're facing. No more guessing, no more misinformation—just real people, real experiences, real solutions.
              </p> */}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button 
                size="lg" 
                onClick={handleHealthProfile}
                className="relative bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-600 hover:from-emerald-600 hover:via-cyan-600 hover:to-emerald-700 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 group px-20 py-6 text-lg font-semibold rounded-2xl border-0 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Heart className="w-6 h-6 mr-3 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
                <span className="relative z-10">Start Your Health Journey - Find Your Match</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/0 via-cyan-400/0 to-emerald-400/0 group-hover:from-emerald-400/20 group-hover:via-cyan-400/20 group-hover:to-emerald-400/20 transition-all duration-300" />
              </Button>
              
              <Button 
                size="lg" 
                onClick={handleGuideProfile}
                className="relative bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 group px-20 py-6 text-lg font-semibold rounded-2xl border-0 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Users className="w-6 h-6 mr-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                <span className="relative z-10">Join as a Guide - Share Your Experience</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-violet-400/20 group-hover:via-purple-400/20 group-hover:to-pink-400/20 transition-all duration-300" />
              </Button>
            </div>
          </div>

          {/* Real Results - Horizontal Section */}
          <div className="space-y-8">        
            <div className="grid md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="border-0 bg-background/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">{stat.value}</div>
                      <div className="text-xl font-semibold">{stat.label}</div>
                      <div className="text-muted-foreground">{stat.description}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Choose PeerAId - Standalone Section */}
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose PeerAId?</h2>
              <p className="text-xl text-muted-foreground">Experience the difference of genuine peer support</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 group cursor-pointer overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10">
                          {feature.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <h4 className="text-2xl font-bold group-hover:text-emerald-600 transition-colors duration-300">
                          {feature.title}
                        </h4>
                        <p className="text-lg text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                          {feature.description}
                        </p>
                        <div className="w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:w-20 transition-all duration-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Platform Preview Section */}
          <div className="relative mt-20">
            <div className="text-center max-w-4xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                See PeerAId in Action
              </h2>
              <p className="text-xl text-muted-foreground">
                Experience our intuitive platform designed for meaningful health connections
              </p>
            </div>
            
            <div className="relative max-w-4xl mx-auto">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse delay-1000" />
              
              {/* Main image container */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-violet-500/10 rounded-2xl blur-lg transition-all duration-500" />
                
                <div className="relative bg-background/90 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
                  
                  <div className="relative p-4">
                    <Image
                      src="/assets/Screenshot 2025-10-17 084513.png"
                      alt="PeerAId Platform Interface - Connect with verified health guides"
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-xl shadow-lg border border-border/30"
                      quality={95}
                      priority
                    />
                    
                    {/* Floating badges */}
                    <div className="absolute top-6 left-6 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      ✨ Live Platform
                    </div>
                    
                    <div className="absolute bottom-6 right-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      🔒 Secure & Private
                    </div>
                  </div>
                </div>
              </div>
              
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}