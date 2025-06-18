'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase automatically handles the OAuth callback
        // We just need to listen for auth state changes
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session && session.user) {
          setStatus('success');
          setMessage(`Welcome, ${session.user.user_metadata?.full_name || session.user.email}!`);
          
          // Redirect to profile page after 2 seconds
          setTimeout(() => {
            router.push('/profile');
          }, 2000);
        } else {
          // If no session yet, wait for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              setStatus('success');
              setMessage(`Welcome, ${session.user.user_metadata?.full_name || session.user.email}!`);
              
              // Redirect to profile page after 2 seconds
              setTimeout(() => {
                router.push('/profile');
              }, 2000);
              
              subscription.unsubscribe();
            } else if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
              setStatus('error');
              setMessage('Authentication failed');
              subscription.unsubscribe();
            }
          });

          // Clean up subscription after 10 seconds if nothing happens
          setTimeout(() => {
            subscription.unsubscribe();
            if (status === 'loading') {
              setStatus('error');
              setMessage('Authentication timeout - please try again');
            }
          }, 10000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    handleAuthCallback();
  }, [router, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          )}
          {status === 'success' && (
            <div className="text-6xl mb-4">✅</div>
          )}
          {status === 'error' && (
            <div className="text-6xl mb-4">❌</div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-4">
          {status === 'loading' && 'Signing you in...'}
          {status === 'success' && 'Welcome!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>

        <p className="text-gray-600 mb-6">{message}</p>

        {status === 'error' && (
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Home
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