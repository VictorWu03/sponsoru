'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { YouTubeAPI } from '../../../../lib/social-apis/youtube';

export default function YouTubeCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing YouTube connection...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('YouTube connection was cancelled or failed.');
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from YouTube.');
        return;
      }

      try {
        const youtubeAPI = new YouTubeAPI(process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '');
        const tokens = await youtubeAPI.exchangeCodeForTokens(
          code, 
          `${window.location.origin}/auth/youtube/callback`
        );

        if (tokens.access_token) {
          // Store tokens securely (you'll implement this with Supabase)
          localStorage.setItem('youtube_tokens', JSON.stringify(tokens));
          
          setStatus('success');
          setMessage('YouTube account connected successfully!');
          
          // Redirect to profile page after 2 seconds
          setTimeout(() => {
            router.push('/profile');
          }, 2000);
        } else {
          throw new Error('No access token received');
        }
      } catch (error) {
        console.error('YouTube OAuth error:', error);
        setStatus('error');
        setMessage('Failed to connect YouTube account. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          )}
          {status === 'success' && (
            <div className="text-6xl mb-4">✅</div>
          )}
          {status === 'error' && (
            <div className="text-6xl mb-4">❌</div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-4">
          {status === 'loading' && 'Connecting YouTube...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Connection Failed'}
        </h1>

        <p className="text-gray-600 mb-6">{message}</p>

        {status === 'error' && (
          <button
            onClick={() => router.push('/profile')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Profile
          </button>
        )}

        {status === 'success' && (
          <p className="text-sm text-gray-500">
            Redirecting to your profile...
          </p>
        )}
      </div>
    </div>
  );
} 