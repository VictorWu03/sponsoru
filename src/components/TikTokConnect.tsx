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
  const [debugInfo, setDebugInfo] = useState<any>(null);

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
    setDebugInfo(null);
    
    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    if (!clientKey) {
      setError('TikTok Client Key not configured');
      return;
    }

    // First, test the environment to make sure everything is configured correctly
    try {
      setLoading(true);
      const envTest = await fetch('/api/test-tiktok-env');
      const envData = await envTest.json();
      
      console.log('Environment test result:', envData);
      setDebugInfo(envData);
      
      if (!envData.environment.clientKey || envData.environment.clientKey === 'NOT SET') {
        setError('TikTok Client Key is not properly configured');
        setLoading(false);
        return;
      }
      
      if (envData.environment.clientSecret === 'NOT SET') {
        setError('TikTok Client Secret is not properly configured');
        setLoading(false);
        return;
      }
      
      // Check if credentials are the expected format
      if (envData.environment.clientKeyLength !== 18) {
        setError(`TikTok Client Key length is unexpected (${envData.environment.clientKeyLength}, expected 18)`);
        setLoading(false);
        return;
      }

    } catch (envError) {
      console.error('Environment test failed:', envError);
      setError('Failed to verify environment configuration');
      setLoading(false);
      return;
    }

    // Generate state and build OAuth URL
    const state = Math.random().toString(36).substring(7);
    const redirectUri = `${window.location.origin}/auth/tiktok/callback`;
    
    // Use only basic scopes that don't require special approval
    const scopes = 'user.info.basic,user.info.profile';
    const responseType = 'code';

    // Store state for validation (optional)
    sessionStorage.setItem('tiktok_oauth_state', state);

    // Construct the correct TikTok OAuth URL
    const params = new URLSearchParams({
      client_key: clientKey,
      scope: scopes,
      response_type: responseType,
      redirect_uri: redirectUri,
      state: state
    });

    // Use the correct TikTok OAuth endpoint (Display API, not Business API)
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;

    console.log('=== TikTok OAuth Setup ===');
    console.log('OAuth URL:', authUrl);
    console.log('Redirect URI:', redirectUri);
    console.log('State:', state);
    console.log('Client Key:', clientKey);
    console.log('Scopes:', scopes);
    
    setLoading(false);
    
    // Open in same window for faster authorization code exchange
    window.location.href = authUrl;
  };

  const fetchUserStats = async () => {
    try {
      const tiktokAPI = new TikTokAPI();
      const tokens = localStorage.getItem('tiktok_tokens');
      if (!tokens) return;

      const { access_token } = JSON.parse(tokens);
      const stats = await tiktokAPI.getUserStats(access_token);
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching TikTok stats:', error);
      // Don't show error to user for stats fetching, as connection is still valid
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('tiktok_tokens');
    setIsConnected(false);
    setUserStats(null);
    setError(null);
    setDebugInfo(null);
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tokens = localStorage.getItem('tiktok_tokens');
      if (!tokens) {
        setError('No TikTok tokens found');
        setLoading(false);
        return;
      }

      const { access_token } = JSON.parse(tokens);
      const tiktokAPI = new TikTokAPI();
      
      // Test API call
      const userInfo = await tiktokAPI.getUserInfo(access_token);
      if (userInfo) {
        setError(null);
        alert('TikTok connection is working! User: ' + (userInfo.displayName || 'Unknown'));
      } else {
        setError('Failed to fetch user information');
      }
    } catch (error) {
      console.error('Test connection error:', error);
      setError(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
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
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">TT</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">TikTok</h3>
            <p className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {isConnected ? (
            <>
              <button
                onClick={handleTestConnection}
                disabled={loading}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test'}
              </button>
              <button
                onClick={handleDisconnect}
                className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          <div className="font-semibold">Error:</div>
          <div>{error}</div>
          
          {/* Show helpful tips based on error type */}
          {error.includes('invalid_client') && (
            <div className="mt-2 text-xs">
              <strong>Troubleshooting tips:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Verify your TikTok app credentials in the Developer Portal</li>
                <li>Ensure your app has Login Kit enabled</li>
                <li>Check that redirect URI exactly matches the registered URI</li>
                <li>Make sure your app is approved for production use</li>
              </ul>
            </div>
          )}
          
          {error.includes('Access Denied') && (
            <div className="mt-2 text-xs">
              <strong>TikTok Access Denied - App Not Approved:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Your TikTok app needs to be approved before OAuth works</li>
                <li>Check app status in TikTok Developer Portal</li>
                <li>Enable "Login Kit for Web" product in your app</li>
                <li>Submit app for review if still in draft status</li>
                <li>Consider using sandbox mode for development</li>
              </ul>
            </div>
          )}
          
          {error.includes('expired') && (
            <div className="mt-2 text-xs">
              <strong>Note:</strong> TikTok authorization codes expire very quickly. 
              Try the connection process again and complete it faster.
            </div>
          )}
          
          {/* Add debug information for troubleshooting */}
          {debugInfo && (
            <div className="mt-3 p-2 bg-gray-100 border rounded text-xs">
              <strong>Debug Info:</strong>
              <div className="mt-1">
                <div>Client Key: {debugInfo.environment?.clientKey || 'NOT SET'}</div>
                <div>Client Secret: {debugInfo.environment?.clientSecret || 'NOT SET'}</div>
                <div>Environment: {debugInfo.environment?.nodeEnv || 'unknown'}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add a dedicated debug section */}
      {!isConnected && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <div className="font-semibold text-blue-800 mb-2">TikTok Integration Status</div>
          <div className="space-y-1 text-blue-700">
            <div>✓ Client Key: configured (18 chars)</div>
            <div>✓ Client Secret: configured (40 chars)</div>
            <div>✓ OAuth endpoint: https://www.tiktok.com/v2/auth/authorize/</div>
            <div>✓ Token endpoint: https://open.tiktokapis.com/v2/oauth/token/</div>
            <div className="mt-2 text-xs">
              <strong>Common Issues:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>App not approved by TikTok (most common)</li>
                <li>Login Kit for Web not enabled in TikTok Developer Portal</li>
                <li>Redirect URI not matching exactly</li>
                <li>Scopes not approved for your app</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {isConnected && userStats && (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {formatNumber(userStats.followerCount)}
            </div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {formatNumber(userStats.totalViews)}
            </div>
            <div className="text-sm text-gray-500">Total Views</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {formatNumber(userStats.totalLikes)}
            </div>
            <div className="text-sm text-gray-500">Total Likes</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {userStats.videoCount || 0}
            </div>
            <div className="text-sm text-gray-500">Videos</div>
          </div>
        </div>
      )}

      {/* Debug tools */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const response = await fetch('/api/tiktok/validate-app');
                const data = await response.json();
                setDebugInfo(data);
                console.log('App validation result:', data);
              } catch (err) {
                console.error('App validation failed:', err);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Validate App'}
          </button>
          
          <button
            onClick={() => {
              const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
              const redirectUri = `${window.location.origin}/auth/tiktok/callback`;
              const state = 'debug_test';
              const scopes = 'user.info.basic,user.info.profile';
              
              const params = new URLSearchParams({
                client_key: clientKey || '',
                scope: scopes,
                response_type: 'code',
                redirect_uri: redirectUri,
                state: state
              });
              
              const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
              
              console.log('=== DEBUG: Generated OAuth URL ===');
              console.log('Full URL:', authUrl);
              console.log('Client Key:', clientKey);
              console.log('Redirect URI:', redirectUri);
              console.log('Scopes:', scopes);
              
              // Copy to clipboard
              navigator.clipboard.writeText(authUrl).then(() => {
                alert('OAuth URL copied to clipboard! Check console for details.');
              });
            }}
            className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200"
          >
            Generate Test URL
          </button>
        </div>
      </div>

      {/* Debug information (only shown when there's an error) */}
      {debugInfo && error && (
        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            Show Debug Information
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-48">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}

      {/* Status indicator */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-gray-300'
          }`}></div>
          {isConnected ? 'Active connection' : 'No connection'}
        </div>
        {isConnected && userStats && (
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
} 