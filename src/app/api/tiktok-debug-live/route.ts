import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    console.log('=== TikTok Live Debug Session ===');
    console.log('Timestamp:', new Date().toISOString());
    
    const analysis = {
      timestamp: new Date().toISOString(),
      environment: {
        clientKey: {
          present: !!clientKey,
          value: clientKey || 'NOT SET',
          length: clientKey ? clientKey.length : 0,
          expectedLength: 18,
          valid: clientKey ? clientKey.length === 18 : false,
          format: clientKey ? 'Alphanumeric' : 'N/A'
        },
        clientSecret: {
          present: !!clientSecret,
          length: clientSecret ? clientSecret.length : 0,
          expectedLength: 40,
          valid: clientSecret ? clientSecret.length === 40 : false,
          prefix: clientSecret ? clientSecret.substring(0, 8) + '...' : 'NOT SET'
        },
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        runtime: 'Node.js'
      },
      oauthConfiguration: {
        authEndpoint: 'https://www.tiktok.com/v2/auth/authorize/',
        tokenEndpoint: 'https://open.tiktokapis.com/v2/oauth/token/',
        redirectUriLocal: 'http://localhost:3000/auth/tiktok/callback',
        redirectUriProd: 'https://sponsoru.vercel.app/auth/tiktok/callback',
        scopes: [
          'user.info.basic',
          'user.info.profile'
        ],
        responseType: 'code',
        grantType: 'authorization_code'
      },
      testOAuthUrl: '',
      diagnostics: {
        issues: [] as string[],
        warnings: [] as string[],
        suggestions: [] as string[]
      }
    };

    // Generate test OAuth URL
    if (clientKey) {
      const testParams = new URLSearchParams({
        client_key: clientKey,
        scope: 'user.info.basic,user.info.profile',
        response_type: 'code',
        redirect_uri: 'http://localhost:3000/auth/tiktok/callback',
        state: 'debug_test_' + Date.now()
      });
      
      analysis.testOAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?${testParams.toString()}`;
    }

    // Run diagnostics
    if (!clientKey) {
      analysis.diagnostics.issues.push('NEXT_PUBLIC_TIKTOK_CLIENT_KEY is not set');
      analysis.diagnostics.suggestions.push('Set NEXT_PUBLIC_TIKTOK_CLIENT_KEY in your environment variables');
    } else if (clientKey.length !== 18) {
      analysis.diagnostics.issues.push(`Client key length is ${clientKey.length}, expected 18`);
      analysis.diagnostics.suggestions.push('Verify client key from TikTok Developer Portal');
    }

    if (!clientSecret) {
      analysis.diagnostics.issues.push('TIKTOK_CLIENT_SECRET is not set');
      analysis.diagnostics.suggestions.push('Set TIKTOK_CLIENT_SECRET in your environment variables');
    } else if (clientSecret.length !== 40) {
      analysis.diagnostics.issues.push(`Client secret length is ${clientSecret.length}, expected 40`);
      analysis.diagnostics.suggestions.push('Verify client secret from TikTok Developer Portal');
    }

    // Test TikTok API connectivity
    let apiTest = null;
    if (clientKey && clientSecret) {
      try {
        const testTokenRequest = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_key: clientKey,
            client_secret: clientSecret,
            code: 'test_dummy_code_for_connectivity_check',
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:3000/auth/tiktok/callback'
          })
        });

        const testResponse = await testTokenRequest.json();
        
        apiTest = {
          status: testTokenRequest.status,
          response: testResponse,
          connectivity: testTokenRequest.status === 200 || testTokenRequest.status === 400, // Both indicate API is reachable
          expectedError: 'Should return invalid_grant or authorization_code_expired for test code'
        };

        // Analyze response for common issues
        if (testResponse.error === 'invalid_client') {
          analysis.diagnostics.issues.push('TikTok API returned "invalid_client" - credentials may be incorrect');
          analysis.diagnostics.suggestions.push('Double-check client_key and client_secret in TikTok Developer Portal');
        } else if (testResponse.error === 'invalid_grant') {
          analysis.diagnostics.warnings.push('API connectivity test successful (expected "invalid_grant" for dummy code)');
        }

      } catch (apiError) {
        apiTest = {
          status: 'error',
          error: apiError instanceof Error ? apiError.message : 'Unknown error',
          connectivity: false
        };
        analysis.diagnostics.issues.push('Failed to connect to TikTok API');
      }
    }

    // App status assessment
    const appStatus = analysis.diagnostics.issues.length === 0 ? 'READY' : 'NEEDS_ATTENTION';
    
    // Common troubleshooting steps
    const troubleshootingSteps = [
      {
        step: 1,
        title: 'Verify TikTok Developer App Setup',
        actions: [
          'Log into TikTok Developer Portal (developers.tiktok.com)',
          'Check that your app has "Login Kit for Web" enabled',
          'Verify redirect URI is exactly: http://localhost:3000/auth/tiktok/callback',
          'Ensure app status is "Approved" (not "Under Review")'
        ]
      },
      {
        step: 2,
        title: 'Test OAuth URL Manually',
        actions: [
          'Copy the generated OAuth URL from this response',
          'Open it in a new browser tab',
          'Check what error message TikTok shows (if any)',
          'Look for: "client_key", "invalid_client", "app not approved", etc.'
        ]
      },
      {
        step: 3,
        title: 'Check App Approval Status',
        actions: [
          'Most TikTok apps require manual approval before OAuth works',
          'Check app status in TikTok Developer Portal',
          'If "Under Review", wait for approval (can take several days)',
          'Consider creating a sandbox app for development'
        ]
      }
    ];

    const response = {
      status: appStatus,
      analysis,
      apiTest,
      troubleshootingSteps,
      nextActions: analysis.diagnostics.issues.length === 0 ? [
        'Try the OAuth flow with a real user',
        'Check TikTok Developer Portal for app approval status',
        'Monitor browser console for additional errors'
      ] : analysis.diagnostics.suggestions,
      developerPortalUrl: 'https://developers.tiktok.com/apps',
      documentationUrl: 'https://developers.tiktok.com/doc/login-kit-web'
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('TikTok debug error:', error);
    return NextResponse.json(
      { 
        error: 'Debug analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 