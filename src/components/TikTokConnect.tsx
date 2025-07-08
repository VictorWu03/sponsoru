'use client';

import React, { useState, useEffect } from 'react';
import { TikTokAPI } from '../lib/social-apis/tiktok';

interface TikTokUserStats {
  followerCount: string;
  followingCount: string;
  likesCount: string;
  videoCount: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  isVerified: boolean;
}

export default function TikTokConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [userStats, setUserStats] = useState<TikTokUserStats | null>(null);
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

  const handleConnect = () => {
    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    if (!clientKey) {
      setError('TikTok Client Key not configured');
      return;
    }

    const state = Math.random().toString(36).substring(7);
    const redirectUri = `${window.location.origin}/auth/tiktok/callback`;
    // Use basic scopes that don't require special approval
    const scopes = 'user.info.basic,user.info.profile';
    const responseType = 'code';

    // Construct the correct TikTok OAuth URL
    const params = new URLSearchParams({
      client_key: clientKey,
      scope: scopes,
      response_type: responseType,
      redirect_uri: redirectUri,
      state: state
    });

    // Use the correct TikTok OAuth endpoint (not business API)
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;

    console.log('TikTok OAuth URL:', authUrl);
    console.log('Redirect URI:', redirectUri);
    console.log('State:', state);
    console.log('Client Key:', clientKey);
    
    window.location.href = authUrl;
  };

  const fetchUserStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const tokens = localStorage.getItem('tiktok_tokens');
      if (!tokens) {
        throw new Error('No TikTok tokens found');
      }

      const { access_token } = JSON.parse(tokens);
      const tiktokAPI = new TikTokAPI();
      
      const stats = await tiktokAPI.getUserInfo(access_token);
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching TikTok user stats:', error);
      setError('Failed to fetch TikTok user statistics');
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
          <div className="w-8 h-8 mr-3 bg-black rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
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
        </div>
      )}

      {!isConnected ? (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">
            Connect your TikTok account to track your stats and calculate sponsorship rates.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> TikTok integration requires a verified TikTok Developer App. 
              If the connection fails, the app may need approval from TikTok.
            </p>
          </div>
          <button
            onClick={handleConnect}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Connect TikTok Account
          </button>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading user stats...</p>
            </div>
          ) : userStats ? (
            <div>
              <div className="flex items-center mb-3">
                {userStats.avatarUrl && (
                  <img
                    src={userStats.avatarUrl}
                    alt={userStats.displayName}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                )}
                <div>
                  <div className="flex items-center">
                    <h4 className="font-semibold text-lg">{userStats.displayName}</h4>
                    {userStats.isVerified && (
                      <svg className="w-5 h-5 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">@{userStats.username}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">
                    {formatNumber(parseInt(userStats.followerCount))}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">
                    {formatNumber(parseInt(userStats.videoCount))}
                  </div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">
                    {formatNumber(parseInt(userStats.followingCount))}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">
                    {formatNumber(parseInt(userStats.likesCount))}
                  </div>
                  <div className="text-sm text-gray-600">Total Likes</div>
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
              <p className="text-gray-600 mb-4">Failed to load TikTok user data</p>
              <p className="text-sm text-gray-500 mb-4">
                Make sure your TikTok account has the necessary permissions.
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