'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

export default function TikTokCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing TikTok authorization...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        console.log('TikTok callback received:', { 
          code: code ? `${code.substring(0, 20)}...` : null, 
          error, 
          state 
        });

        if (error) {
          setStatus('error');
          setMessage(`TikTok authorization failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from TikTok');
          return;
        }

        setMessage('Exchanging authorization code for access token...');

        // Exchange the authorization code for tokens immediately
        const response = await fetch('/api/tiktok/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code,
            redirectUri: `${window.location.origin}/auth/tiktok/callback`
          }),
        });

        const data = await response.json();
        console.log('Token exchange response:', { 
          success: response.ok, 
          status: response.status,
          hasAccessToken: !!data.access_token,
          error: data.error 
        });

        if (!response.ok) {
          console.error('Token exchange failed:', data);
          setStatus('error');
          setMessage(`Failed to exchange authorization code: ${data.error || 'Unknown error'}`);
          return;
        }

        if (!data.access_token) {
          setStatus('error');
          setMessage('No access token received from TikTok');
          return;
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setStatus('error');
          setMessage('User not authenticated');
          return;
        }

        setMessage('Saving TikTok connection...');

        // Log the data we're about to save for debugging
        const socialAccountData = {
          user_id: user.id,
          platform: 'tiktok',
          platform_user_id: data.open_id || 'unknown',
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null,
          scope: data.scope,
          updated_at: new Date().toISOString(),
        };
        
        console.log('Saving social account data:', {
          user_id: user.id,
          platform: 'tiktok',
          platform_user_id: data.open_id || 'unknown',
          has_access_token: !!data.access_token,
          has_refresh_token: !!data.refresh_token,
          expires_at: socialAccountData.expires_at,
          scope: data.scope
        });

        // Store the tokens in the database
        const { error: dbError } = await supabase
          .from('social_accounts')
          .upsert(socialAccountData);

        if (dbError) {
          console.error('Database error:', dbError);
          setStatus('error');
          setMessage(`Failed to save TikTok connection: ${JSON.stringify(dbError)}`);
          return;
        }

        setStatus('success');
        setMessage('TikTok connected successfully!');
        
        setTimeout(() => {
          router.push('/profile');
        }, 2000);

      } catch (error) {
        console.error('TikTok callback error:', error);
        setStatus('error');
        setMessage(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Connecting TikTok</h2>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold mb-2 text-green-600">Success!</h2>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-red-600 text-5xl mb-4">✗</div>
              <h2 className="text-xl font-semibold mb-2 text-red-600">Connection Failed</h2>
            </>
          )}
          
          <p className="text-gray-600 mb-4">{message}</p>
          
          {status === 'success' && (
            <p className="text-sm text-gray-500">Redirecting to your profile...</p>
          )}
          
          {status === 'error' && (
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Return to Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 