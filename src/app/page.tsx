'use client';

import React from 'react';
import { useAuth } from '../components/AuthProvider';
import Auth from '../components/Auth';


export default function Home() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      {/* <nav className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Sponsoru</h1>
          {user && <UserMenu user={user} />}
        </div>
      </nav> */}

      <main className="flex flex-col items-center p-6 md:p-24">
        <div className="z-10 max-w-5xl w-full flex-col items-center justify-between">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-blue-800">Welcome to Sponsoru</h1>
            <p className="text-lg text-gray-700">
              Connect your social media accounts and calculate your sponsorship rates
            </p>
          </div>
          
          {!user ? (
            <div className="w-full max-w-md mx-auto">
              <Auth onAuthSuccess={() => window.location.reload()} />
            </div>
          ) : (
            <div className="w-full space-y-8">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-semibold text-center mb-6 text-blue-800">Welcome back, {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}!</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-blue-800">📊 Social Media Analytics</h3>
                    <p className="text-gray-600 mb-4">
                      Connect your YouTube, Instagram, and other social media accounts to track your performance.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-green-800">💰 Sponsorship Calculator</h3>
                    <p className="text-gray-600 mb-4">
                      Calculate optimal sponsorship rates based on your engagement and follower metrics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-4">
                  Connect your social media accounts and start calculating your sponsorship rates.
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="/profile"
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Go to Profile
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
