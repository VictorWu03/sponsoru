'use client';

import React, { useState, useEffect } from 'react';
import { YouTubeAPI } from '../lib/social-apis/youtube';

interface YouTubeChannelStats {
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  channelTitle: string;
  channelId: string;
}

export default function YouTubeConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [channelStats, setChannelStats] = useState<YouTubeChannelStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user already has YouTube tokens
    const tokens = localStorage.getItem('youtube_tokens');
    if (tokens) {
      setIsConnected(true);
      fetchChannelStats();
    }
  }, []);

  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
    if (!clientId) {
      setError('YouTube Client ID not configured');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/youtube/callback`;
    const scope = 'https://www.googleapis.com/auth/youtube.readonly';
    const responseType = 'code';
    const state = Math.random().toString(36).substring(7);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=${responseType}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;

    window.location.href = authUrl;
  };

  const fetchChannelStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const tokens = localStorage.getItem('youtube_tokens');
      console.log('Retrieved tokens from localStorage:', tokens);
      
      if (!tokens) {
        throw new Error('No YouTube tokens found');
      }

      const { access_token } = JSON.parse(tokens);
      console.log('Parsed access token:', access_token ? 'Token present' : 'No token');
      
      const youtubeAPI = new YouTubeAPI(process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '');
      
      const stats = await youtubeAPI.getChannelStats(access_token);
      console.log('Channel stats result:', stats);
      
      setChannelStats(stats);
    } catch (error) {
      console.error('Error fetching channel stats:', error);
      setError('Failed to fetch channel statistics');
      setIsConnected(false);
      localStorage.removeItem('youtube_tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('youtube_tokens');
    setIsConnected(false);
    setChannelStats(null);
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
          <svg className="w-8 h-8 text-red-600 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <h3 className="text-xl font-semibold">YouTube</h3>
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
            Connect your YouTube channel to track your stats and calculate sponsorship rates.
          </p>
          <button
            onClick={handleConnect}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Connect YouTube Channel
          </button>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading channel stats...</p>
            </div>
          ) : channelStats ? (
            <div>
              <h4 className="font-semibold text-lg mb-3">{channelStats.channelTitle}</h4>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatNumber(parseInt(channelStats.subscriberCount))}
                  </div>
                  <div className="text-sm text-gray-600">Subscribers</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatNumber(parseInt(channelStats.viewCount))}
                  </div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatNumber(parseInt(channelStats.videoCount))}
                  </div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={fetchChannelStats}
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
              <p className="text-gray-600 mb-4">Failed to load channel data</p>
              <p className="text-sm text-gray-500 mb-4">
                Your YouTube access may have expired. Try refreshing or reconnecting.
              </p>
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={fetchChannelStats}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={handleDisconnect}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Reconnect YouTube
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 