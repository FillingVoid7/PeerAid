'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavigationItem {
  href: string;
  label: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/medicalProfileVerification/createMedicalProfile',
    label: 'Create Profile',
    description: 'Upload medical documents for verification'
  },
  {
    href: '/medicalProfileVerification/viewMedicalProfile',
    label: 'View Profile',
    description: 'View your medical verification status'
  },
  {
    href: '/medicalProfileVerification/updateMedicalProfile',
    label: 'Update Profile',
    description: 'Update your medical documents'
  }
];

export default function MedicalProfileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Peer Aid
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )}
                >
                  <div className="text-center">
                    <div>{item.label}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors',
                pathname === item.href
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-gray-400">{item.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
