'use client';

import React from 'react';
import { useAuth } from '../../components/AuthProvider';
import Profile from '../../components/Profile';
import YouTubeConnect from '../../components/YouTubeConnect';
import InstagramConnect from '../../components/InstagramConnect';
import TikTokConnect from '../../components/TikTokConnect';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  // AuthProvider handles loading and authentication states
  // If we reach here, the user is authenticated
  const handleSignOut = () => {
    // The sign out logic is handled by the Profile component
    // After sign out, the user will be redirected by the AuthProvider
    window.location.href = '/';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Profile user={user!} onSignOut={handleSignOut} />
      
      <div>
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Social Media Connections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <YouTubeConnect />
          <InstagramConnect />
          <TikTokConnect />
        </div>
      </div>
    </div>
  );
} 