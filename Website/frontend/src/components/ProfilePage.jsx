// ProfilePage.jsx
import React from 'react';
import { User } from 'lucide-react';

const ProfilePage = () => {
  const profile = {
    name: 'Shanvi Sinha',
    email: 'shanvi@example.com',
    org: 'EcoLedger Solutions',
    joined: '2025-05-21',
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-6 text-emerald-400 flex items-center"><User className="mr-2" /> Profile</h2>
        <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600 max-w-md">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Organization:</strong> {profile.org}</p>
          <p><strong>Joined:</strong> {profile.joined}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;