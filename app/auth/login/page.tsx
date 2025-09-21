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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-8 pb-8 pt-12 px-8">
            <div className="text-center">
              {/* Enhanced logo with better styling */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-bold text-white tracking-wide">PA</span>
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
                Welcome to PeerAid
              </CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Connect to people for sharing common health experiences.<br />
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-10 px-8">
            <div className="space-y-6">
              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-base"
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
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-500 font-medium tracking-wide">Secure Authentication</span>
                </div>
              </div>
              
              {/* Enhanced footer text */}
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500 leading-relaxed">
                  By continuing, you agree to our{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Privacy Policy
                  </a>
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Protected by Google</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Subtle floating elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-200 rounded-full opacity-60 animate-bounce delay-300"></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-200 rounded-full opacity-60 animate-bounce delay-700"></div>
      </div>
    </main>
  );
}
