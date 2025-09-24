import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ProfileExistsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileExistsDialog({ isOpen, onClose }: ProfileExistsDialogProps) {
  const router = useRouter();

  const handleViewProfile = () => {
    router.push('/healthProfile/viewProfile');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Dialog */}
      <div className="relative bg-card rounded-3xl shadow-2xl border border-border p-8 max-w-md mx-4 transform transition-all duration-300 scale-100">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">⚠️</span>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Profile Already Exists
          </h2>
          
          <p className="text-muted-foreground leading-relaxed">
            You already have a health profile created. You can view your existing profile or make updates to it.
          </p>

          <div className="bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mt-6">
            <p className="text-orange-700 dark:text-orange-300 text-sm">
              <strong>Note:</strong> You can only have one health profile. If you need to make changes, please edit your existing profile.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-8">
          <Button
            onClick={handleViewProfile}
            className="w-full py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            View My Profile
          </Button>
          
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full py-3 text-lg"
          >
            Go to Home
          </Button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
