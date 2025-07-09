import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    
    // Test with a dummy code to see TikTok's response format
    const testCode = 'test_code_12345';
    const redirectUri = 'https://sponsoru.vercel.app/auth/tiktok/callback';

    console.log('=== TikTok Token Exchange Test ===');
    
    const results = [];
    
    // Test multiple endpoints and formats
    const testCases = [
      {
        name: 'Login Kit v2 - Form Data',
        url: 'https://open.tiktokapis.com/v2/oauth/token/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: clientKey || '',
          client_secret: clientSecret || '',
          code: testCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        })
      },
      {
        name: 'Login Kit v2 - JSON',
        url: 'https://open.tiktokapis.com/v2/oauth/token/',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_key: clientKey || '',
          client_secret: clientSecret || '',
          code: testCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        })
      },
      {
        name: 'Alternative Endpoint - Form Data',
        url: 'https://open.tiktokapis.com/oauth/access_token/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: clientKey || '',
          client_secret: clientSecret || '',
          code: testCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        })
      },
      {
        name: 'Legacy Style - client_id',
        url: 'https://open.tiktokapis.com/v2/oauth/token/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientKey || '',
          client_secret: clientSecret || '',
          code: testCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        })
      }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`\n🧪 Testing: ${testCase.name}`);
        
        const startTime = Date.now();
        const response = await fetch(testCase.url, {
          method: 'POST',
          headers: testCase.headers,
          body: testCase.body,
        });
        
        const responseTime = Date.now() - startTime;
        const responseText = await response.text();
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { raw: responseText };
        }
        
        const result = {
          name: testCase.name,
          url: testCase.url,
          status: response.status,
          statusText: response.statusText,
          responseTime: `${responseTime}ms`,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseData,
          requestHeaders: testCase.headers,
          requestBody: typeof testCase.body === 'string' ? testCase.body : testCase.body.toString()
        };
        
        results.push(result);
        console.log(`Result:`, JSON.stringify(result, null, 2));
        
      } catch (error) {
        results.push({
          name: testCase.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          url: testCase.url
        });
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        clientKey: clientKey ? `${clientKey.substring(0, 8)}...` : 'NOT SET',
        clientSecret: clientSecret ? `${clientSecret.substring(0, 8)}...` : 'NOT SET',
        hasCredentials: !!(clientKey && clientSecret)
      },
      testResults: results,
      summary: {
        totalTests: testCases.length,
        completedTests: results.length,
        note: 'This test uses a dummy authorization code to check TikTok API response formats'
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 