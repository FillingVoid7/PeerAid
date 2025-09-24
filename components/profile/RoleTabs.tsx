import React from 'react';

interface RoleTabsProps {
  selectedRole: 'seeker' | 'guide' | null;
  onRoleChange: (role: 'seeker' | 'guide') => void;
}

export default function RoleTabs({ selectedRole, onRoleChange }: RoleTabsProps) {
  return (
    <div className="w-full mb-14">
      <div className="bg-muted p-2 rounded-2xl inline-flex w-full max-w-full shadow-lg">
        <button
          onClick={() => onRoleChange('seeker')}
          className={`flex-1 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${
            selectedRole === 'seeker'
              ? 'bg-background text-blue-600 shadow-lg dark:text-blue-400 transform scale-105'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          Seeker
        </button>
        <button
          onClick={() => onRoleChange('guide')}
          className={`flex-1 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${
            selectedRole === 'guide'
              ? 'bg-background text-green-600 shadow-lg dark:text-green-400 transform scale-105'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          Guide
        </button>
      </div>
      
      <div className="mt-6 text-center">
        {selectedRole === 'seeker' && (
          <div className="text-blue-600 dark:text-blue-400">
            <p className="font-bold text-lg">Seeker Profile</p>
            <p className="text-muted-foreground">Looking for guidance and support from others who have experienced similar health conditions.</p>
          </div>
        )}
        {selectedRole === 'guide' && (
          <div className="text-green-600 dark:text-green-400">
            <p className="font-bold text-lg">Guide Profile</p>
            <p className="text-muted-foreground">Sharing your experience to help others who are dealing with similar health conditions.</p>
          </div>
        )}
        {!selectedRole && (
          <div className="text-muted-foreground">
            <p className="font-bold text-lg">Choose Your Role</p>
            <p>Select whether you're seeking guidance or offering to guide others.</p>
          </div>
        )}
      </div>
    </div>
  );
}