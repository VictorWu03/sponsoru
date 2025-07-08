import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri } = await request.json();

    if (!code || !redirectUri) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    console.log('TikTok Token Exchange Debug:');
    console.log('Client Key:', clientKey ? `${clientKey.substring(0, 5)}...` : 'NOT SET');
    console.log('Client Secret:', clientSecret ? 'SET' : 'NOT SET');
    console.log('Code:', code ? `${code.substring(0, 10)}...` : 'NOT SET');
    console.log('Redirect URI:', redirectUri);

    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        client_key: clientKey || '',
        client_secret: clientSecret || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();
    
    console.log('TikTok API Response:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('TikTok token exchange error:', data);
      let errorMessage = 'Token exchange failed';
      if (data.error === 'invalid_client') {
        errorMessage = 'Invalid TikTok app credentials. Check your Client Key and Secret.';
      } else if (data.error === 'invalid_grant') {
        errorMessage = 'Invalid authorization code. Please try connecting again.';
      } else if (data.error === 'redirect_uri_mismatch') {
        errorMessage = 'Redirect URI mismatch. Ensure the callback URL is registered in your TikTok app.';
      } else if (data.error_description) {
        errorMessage = data.error_description;
      }
      return NextResponse.json(
        { error: errorMessage, details: data },
        { status: response.status }
      );
    }

    // Handle different TikTok response structures
    let tokenData;
    if (data.data && data.data.access_token) {
      // Expected structure: { data: { access_token, ... } }
      tokenData = data.data;
    } else if (data.access_token) {
      // Direct structure: { access_token, ... }
      tokenData = data;
    } else {
      console.error('Unexpected TikTok response structure:', data);
      return NextResponse.json(
        { error: 'Unexpected response structure from TikTok', details: data },
        { status: 400 }
      );
    }

    if (!tokenData.access_token) {
      console.error('No access token in TikTok response:', data);
      return NextResponse.json(
        { error: 'No access token received from TikTok', details: data },
        { status: 400 }
      );
    }

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type || 'Bearer',
      scope: tokenData.scope,
      open_id: tokenData.open_id,
    });
  } catch (error) {
    console.error('TikTok token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 