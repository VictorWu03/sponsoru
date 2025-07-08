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

    const appId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET;

    if (!appId || !appSecret) {
      console.error('Instagram credentials not configured');
      return NextResponse.json(
        { error: 'Instagram API credentials not configured' },
        { status: 500 }
      );
    }

    console.log('Exchanging code for access token...');

    // Exchange code for short-lived token using Instagram Basic Display API
    const tokenExchangeUrl = 'https://api.instagram.com/oauth/access_token';
    const formData = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code,
    });

    const response = await fetch(tokenExchangeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const tokenData = await response.json();

    if (!response.ok) {
      console.error('Instagram token exchange error:', tokenData);
      return NextResponse.json(
        { error: 'Token exchange failed', details: tokenData },
        { status: response.status }
      );
    }

    console.log('Token exchange successful, attempting to get long-lived token...');

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedTokenUrl = 'https://graph.instagram.com/access_token';
    const longLivedParams = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: appSecret,
      access_token: tokenData.access_token,
    });

    const longLivedResponse = await fetch(`${longLivedTokenUrl}?${longLivedParams}`, {
      method: 'GET',
    });

    const longLivedData = await longLivedResponse.json();

    if (longLivedResponse.ok) {
      console.log('Long-lived token exchange successful');
      return NextResponse.json({
        access_token: longLivedData.access_token,
        token_type: longLivedData.token_type || 'bearer',
        expires_in: longLivedData.expires_in,
      });
    } else {
      console.warn('Long-lived token exchange failed, returning short-lived token:', longLivedData);
      // Return short-lived token if long-lived exchange fails
      return NextResponse.json({
        access_token: tokenData.access_token,
        token_type: tokenData.token_type || 'bearer',
        expires_in: tokenData.expires_in || 3600, // 1 hour for short-lived tokens
      });
    }
  } catch (error) {
    console.error('Instagram token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 