"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/ThemeToggle";
import { useState, useEffect, useCallback, useMemo } from "react";
import profileService from "@/lib/Services/profileService";
import { Menu, X, User, Activity, Shield, LogIn, LogOut } from "lucide-react";

export default function Navigation() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
  }, [isAuthed, hasProfile, router]);

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
    setIsMobileMenuOpen(false);
  }, []);

  const healthProfileCtaLabel = useMemo(() => {
    if (!isAuthed) return "Health Profile";
    if (hasProfile === null) return "Health Profile";
    return hasProfile ? "My Profile" : "Create Profile";
  }, [isAuthed, hasProfile]);

  const navItems = [
    { label: "Home", href: "/" },
    { 
      label: healthProfileCtaLabel, 
      onClick: handleHealthProfile, 
      icon: <User className="w-4 h-4" />
    },
    { label: "Features", href: "#features", icon: <Activity className="w-4 h-4" /> },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                PA
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Peer-Aid
              </span>
              <div className="text-xs text-muted-foreground -mt-0.5">
                Health Community Platform
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <div key={index}>
                {item.href ? (
                  <Link 
                    href={item.href} 
                    className="flex items-center gap-2 text-sm font-medium hover:text-emerald-600 transition-colors duration-200 group"
                  >
                    {item.icon}
                    <span className="relative">
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                ) : (
                  <button 
                    onClick={item.onClick} 
                    className="flex items-center gap-2 text-sm font-medium hover:text-emerald-600 transition-colors duration-200 group"
                  >
                    {item.icon}
                    <span className="relative">
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:w-full transition-all duration-300" />
                    </span>
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ModeToggle />
            {isAuthed ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-950/30 transition-colors duration-200"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {session?.user?.alias || session?.user?.email}
                <LogOut className="w-3 h-3 ml-1" />
              </button>
            ) : (
              <Link href="/auth/login">
                <Button 
                  variant="default" 
                  className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <div key={index}>
                  {item.href ? (
                    <Link 
                      href={item.href} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ) : (
                    <button 
                      onClick={item.onClick}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors w-full text-left"
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )}
                </div>
              ))}
              
              <div className="pt-4 border-t border-border/50">
                {isAuthed ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 transition-colors w-full text-left"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium flex-1">
                      {session?.user?.alias || session?.user?.email}
                    </span>
                    <LogOut className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </button>
                ) : (
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}