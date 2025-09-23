import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ModeToggle } from "@/components/ui/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PeerAid",
  description: "Health condition peer support platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={null}>
          <div className="fixed top-4 right-4 z-50">
            <ModeToggle />
          </div>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
