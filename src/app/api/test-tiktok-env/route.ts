import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    
    // Test with a dummy authorization code to see the exact error
    const testRedirectUri = 'https://sponsoru.vercel.app/auth/tiktok/callback';
    const testCode = 'test_dummy_code_for_debugging';
    
    console.log('=== TikTok Environment Test ===');
    console.log('Client Key:', clientKey);
    console.log('Client Secret Length:', clientSecret ? clientSecret.length : 'NOT SET');
    console.log('Client Secret First 10 chars:', clientSecret ? clientSecret.substring(0, 10) : 'NOT SET');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Vercel Environment:', process.env.VERCEL_ENV);
    
    // Test the exact same API call that's failing
    const requestBody = new URLSearchParams({
      client_key: clientKey || '',
      client_secret: clientSecret || '',
      code: testCode,
      grant_type: 'authorization_code',
      redirect_uri: testRedirectUri,
    });
    
    console.log('Request Body:', requestBody.toString());
    
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: requestBody,
    });
    
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw_response: responseText };
    }
    
    console.log('TikTok API Response Status:', response.status);
    console.log('TikTok API Response:', data);
    
    return NextResponse.json({
      environment: {
        clientKey: clientKey || 'NOT SET',
        clientKeyLength: clientKey ? clientKey.length : 0,
        clientSecret: clientSecret ? 'SET' : 'NOT SET',
        clientSecretLength: clientSecret ? clientSecret.length : 0,
        clientSecretPrefix: clientSecret ? clientSecret.substring(0, 10) + '...' : 'NOT SET',
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      },
      testApiCall: {
        url: 'https://open.tiktokapis.com/v2/oauth/token/',
        method: 'POST',
        requestBody: requestBody.toString(),
        responseStatus: response.status,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseData: data,
      },
      expectedValues: {
        clientKey: 'sbaw23uxynnnow2gu6',
        clientSecretExpectedLength: 40, // Typical length for TikTok client secrets
        redirectUri: testRedirectUri,
      }
    });
  } catch (error) {
    console.error('Environment test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 