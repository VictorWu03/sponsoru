'use client';

import React, { useState, useEffect } from 'react';
import { TikTokAPI } from '../lib/social-apis/tiktok';

interface ComponentUserStats {
  followerCount?: number;
  totalViews?: number;
  totalLikes?: number;
  videoCount?: number;
}

export default function TikTokConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [userStats, setUserStats] = useState<ComponentUserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user already has TikTok tokens
    const tokens = localStorage.getItem('tiktok_tokens');
    if (tokens) {
      setIsConnected(true);
      fetchUserStats();
    }
  }, []);

  const handleConnect = async () => {
    setError(null);
    
    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    if (!clientKey) {
      setError('TikTok Client Key not configured');
      return;
    }

    setLoading(true);

    // Generate state and build OAuth URL
    const state = Math.random().toString(36).substring(7);
    const redirectUri = `${window.location.origin}/auth/tiktok/callback`;
    const scopes = 'user.info.basic,user.info.profile';
    const responseType = 'code';

    // Store state for validation
    sessionStorage.setItem('tiktok_oauth_state', state);

    // Construct the TikTok OAuth URL
    const params = new URLSearchParams({
      client_key: clientKey,
      scope: scopes,
      response_type: responseType,
      redirect_uri: redirectUri,
      state: state
    });

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
    
    setLoading(false);
    window.location.href = authUrl;
  };

  const fetchUserStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const tiktokAPI = new TikTokAPI();
      const tokens = localStorage.getItem('tiktok_tokens');
      if (!tokens) {
        throw new Error('No TikTok tokens found');
      }

      const { access_token } = JSON.parse(tokens);
      const stats = await tiktokAPI.getUserStats(access_token);
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching TikTok stats:', error);
      setError('Failed to fetch TikTok statistics');
      setIsConnected(false);
      localStorage.removeItem('tiktok_tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('tiktok_tokens');
    setIsConnected(false);
    setUserStats(null);
    setError(null);
  };

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold">TikTok</h3>
        </div>
        
        {isConnected && (
          <span className="text-green-600 text-sm font-medium">Connected</span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          {error.includes('Access Denied') && (
            <div className="mt-2 text-sm">
              <strong>Note:</strong> Your TikTok app needs to be approved by TikTok before OAuth works. 
              Please check your app status in the TikTok Developer Portal.
            </div>
          )}
        </div>
      )}

      {!isConnected ? (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">
            Connect your TikTok account to track your stats and calculate sponsorship rates.
          </p>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect TikTok Account'}
          </button>
          
          {!loading && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <p className="font-medium">⚠️ TikTok Integration Status</p>
              <p className="mt-1">TikTok apps require approval before OAuth works. If you see an "Access Denied" error, 
              your app needs to be approved in the TikTok Developer Portal.</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading account stats...</p>
            </div>
          ) : userStats ? (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">
                    {formatNumber(userStats.followerCount)}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">
                    {formatNumber(userStats.totalViews)}
                  </div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">
                    {formatNumber(userStats.totalLikes)}
                  </div>
                  <div className="text-sm text-gray-600">Total Likes</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">
                    {userStats.videoCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={fetchUserStats}
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
              <p className="text-gray-600 mb-4">Failed to load account data</p>
              <p className="text-sm text-gray-500 mb-4">
                Your TikTok access may have expired. Try refreshing or reconnecting.
              </p>
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={fetchUserStats}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={handleDisconnect}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Reconnect TikTok
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 