import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({
        error: 'Please provide a code parameter',
        example: '/api/tiktok-debug-live?code=YOUR_FRESH_CODE'
      });
    }

    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const redirectUri = 'https://sponsoru.vercel.app/auth/tiktok/callback';

    console.log('=== Live TikTok Debug ===');
    console.log('Code provided:', code.substring(0, 20) + '...');
    console.log('Client Key:', clientKey);
    console.log('Client Secret:', clientSecret ? 'SET' : 'NOT SET');

    const requestBody = new URLSearchParams({
      client_key: clientKey || '',
      client_secret: clientSecret || '',
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
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw_response: responseText };
    }

    console.log('TikTok API Response:', data);
    console.log('Response time:', responseTime + 'ms');

    return NextResponse.json({
      test_info: {
        code_length: code.length,
        response_time_ms: responseTime,
        timestamp: new Date().toISOString()
      },
      request: {
        url: 'https://open.tiktokapis.com/v2/oauth/token/',
        method: 'POST',
        body: requestBody.toString()
      },
      response: {
        status: response.status,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 