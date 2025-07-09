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

    console.log('=== TikTok Token Exchange - Display API ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Code length:', code ? code.length : 0);
    console.log('Code first 20 chars:', code ? code.substring(0, 20) + '...' : 'NOT PROVIDED');
    console.log('Redirect URI:', redirectUri);
    console.log('Client Key:', clientKey ? `${clientKey} (length: ${clientKey.length})` : 'NOT SET');
    console.log('Client Secret:', clientSecret ? `${clientSecret.substring(0, 8)}... (length: ${clientSecret.length})` : 'NOT SET');

    if (!clientKey || !clientSecret) {
      return NextResponse.json(
        { error: 'TikTok client credentials not configured' },
        { status: 500 }
      );
    }

    // TikTok Display API OAuth token exchange
    // According to TikTok Display API documentation
    const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
    
    const requestBody = new URLSearchParams({
      client_key: clientKey,  // TikTok Display API uses client_key
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    console.log('🔄 Making request to TikTok Display API token endpoint');
    console.log('URL:', tokenUrl);
    console.log('Request body:', requestBody.toString());

    const startTime = Date.now();
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: requestBody,
    });

    const responseTime = Date.now() - startTime;
    console.log(`Response time: ${responseTime}ms`);
    console.log(`Response status: ${response.status} ${response.statusText}`);

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response:', responseText);
      return NextResponse.json(
        { 
          error: 'Invalid response from TikTok API',
          details: responseText,
          responseTime: `${responseTime}ms`
        },
        { status: 500 }
      );
    }

    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Token exchange successful');
      
      // TikTok API often returns data in nested structure
      const tokenData = data.data || data;
      
      if (tokenData.access_token) {
        return NextResponse.json({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: tokenData.expires_in,
          scope: tokenData.scope,
          open_id: tokenData.open_id,
          token_type: tokenData.token_type || 'Bearer',
          debug: {
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
            endpoint: 'TikTok Display API v2'
          }
        });
      } else {
        console.error('❌ No access token found in successful response');
        return NextResponse.json(
          { 
            error: 'No access token in response',
            data: data,
            debug: {
              responseTime: `${responseTime}ms`,
              timestamp: new Date().toISOString()
            }
          },
          { status: 500 }
        );
      }
    } else {
      // Handle TikTok API errors
      console.error('❌ TikTok API error:', data);
      
      let errorMessage = 'Token exchange failed';
      if (data.error_description) {
        errorMessage = data.error_description;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.message) {
        errorMessage = data.message;
      }

             // Provide specific guidance for common errors
       let suggestions: string[] = [];
       if (data.error === 'invalid_client') {
        suggestions = [
          'Verify TikTok app credentials in Developer Portal',
          'Ensure app has Login Kit enabled',
          'Check that app is approved for production use',
          'Verify redirect URI exactly matches registered URI'
        ];
      } else if (data.error === 'invalid_grant') {
        suggestions = [
          'Authorization code may have expired (codes expire in 10 minutes)',
          'Code may have already been used',
          'Ensure redirect URI matches the one used for authorization'
        ];
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          tiktok_error: data.error,
          log_id: data.log_id,
          suggestions,
          debug: {
            status: response.status,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
            endpoint: 'TikTok Display API v2'
          }
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Token exchange critical error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 