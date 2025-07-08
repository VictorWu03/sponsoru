import { NextResponse } from 'next/server';

export async function GET() {
  try {
      const appId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET;

    if (!appId || !appSecret) {
      return NextResponse.json({
        status: 'error',
        message: 'Instagram API credentials not configured',
        details: {
          appId: appId ? 'Configured' : 'Missing',
          appSecret: appSecret ? 'Configured' : 'Missing',
        },
        instructions: 'Please check your .env.local file and ensure NEXT_PUBLIC_INSTAGRAM_APP_ID and NEXT_PUBLIC_INSTAGRAM_APP_SECRET are set.'
      });
    }

    // Test basic API connectivity using app access token
    const testUrl = `https://graph.facebook.com/v18.0/${appId}?fields=name&access_token=${appId}|${appSecret}`;
    console.log('Testing Instagram API with URL:', testUrl);
    
    const response = await fetch(testUrl);
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        status: 'success',
        message: 'Instagram API credentials are valid',
        appName: data.name || 'App name not available',
        appId: appId,
        nextSteps: [
          '1. Configure OAuth redirect URIs in your Meta app',
          '2. Add test users to your Instagram Basic Display product',
          '3. Test the authentication flow'
        ]
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid Instagram API credentials or app configuration',
        error: data.error,
        suggestions: [
          'Check if your App ID and App Secret are correct',
          'Ensure your Meta app has Instagram Basic Display product enabled',
          'Verify your app is not restricted'
        ]
      });
    }
  } catch (error) {
    console.error('Instagram API test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test Instagram API',
      error: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        'Check your internet connection',
        'Verify environment variables are loaded correctly',
        'Check server logs for more details'
      ]
    });
  }
} 