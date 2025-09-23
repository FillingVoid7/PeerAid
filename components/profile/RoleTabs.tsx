import React from 'react';

interface RoleTabsProps {
  selectedRole: 'seeker' | 'guide' | null;
  onRoleChange: (role: 'seeker' | 'guide') => void;
}

export default function RoleTabs({ selectedRole, onRoleChange }: RoleTabsProps) {
  return (
    <div className="w-full mb-8">
      <div className="bg-muted p-1 rounded-lg inline-flex w-full max-w-md mx-auto">
        <button
          onClick={() => onRoleChange('seeker')}
          className={`flex-1 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedRole === 'seeker'
              ? 'bg-background text-blue-600 shadow-sm dark:text-blue-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Seeker
        </button>
        <button
          onClick={() => onRoleChange('guide')}
          className={`flex-1 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedRole === 'guide'
              ? 'bg-background text-green-600 shadow-sm dark:text-green-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Guide
        </button>
      </div>
      
      <div className="mt-4 text-center">
        {selectedRole === 'seeker' && (
          <div className="text-blue-600 dark:text-blue-400">
            <p className="font-medium">Seeker Profile</p>
            <p className="text-sm text-muted-foreground">Looking for guidance and support from others who have experienced similar health conditions.</p>
          </div>
        )}
        {selectedRole === 'guide' && (
          <div className="text-green-600 dark:text-green-400">
            <p className="font-medium">Guide Profile</p>
            <p className="text-sm text-muted-foreground">Sharing your experience to help others who are dealing with similar health conditions.</p>
          </div>
        )}
        {!selectedRole && (
          <div className="text-muted-foreground">
            <p className="font-medium">Choose Your Role</p>
            <p className="text-sm">Select whether you're seeking guidance or offering to guide others.</p>
          </div>
        )}
      </div>
    </div>
  );
}