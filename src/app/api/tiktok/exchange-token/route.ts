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

    console.log('TikTok Token Exchange - Start');
    console.log('Code length:', code ? code.length : 0);
    console.log('Client Key:', clientKey ? `${clientKey.substring(0, 5)}...` : 'NOT SET');
    console.log('Client Secret:', clientSecret ? 'SET' : 'NOT SET');

    if (!clientKey || !clientSecret) {
      return NextResponse.json(
        { error: 'TikTok client credentials not configured' },
        { status: 500 }
      );
    }

    const requestBody = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    console.log('Making TikTok API request...');
    const startTime = Date.now();
    
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: requestBody,
    });

    const responseTime = Date.now() - startTime;
    console.log(`TikTok API response time: ${responseTime}ms`);
    console.log('TikTok API status:', response.status);

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse TikTok response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from TikTok API' },
        { status: 500 }
      );
    }

    console.log('TikTok API response:', data);

    if (!response.ok) {
      console.error('TikTok API error:', data);
      return NextResponse.json(
        { 
          error: data.error || 'Token exchange failed',
          details: data,
          debug: {
            requestBody: requestBody.toString(),
            responseStatus: response.status,
            responseTime: `${responseTime}ms`
          }
        },
        { status: 400 }
      );
    }

    // TikTok API returns tokens nested in data.data (based on official documentation)
    const tokenData = data.data;
    if (!tokenData || !tokenData.access_token) {
      console.error('No access token in TikTok response:', data);
      return NextResponse.json(
        { 
          error: 'No access token received from TikTok',
          responseStructure: data,
          debug: 'Expected data.data.access_token but not found'
        },
        { status: 400 }
      );
    }

    console.log('TikTok token exchange successful');
    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
      open_id: tokenData.open_id,
      token_type: 'Bearer'
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 