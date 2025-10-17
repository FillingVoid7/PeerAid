"use client";

import Link from "next/link";
import { Heart, Shield, Mail, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/20 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">PeerAId</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              Find Your Health Twin. Connect with verified individuals who have overcome 
              the exact health challenges you're facing.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-emerald-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-emerald-600 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-emerald-600 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Platform</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
                How It Works
              </Link>
              <Link href="/safety" className="block text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
                Safety & Privacy
              </Link>
              <Link href="/community" className="block text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
                Community Guidelines
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
                Terms of Service
              </Link>
              <a href="mailto:support@peeraid.com" className="block text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
                <Mail className="w-4 h-4 inline mr-2" />
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 mt-8 border-t border-border/50">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="text-muted-foreground">HIPAA Compliant</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PeerAId. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Peer support platform, not medical service. Always consult healthcare professionals.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}