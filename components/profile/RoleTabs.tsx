import React from 'react';

interface RoleTabsProps {
  selectedRole: 'seeker' | 'guide' | null;
  onRoleChange: (role: 'seeker' | 'guide') => void;
}

export default function RoleTabs({ selectedRole, onRoleChange }: RoleTabsProps) {
  return (
    <div className="w-full mb-8">
      <div className="bg-gray-100 p-1 rounded-lg inline-flex w-full max-w-md mx-auto">
        <button
          onClick={() => onRoleChange('seeker')}
          className={`flex-1 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedRole === 'seeker'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Seeker
        </button>
        <button
          onClick={() => onRoleChange('guide')}
          className={`flex-1 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedRole === 'guide'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Guide
        </button>
      </div>
      
      <div className="mt-4 text-center">
        {selectedRole === 'seeker' && (
          <div className="text-blue-600">
            <p className="font-medium">Seeker Profile</p>
            <p className="text-sm text-gray-600">Looking for guidance and support from others who have experienced similar health conditions.</p>
          </div>
        )}
        {selectedRole === 'guide' && (
          <div className="text-green-600">
            <p className="font-medium">Guide Profile</p>
            <p className="text-sm text-gray-600">Sharing your experience to help others who are dealing with similar health conditions.</p>
          </div>
        )}
        {!selectedRole && (
          <div className="text-gray-500">
            <p className="font-medium">Choose Your Role</p>
            <p className="text-sm">Select whether you're seeking guidance or offering to guide others.</p>
          </div>
        )}
      </div>
    </div>
  );
}