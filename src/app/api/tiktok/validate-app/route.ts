import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    console.log('=== TikTok App Validation ===');
    
    const validation = {
      environment: {
        clientKey: {
          present: !!clientKey,
          value: clientKey || 'NOT SET',
          length: clientKey ? clientKey.length : 0,
          expectedLength: 18,
          valid: clientKey ? clientKey.length === 18 : false
        },
        clientSecret: {
          present: !!clientSecret,
          length: clientSecret ? clientSecret.length : 0,
          expectedLength: 40,
          valid: clientSecret ? clientSecret.length === 40 : false,
          prefix: clientSecret ? clientSecret.substring(0, 8) + '...' : 'NOT SET'
        },
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      },
      configuration: {
        redirectUri: 'https://sponsoru.vercel.app/auth/tiktok/callback',
        scopes: 'user.info.basic,user.info.profile',
        authEndpoint: 'https://www.tiktok.com/v2/auth/authorize/',
        tokenEndpoint: 'https://open.tiktokapis.com/v2/oauth/token/',
        apiBaseUrl: 'https://open.tiktokapis.com'
      },
      requirements: {
        appSetup: [
          'TikTok Developer Account created',
          'App created in TikTok Developer Portal',
          'Login Kit for Web enabled',
          'App submitted for review (for production)',
          'Redirect URI configured exactly as: https://sponsoru.vercel.app/auth/tiktok/callback'
        ],
        permissions: [
          'user.info.basic - Basic user information',
          'user.info.profile - Profile information',
          'user.info.stats - User statistics (optional)',
          'video.list - Video list (optional)'
        ]
      }
    };

    // Test API connectivity
    let apiConnectivity = null;
    try {
      const testResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: clientKey || 'test',
          client_secret: clientSecret || 'test',
          code: 'test_invalid_code',
          grant_type: 'authorization_code',
          redirect_uri: validation.configuration.redirectUri,
        }),
      });

      const testData = await testResponse.text();
      let parsedData;
      try {
        parsedData = JSON.parse(testData);
      } catch {
        parsedData = { raw: testData };
      }

      apiConnectivity = {
        reachable: true,
        status: testResponse.status,
        response: parsedData,
        expectedError: 'Should return invalid_grant or authorization_code_expired for test code'
      };
    } catch (error) {
      apiConnectivity = {
        reachable: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Generate validation report
    const issues = [];
    const suggestions = [];

    if (!validation.environment.clientKey.present) {
      issues.push('NEXT_PUBLIC_TIKTOK_CLIENT_KEY is not set');
      suggestions.push('Set NEXT_PUBLIC_TIKTOK_CLIENT_KEY in your environment variables');
    } else if (!validation.environment.clientKey.valid) {
      issues.push(`Client Key length is ${validation.environment.clientKey.length}, expected 18`);
      suggestions.push('Verify your Client Key from TikTok Developer Portal');
    }

    if (!validation.environment.clientSecret.present) {
      issues.push('TIKTOK_CLIENT_SECRET is not set');
      suggestions.push('Set TIKTOK_CLIENT_SECRET in your environment variables');
    } else if (!validation.environment.clientSecret.valid) {
      issues.push(`Client Secret length is ${validation.environment.clientSecret.length}, expected 40`);
      suggestions.push('Verify your Client Secret from TikTok Developer Portal');
    }

    if (apiConnectivity && !apiConnectivity.reachable) {
      issues.push('Cannot reach TikTok API');
      suggestions.push('Check internet connectivity and TikTok API status');
    }

    const overallStatus = issues.length === 0 ? 'READY' : 'ISSUES_FOUND';

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      validation,
      apiConnectivity,
      issues,
      suggestions,
      nextSteps: overallStatus === 'READY' ? [
        'Your TikTok app configuration appears correct',
        'Try connecting your TikTok account',
        'If connection fails with invalid_client, check TikTok Developer Portal for app approval status'
      ] : [
        'Fix the identified configuration issues',
        'Verify your TikTok app settings in the Developer Portal',
        'Ensure your app has Login Kit enabled',
        'Make sure redirect URI matches exactly'
      ],
      developerPortalUrl: 'https://developers.tiktok.com/apps',
      documentationUrl: 'https://developers.tiktok.com/doc/login-kit-web'
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 