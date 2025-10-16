"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import profileService from "@/lib/Services/profileService";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Home() {
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
    if (!isAuthed) return "Log in to manage your Health Profile";
    if (hasProfile === null) return "Checking your profile...";
    return hasProfile ? "View your Health Profile" : "Create your Health Profile";
  }, [isAuthed, hasProfile]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center text-primary font-bold shadow-sm">
              PA
            </div>
            <span className="text-lg font-semibold tracking-tight">Peer-Aid</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <button onClick={handleHealthProfile} className="hover:text-primary transition-colors">HealthProfile</button>
            <a href="#about" className="hover:text-primary transition-colors">About Us</a>
            <Link href="/auth/login" className="hover:text-primary transition-colors">Login</Link>
          </nav>
          <div className="md:hidden">
            <Button size="sm" variant="outline" onClick={handleHealthProfile}>HealthProfile</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Ambient gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu blur-3xl" aria-hidden>
            <div className="relative left-1/2 -translate-x-1/2 aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-emerald-400/30 via-cyan-400/20 to-primary/20 opacity-60 dark:opacity-40" />
          </div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 transform-gpu blur-3xl" aria-hidden>
            <div className="h-56 w-[40rem] rounded-full bg-gradient-to-br from-primary/25 to-emerald-400/25 opacity-50" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 items-center gap-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground shadow-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Building compassionate connections
              </div>
              <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Find Understanding, Share Strength — Together on Peer-Aid
              </h1>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-prose">
                Connect with people who truly get it. Share practical insights, celebrate small wins,
                and navigate your health journey with empathy and clarity.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={handleHealthProfile} className="shadow-sm">
                  {healthProfileCtaLabel}
                </Button>
                <Link href="#about">
                  <Button size="lg" variant="outline">Learn more</Button>
                </Link>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {status === "loading" ? "Checking session..." : isAuthed ? "You're signed in" : "You're browsing as a guest"}
              </p>
              {/* Quick stats */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-xs text-muted-foreground">Supportive spaces</div>
                </div>
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="text-2xl font-bold">Smart</div>
                  <div className="text-xs text-muted-foreground">Peer matching</div>
                </div>
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="text-2xl font-bold">Private</div>
                  <div className="text-xs text-muted-foreground">By design</div>
                </div>
              </div>
            </div>

            <div>
              <div className="relative rounded-2xl border bg-card/70 backdrop-blur p-6 shadow-lg">
                <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-primary/15" />
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-emerald-400/10" />
                <div className="grid grid-cols-3 gap-3 text-center">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Safe Spaces</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Moderated communities to support real conversations.
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Smart Matching</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Connect with peers who truly relate to your circumstances.
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Guided Tools</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Track, reflect, and share progress with care.
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About / Features */}
      <main className="flex-1">
        <section id="about" className="bg-muted/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Community</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Join topic-focused groups where lived experience leads and empathy guides.
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Privacy First</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  You control what you share. Your data stays secure and respected.
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Anytime, Anywhere</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Seamless experience across devices with fast, accessible interfaces.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQs with collapse/expand */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight">Frequently Asked Questions</h2>
            <FAQ />
          </div>
        </section>
      </main>

      {/* Footer pinned to bottom */}
      <footer className="mt-auto border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>
            © {new Date().getFullYear()} Peer-Aid. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#about" className="hover:text-primary">About</a>
            <Link href="/auth/login" className="hover:text-primary">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQ() {
  const items = [
    {
      q: "What is Peer-Aid?",
      a:
        "Peer-Aid connects people with similar health journeys to support each other through shared experience and practical insight.",
    },
    {
      q: "How do I get started?",
      a: "Create or view your Health Profile to personalize matching and access relevant groups.",
    },
    {
      q: "Is my data private?",
      a: "Yes. We take privacy seriously and give you granular control over what you share.",
    },
    {
      q: "What does matching consider?",
      a: "We consider your preferences and profile details to recommend peers with relatable experiences.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-6 divide-y rounded-lg border bg-card/50 backdrop-blur">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="px-4 sm:px-6 py-3">
            <button
              className="w-full flex items-center justify-between text-left py-2"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${idx}`}
            >
              <span className="font-medium">{item.q}</span>
              <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border">
                <svg
                  className={`h-3 w-3 transition-transform ${isOpen ? "rotate-45" : "rotate-0"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M9 3h2v14H9z" />
                  <path d="M3 9h14v2H3z" />
                </svg>
              </span>
            </button>
            <div
              id={`faq-panel-${idx}`}
              className={`grid transition-all ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-80"}`}
            >
              <div className="overflow-hidden">
                <p className="pb-3 text-sm text-muted-foreground">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
