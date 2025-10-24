'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, ChevronRight, Search, User, Users, MessageCircle, Shield, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import profileService from '@/lib/Services/profileService';

interface DashboardBreadcrumbProps {
  className?: string;
}

export const DashboardBreadcrumb: React.FC<DashboardBreadcrumbProps> = ({ 
  className = ""
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSeeker, setIsSeeker] = useState<boolean | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const isAuthed = Boolean(session?.user?.id);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user?.id) {
        setIsSeeker(null);
        return;
      }

      try {
        const response = await fetch('/api/user/role', { 
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        if (data.success && data.data?.userRole === 'seeker') {
          setIsSeeker(true);
        } else {
          setIsSeeker(false);
        }
      } catch (error) {
        setIsSeeker(false);
      }
    };

    checkUserRole();
  }, [session?.user?.id]);

  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user?.id) {
        setHasProfile(null);
        return;
      }
      try {
        const res = await profileService.checkProfileExists(session.user.id);
        setHasProfile(res.success ? res.hasProfile : false);
      } catch {
        setHasProfile(false);
      }
    };
    checkProfile();
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
    if (!isAuthed) return "My Profile";
    if (hasProfile === null) return "My Profile";
    return "My Profile";
  }, [isAuthed, hasProfile]);

  if (!isAuthed || isSeeker === null) {
    return null;
  }

  const breadcrumbItems = isSeeker ? [
    { label: "Find Guides", href: "/dashboard/matching", icon: Search },
    { label: "My Profile", onClick: handleHealthProfile, icon: User },
    { label: "Connections", href: "/dashboard/connections/seekerConnections", icon: Users },
    { label: "Chat", href: "/dashboard/chat", icon: MessageCircle },
  ] : [
    { label: "My Profile", onClick: handleHealthProfile, icon: User },
    { label: "Medical Profile", href: "/medicalProfileVerification/viewMedicalProfile", icon: Shield },
    { label: "Connections", href: "/dashboard/connections/guideConnections", icon: Users },
    { label: "Chat", href: "/dashboard/chat", icon: MessageCircle },
  ];

  return (
    <div className={`flex items-center overflow-x-auto scrollbar-hide ${className}`}>
      {/* Home Button - Always visible */}
      <Link href="/">
        <Button 
          variant="ghost" 
          size="sm"
          className="group bg-transparent border-none hover:bg-white/20 dark:hover:bg-gray-700/30 hover:backdrop-blur-sm hover:shadow-lg transition-all duration-300 ease-out text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 p-1 xs:p-2"
        >
          <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          <Home className="w-3 h-3 xs:w-4 xs:h-4 mr-0 xs:mr-1" />
          <span className="hidden xs:inline text-xs xs:text-sm">Home</span>
        </Button>
      </Link>

      {/* Mobile View: Show only first 2 items + dropdown for rest */}
      <div className="flex items-center sm:hidden">
        {breadcrumbItems.slice(0, 2).map((item, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-500 mx-1" />
            {item.href ? (
              <Link 
                href={item.href}
                className="p-2 rounded hover:bg-white/20 dark:hover:bg-gray-700/30 transition-colors"
                title={item.label}
              >
                <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400" />
              </Link>
            ) : (
              <button
                onClick={item.onClick}
                className="p-2 rounded hover:bg-white/20 dark:hover:bg-gray-700/30 transition-colors"
                title={item.label}
              >
                <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400" />
              </button>
            )}
          </div>
        ))}
        
        {breadcrumbItems.length > 2 && (
          <div className="flex items-center">
            <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-500 mx-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-1 hover:bg-white/20 dark:hover:bg-gray-700/30"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                {breadcrumbItems.slice(2).map((item, index) => (
                  <DropdownMenuItem 
                    key={index + 2}
                    className="flex items-center gap-2 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      if (item.href) {
                        router.push(item.href);
                      } else if (item.onClick) {
                        item.onClick();
                      }
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Tablet View: Show icons with abbreviated text */}
      <div className="hidden sm:flex lg:hidden items-center">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-500 mx-1" />
            {item.href ? (
              <Link 
                href={item.href}
                className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20 dark:hover:bg-gray-700/30"
              >
                <item.icon className="w-3 h-3" />
                <span className="hidden md:inline">{item.label.split(' ')[0]}</span>
              </Link>
            ) : (
              <button
                onClick={item.onClick}
                className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20 dark:hover:bg-gray-700/30"
              >
                <item.icon className="w-3 h-3" />
                <span className="hidden md:inline">{item.label.split(' ')[0]}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Desktop View: Show full text */}
      <div className="hidden lg:flex items-center">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-2" />
            {item.href ? (
              <Link 
                href={item.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-2 px-2 py-1 rounded hover:bg-white/20 dark:hover:bg-gray-700/30"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ) : (
              <button
                onClick={item.onClick}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-2 px-2 py-1 rounded hover:bg-white/20 dark:hover:bg-gray-700/30"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};