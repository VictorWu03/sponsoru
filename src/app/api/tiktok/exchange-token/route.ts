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

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret) {
      console.error('❌ Missing TikTok credentials');
      return NextResponse.json(
        { error: 'Missing TikTok credentials' },
        { status: 500 }
      );
    }

    console.log('=== TikTok Token Exchange ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Code length:', code.length);
    console.log('Code preview:', code.substring(0, 20) + '...');
    console.log('Redirect URI:', redirectUri);

    // TikTok Login Kit v2 - Only form-data is accepted
    const requestBody = new URLSearchParams({
      client_key: clientKey,      // TikTok uses client_key, not client_id
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    console.log('🔄 Exchanging authorization code with TikTok...');
    const startTime = Date.now();
    
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
             body: requestBody.toString(),
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();
    
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log('📄 Response status:', response.status);
    console.log('📄 Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.access_token) {
      console.log('✅ Token exchange successful');
      return NextResponse.json({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        scope: data.scope,
        open_id: data.open_id,
        token_type: data.token_type || 'Bearer',
        debug: {
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          endpoint: 'TikTok Login Kit v2'
        }
      });
    }

    // Handle specific TikTok errors
    console.error('❌ Token exchange failed:', data);
    
    let errorMessage = 'Token exchange failed';
    let suggestions: string[] = [];
    
    if (data.error === 'invalid_grant') {
      if (data.error_description?.includes('expired')) {
        errorMessage = 'Authorization code has expired';
        suggestions = [
          'Authorization codes expire quickly (usually within 10 minutes)',
          'Try the authorization flow again immediately',
          'Ensure there are no delays between authorization and token exchange',
          'Check that the code is not being used multiple times'
        ];
      } else if (data.error_description?.includes('invalid')) {
        errorMessage = 'Invalid authorization code';
        suggestions = [
          'Verify the authorization code is correct',
          'Ensure the code came from the same client_key',
          'Check that the redirect_uri matches exactly'
        ];
      }
    } else if (data.error === 'invalid_client') {
      errorMessage = 'Invalid client credentials';
             suggestions = [
         'Verify TIKTOK_CLIENT_KEY is correct',
         'Verify TIKTOK_CLIENT_SECRET is correct',
         'Check that credentials are for the same TikTok app'
       ];
    } else if (data.error === 'invalid_request') {
      errorMessage = 'Request parameters are malformed';
      suggestions = [
        'Ensure all required parameters are provided',
        'Verify redirect_uri matches the one used in authorization',
        'Check parameter encoding'
      ];
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: data.error_description || 'Unknown error',
        suggestions,
        tiktokError: data.error,
        logId: data.log_id,
        debug: {
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          endpoint: 'TikTok Login Kit v2',
          httpStatus: response.status
        }
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('💥 Token exchange error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during token exchange',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 