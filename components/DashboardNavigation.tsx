'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Users, Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useChat } from '@/lib/chat-context';

interface NavigationProps {
  className?: string;
}

export const DashboardNavigation: React.FC<NavigationProps> = ({ className }) => {
  const pathname = usePathname();
  const { conversations } = useChat();

  const totalUnread = conversations?.reduce((sum, c) => sum + (c.unreadCount || 0), 0) || 0;

  const navItems = [
    {
      href: '/dashboard/matching',
      label: 'Matching',
      icon: Search,
      description: 'Find peer support'
    },
    {
      href: '/dashboard/connections',
      label: 'Connections',
      icon: Users,
      description: 'Manage connections'
    },
    {
      href: '/dashboard/chat',
      label: 'Chat',
      icon: MessageCircle,
      description: 'Messages',
      badge: totalUnread > 0 ? String(Math.min(totalUnread, 99)) : undefined
    }
  ];

  return (
    <nav className={cn("flex items-center gap-2", className)}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "flex items-center gap-2 relative",
                isActive && "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
              {item.badge && (
                <Badge 
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
};