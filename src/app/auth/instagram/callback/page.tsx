'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function InstagramCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const state = searchParams.get('state');

        // Validate state parameter
        const storedState = localStorage.getItem('instagram_oauth_state');
        if (state && storedState && state !== storedState) {
          setStatus('error');
          setMessage('Invalid state parameter. Please try again.');
          return;
        }

        // Clean up stored state
        localStorage.removeItem('instagram_oauth_state');

        if (error) {
          console.error('Instagram OAuth error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || error);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }

        console.log('Processing Instagram authorization code...');

        // Exchange code for access token
        const response = await fetch('/api/instagram/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirectUri: `${window.location.origin}/auth/instagram/callback`,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Token exchange failed:', data);
          throw new Error(data.error || 'Token exchange failed');
        }

        console.log('Instagram connection successful!');

        // Store tokens in localStorage
        localStorage.setItem('instagram_tokens', JSON.stringify({
          access_token: data.access_token,
          token_type: data.token_type || 'Bearer',
          expires_in: data.expires_in,
          created_at: Date.now(),
        }));

        setStatus('success');
        setMessage('Instagram account connected successfully!');

        // Redirect to profile page after 2 seconds
        setTimeout(() => {
          window.location.href = '/profile';
        }, 2000);

      } catch (error) {
        console.error('Instagram callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Connection failed');
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          {status === 'loading' && (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Connecting Instagram...</h2>
              <p className="text-gray-600">Please wait while we set up your account</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">Success!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to your profile...</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">Connection Failed</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => window.location.href = '/profile'}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Return to Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 