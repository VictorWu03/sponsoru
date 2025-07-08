import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Instagram long-lived tokens can be refreshed to extend their lifetime
    const refreshUrl = 'https://graph.instagram.com/refresh_access_token';
    const params = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: accessToken,
    });

    const response = await fetch(`${refreshUrl}?${params}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Instagram token refresh error:', data);
      return NextResponse.json(
        { error: 'Token refresh failed', details: data },
        { status: response.status }
      );
    }

    console.log('Instagram token refreshed successfully');
    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type || 'bearer',
      expires_in: data.expires_in,
    });

  } catch (error) {
    console.error('Instagram token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 