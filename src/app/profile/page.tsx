'use client';

import React from 'react';
import { useAuth } from '../../components/AuthProvider';
import Profile from '../../components/Profile';
import YouTubeConnect from '../../components/YouTubeConnect';
import InstagramConnect from '../../components/InstagramConnect';
import TikTokConnect from '../../components/TikTokConnect';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-gray-600 mb-4">You need to be signed in to view your profile.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    // The sign out logic is handled by the Profile component
    // After sign out, the user will be redirected by the AuthProvider
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <nav className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a 
            href="/"
            className="text-xl font-bold text-blue-600 hover:text-blue-800"
          >
            Sponsoru
          </a>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.email}
            </span>
            <a
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Home
            </a>
          </div>
        </div>
      </nav> */}
      <main className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Profile user={user} onSignOut={handleSignOut} />
          
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Social Media Connections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <YouTubeConnect />
              <InstagramConnect />
              <TikTokConnect />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 