'use client';

import React, { useState, useEffect } from 'react';
import { InstagramAPI } from '../lib/social-apis/instagram';

interface InstagramAccountStats {
  followersCount: string;
  followsCount: string;
  mediaCount: string;
  accountType: string;
  username: string;
  name: string;
  profilePictureUrl?: string;
}

export default function InstagramConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [accountStats, setAccountStats] = useState<InstagramAccountStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user already has Instagram tokens
    const tokens = localStorage.getItem('instagram_tokens');
    if (tokens) {
      setIsConnected(true);
      fetchAccountStats();
    }
  }, []);

  const handleConnect = () => {
    const appId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
    if (!appId) {
      setError('Instagram App ID not configured. Please check your environment variables.');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/instagram/callback`;
    // Use Facebook Login scopes that work with Instagram
    const scopes = 'instagram_basic,instagram_content_publish';
    const responseType = 'code';
    const state = Math.random().toString(36).substring(7);

    // Store state for validation
    localStorage.setItem('instagram_oauth_state', state);

    // Use Facebook OAuth endpoint (which is what you've configured in Developer Console)
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=${responseType}&` +
      `state=${state}`;

    console.log('Redirecting to Facebook/Instagram auth:', authUrl);
    window.location.href = authUrl;
  };

  const fetchAccountStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const tokens = localStorage.getItem('instagram_tokens');
      if (!tokens) {
        throw new Error('No Instagram tokens found');
      }

      const { access_token } = JSON.parse(tokens);
      const instagramAPI = new InstagramAPI();
      
      const stats = await instagramAPI.getAccountStats(access_token);
      setAccountStats(stats);
    } catch (error) {
      console.error('Error fetching Instagram account stats:', error);
      setError('Failed to fetch Instagram account statistics');
      setIsConnected(false);
      localStorage.removeItem('instagram_tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('instagram_tokens');
    setIsConnected(false);
    setAccountStats(null);
    setError(null);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 mr-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Instagram</h3>
        </div>
        
        {isConnected && (
          <span className="text-green-600 text-sm font-medium">Connected</span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!isConnected ? (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">
            Connect your Instagram Business account to track your stats and calculate sponsorship rates.
          </p>
          <button
            onClick={handleConnect}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Connect Instagram Account
          </button>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading account stats...</p>
            </div>
          ) : accountStats ? (
            <div>
              <div className="flex items-center mb-3">
                {accountStats.profilePictureUrl && (
                  <img
                    src={accountStats.profilePictureUrl}
                    alt={accountStats.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-lg">{accountStats.name}</h4>
                  <p className="text-gray-600 text-sm">@{accountStats.username}</p>
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    {accountStats.accountType}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(parseInt(accountStats.followersCount))}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(parseInt(accountStats.followsCount))}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(parseInt(accountStats.mediaCount))}
                  </div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={fetchAccountStats}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh Stats
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">Failed to load Instagram account data</p>
              <p className="text-sm text-gray-500 mb-4">
                Make sure you have a connected Instagram Business account.
              </p>
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={fetchAccountStats}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={handleDisconnect}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Reconnect Instagram
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 