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

    console.log('=== TikTok Token Exchange - Enhanced Debug ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Code length:', code ? code.length : 0);
    console.log('Code first 20 chars:', code ? code.substring(0, 20) + '...' : 'NOT PROVIDED');
    console.log('Redirect URI:', redirectUri);
    console.log('Client Key:', clientKey ? `${clientKey} (length: ${clientKey.length})` : 'NOT SET');
    console.log('Client Secret:', clientSecret ? `${clientSecret.substring(0, 8)}... (length: ${clientSecret.length})` : 'NOT SET');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Vercel Environment:', process.env.VERCEL_ENV);

    if (!clientKey || !clientSecret) {
      return NextResponse.json(
        { error: 'TikTok client credentials not configured' },
        { status: 500 }
      );
    }

    // Validate credentials format
    if (clientKey.length !== 18) {
      console.error('⚠️  Client Key length is unexpected:', clientKey.length, 'expected: 18');
    }
    if (clientSecret.length !== 40) {
      console.error('⚠️  Client Secret length is unexpected:', clientSecret.length, 'expected: 40');
    }

    // Multiple approaches to try
    const approaches = [
      {
        name: 'Standard TikTok Display API',
        url: 'https://open.tiktokapis.com/v2/oauth/token/',
        contentType: 'application/x-www-form-urlencoded',
        buildBody: () => new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        })
      },
      {
        name: 'Alternative with JSON body',
        url: 'https://open.tiktokapis.com/v2/oauth/token/',
        contentType: 'application/json',
        buildBody: () => JSON.stringify({
          client_key: clientKey,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        })
      },
      {
        name: 'TikTok Business API fallback',
        url: 'https://business-api.tiktok.com/open_api/oauth2/access_token/',
        contentType: 'application/json',
        buildBody: () => JSON.stringify({
          app_id: clientKey,
          secret: clientSecret,
          auth_code: code,
          redirect_uri: redirectUri,
        })
      }
    ];

    let lastError = null;
    
    for (const approach of approaches) {
      try {
        console.log(`\n🔄 Trying approach: ${approach.name}`);
        console.log(`URL: ${approach.url}`);
        
        const body = approach.buildBody();
        console.log(`Request body: ${typeof body === 'string' ? body : body.toString()}`);

        const startTime = Date.now();
        
        const response = await fetch(approach.url, {
          method: 'POST',
          headers: {
            'Content-Type': approach.contentType,
            'Cache-Control': 'no-cache',
            'User-Agent': 'Sponsoru/1.0',
          },
          body: body,
        });

        const responseTime = Date.now() - startTime;
        console.log(`Response time: ${responseTime}ms`);
        console.log(`Response status: ${response.status} ${response.statusText}`);

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(`❌ Failed to parse response for ${approach.name}:`, responseText);
          lastError = { approach: approach.name, error: 'Invalid JSON response', responseText };
          continue;
        }

        console.log(`Response data:`, JSON.stringify(data, null, 2));

        if (response.ok) {
          // Success! Try to extract token based on response structure
          let tokenData = null;
          
          // Try different response structures
          if (data.access_token) {
            tokenData = data; // Direct structure
          } else if (data.data && data.data.access_token) {
            tokenData = data.data; // Nested in data.data
          } else if (data.result && data.result.access_token) {
            tokenData = data.result; // Nested in result
          }

          if (tokenData && tokenData.access_token) {
            console.log(`✅ Success with approach: ${approach.name}`);
            return NextResponse.json({
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token,
              expires_in: tokenData.expires_in,
              scope: tokenData.scope,
              open_id: tokenData.open_id || tokenData.openid,
              token_type: 'Bearer',
              debug: {
                approach: approach.name,
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
              }
            });
          } else {
            console.error(`❌ No access token found in successful response for ${approach.name}`);
            lastError = { approach: approach.name, error: 'No access token in response', data };
            continue;
          }
        } else {
          // API returned an error
          console.error(`❌ API error for ${approach.name}:`, data);
          lastError = { 
            approach: approach.name, 
            error: data.error || data.error_description || 'API error',
            status: response.status,
            data,
            responseTime: `${responseTime}ms`
          };
          
          // If this is an invalid_client error, log detailed debugging info
          if (data.error === 'invalid_client') {
            console.error('🔍 INVALID_CLIENT DEBUG INFO:');
            console.error('- Client Key used:', clientKey);
            console.error('- Client Secret prefix:', clientSecret.substring(0, 10) + '...');
            console.error('- Redirect URI used:', redirectUri);
            console.error('- Code used:', code.substring(0, 20) + '...');
            console.error('- Log ID from TikTok:', data.log_id);
          }
          
          continue;
        }
      } catch (fetchError) {
        console.error(`❌ Network error for ${approach.name}:`, fetchError);
        lastError = { 
          approach: approach.name, 
          error: fetchError instanceof Error ? fetchError.message : 'Network error' 
        };
        continue;
      }
    }

    // All approaches failed
    console.error('❌ All approaches failed. Last error:', lastError);
    
    return NextResponse.json(
      { 
        error: 'Token exchange failed with all approaches',
        lastError,
        debug: {
          totalApproaches: approaches.length,
          clientKeyLength: clientKey.length,
          clientSecretLength: clientSecret.length,
          codeLength: code.length,
          timestamp: new Date().toISOString(),
          suggestions: [
            'Verify TikTok app credentials in Developer Portal',
            'Check if app is approved for production use',
            'Ensure redirect URI exactly matches registered URI',
            'Verify app has Login Kit enabled',
            'Check if authorization code is still valid (codes expire quickly)'
          ]
        }
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Token exchange critical error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 