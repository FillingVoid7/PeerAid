"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import profileService from "@/lib/Services/profileService";
import { 
  Heart, 
  Users, 
  Shield, 
  CheckCircle
} from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const { data: session } = useSession();
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

  const stats = [
    {
      icon: <Users className="w-5 h-5" />,
      value: "92%",
      label: "Better Matches",
      description: "More relevant connections"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      value: "87%",
      label: "More Confident",
      description: "In health decisions"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      value: "94%",
      label: "Trust Verified",
      description: "Secure and authentic"
    }
  ];

  const features = [
    {
      title: "Verified Health Journeys",
      description: "Every guide has been through the health journey they're advising on.",
      icon: <Shield className="w-5 h-5" />,
      color: "bg-emerald-500"
    },
    {
      title: "Precision Matching",
      description: "Our algorithm goes beyond simple keywords to find your exact health twin.",
      icon: <Users className="w-5 h-5" />,
      color: "bg-emerald-600"
    },
    {
      title: "Secure Communication",
      description: "Private, encrypted messaging and audio calls that protect your identity.",
      icon: <Heart className="w-5 h-5" />,
      color: "bg-green-600"
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Subtle background glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-12">
        <div className="space-y-20">
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Building compassionate connections
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-foreground">
                Find Your <span className="text-emerald-600 dark:text-emerald-400">Health Twin</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Connect with verified individuals who have overcome the exact health challenges you&apos;re facing. Real people, real experiences.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={handleHealthProfile}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-base font-medium rounded-xl transition-all shadow-sm"
              >
                <Heart className="w-5 h-5 mr-2" />
                Find a Match
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleGuideProfile}
                className="px-8 py-6 text-base font-medium rounded-xl border-border hover:bg-muted transition-all"
              >
                <Users className="w-5 h-5 mr-2" />
                Become a Guide
              </Button>
            </div>
          </div>


          {/* Features Section */}
          <div className="relative py-12 my-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 relative z-10">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col gap-5 group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-2xl group-hover:bg-emerald-500/40 transition-colors duration-500" />
                      <div className={`relative flex items-center justify-center w-14 h-14 rounded-2xl ${feature.color} text-white shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                        {feature.icon}
                      </div>
                    </div>
                    <h4 className="text-xl font-bold tracking-tight text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                      {feature.title}
                    </h4>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>


          {/* Platform Preview Section */}
          <div className="relative pt-12">
            <div className="relative max-w-5xl mx-auto rounded-2xl border border-border/50 bg-muted/30 p-2 sm:p-4 shadow-2xl">
              <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl blur-xl -z-10" />
              <Image
                src="/assets/Screenshot 2025-10-17 084513.png"
                alt="PeerAId Platform Interface"
                width={1200}
                height={800}
                className="w-full h-auto rounded-xl border border-border/50 shadow-sm"
                quality={90}
                priority
              />
            </div>
          </div>

          {/* Stats Section - Minimalist */}
          <div className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border/50">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center justify-center text-center space-y-2 pt-4 md:pt-0 first:pt-0">
                  <div className="text-4xl font-bold text-foreground">{stat.value}</div>
                  <div className="font-medium text-emerald-600 dark:text-emerald-400">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}