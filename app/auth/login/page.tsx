"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ButtonLoading } from "@/components/isLoading";
import { ModeToggle } from "@/components/ui/ThemeToggle";
export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.log("Error during sign-in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Theme Toggle - Top Right Corner */}
      <div className="absolute top-4 right-4 z-20">
        <ModeToggle />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 dark:bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-purple-400 dark:bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-400 dark:bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-8 pb-8 pt-12 px-8">
            <div className="text-center">
              {/* Updated logo to match navigation bar */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg text-xl transform hover:scale-105 transition-transform duration-300">
                    PA
                  </div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    Peer-Aid
                  </span>
                  <div className="text-sm text-muted-foreground -mt-1">
                    Health Community Platform
                  </div>
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                Connect with people sharing common health experiences.<br />
                Sign in to continue your journey.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-10 px-8">
            <div className="space-y-6">
              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full h-14 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-base"
                variant="outline"
              >
                {isLoading ? (
                  <ButtonLoading text="Signing in..." />
                ) : (
                  <div className="flex items-center justify-center space-x-4">
                    {/* Enhanced Google icon with better styling */}
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </div>
                    <span className="font-semibold tracking-wide">Continue with Google</span>
                  </div>
                )}
              </Button>
              
              {/* Enhanced divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400 font-medium tracking-wide">Secure Authentication</span>
                </div>
              </div>
              
            </div>
          </CardContent>
        </Card>
        
        {/* Subtle floating elements with dark mode support */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 dark:bg-emerald-700 rounded-full opacity-60 animate-bounce delay-300"></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-cyan-200 dark:bg-cyan-700 rounded-full opacity-60 animate-bounce delay-700"></div>
      </div>
    </main>
  );
}
