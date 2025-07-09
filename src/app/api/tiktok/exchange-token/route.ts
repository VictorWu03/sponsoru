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

    console.log('=== TikTok Token Exchange - Login Kit v2 ===');
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

    // Try multiple token exchange approaches based on TikTok documentation
    const approaches = [
      {
        name: 'TikTok Login Kit - Form Data',
        url: 'https://open.tiktokapis.com/v2/oauth/token/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        })
      },
      {
        name: 'TikTok Login Kit - JSON',
        url: 'https://open.tiktokapis.com/v2/oauth/token/',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          client_key: clientKey,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        })
      }
    ];

    for (const approach of approaches) {
      try {
        console.log(`\n🔄 Trying: ${approach.name}`);
        console.log('URL:', approach.url);
        console.log('Headers:', approach.headers);
        console.log('Body:', typeof approach.body === 'string' ? approach.body : approach.body.toString());

        const startTime = Date.now();
        
        const response = await fetch(approach.url, {
          method: 'POST',
          headers: approach.headers,
          body: approach.body,
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
          continue;
        }

        console.log(`Response data:`, JSON.stringify(data, null, 2));

        if (response.ok) {
          console.log(`✅ Success with approach: ${approach.name}`);
          
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
                approach: approach.name,
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString(),
                endpoint: 'TikTok Login Kit v2'
              }
            });
          } else {
            console.error(`❌ No access token found in successful response for ${approach.name}`);
            continue;
          }
        } else {
          // Handle TikTok API errors
          console.error(`❌ API error for ${approach.name}:`, data);
          
          // Continue to next approach if this one fails
          continue;
        }
      } catch (fetchError) {
        console.error(`❌ Network error for ${approach.name}:`, fetchError);
        continue;
      }
    }

    // All approaches failed
    console.error('❌ All token exchange approaches failed');
    
    return NextResponse.json(
      { 
        error: 'Token exchange failed with all approaches',
        debug: {
          totalApproaches: approaches.length,
          clientKeyLength: clientKey.length,
          clientSecretLength: clientSecret.length,
          codeLength: code.length,
          timestamp: new Date().toISOString(),
          suggestions: [
            'Verify TikTok app has Login Kit enabled',
            'Check that app is approved for production use',
            'Ensure redirect URI exactly matches registered URI',
            'Verify authorization code is not expired (10 minute limit)',
            'Check TikTok Developer Portal for app approval status'
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
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 