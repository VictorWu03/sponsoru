import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
  
  return NextResponse.json({
    appInfo: {
      clientKey: clientKey || 'NOT SET',
      developerPortalUrl: 'https://developers.tiktok.com/apps',
      appManagementUrl: `https://developers.tiktok.com/apps`
    },
    accessDeniedSolution: {
      issue: 'TikTok OAuth returned "Access Denied"',
      mostLikelyCause: 'App not approved for OAuth authentication',
      immediateActions: [
        '1. Visit TikTok Developer Portal: https://developers.tiktok.com/apps',
        `2. Find your app with Client Key: ${clientKey}`,
        '3. Check app status (Draft/Under Review/Approved)',
        '4. Ensure "Login Kit for Web" is enabled as a product',
        '5. Verify redirect URI: http://localhost:3000/auth/tiktok/callback'
      ]
    },
    appStatusChecklist: {
      required: [
        'App must be in "Approved" status',
        'Login Kit for Web product must be enabled',
        'Redirect URI must exactly match: http://localhost:3000/auth/tiktok/callback',
        'Scopes user.info.basic and user.info.profile must be approved'
      ],
      optional: [
        'Consider sandbox mode for development',
        'Add test users to sandbox if available',
        'Use production URL for final deployment'
      ]
    },
    nextSteps: {
      ifDraftStatus: [
        'Submit app for review immediately',
        'Provide clear app description and use case',
        'Wait 3-7 business days for approval'
      ],
      ifUnderReview: [
        'Wait for TikTok approval (usually 3-7 days)',
        'Check email for any requests from TikTok',
        'Ensure all app information is complete'
      ],
      ifApproved: [
        'Check that Login Kit for Web is enabled',
        'Verify redirect URI configuration',
        'Test OAuth flow again'
      ]
    },
    alternativesForDevelopment: [
      'Use sandbox/development mode if available',
      'Test with approved TikTok developer account only',
      'Consider using TikTok Display API for read-only access',
      'Mock TikTok integration for UI development'
    ]
  });
} 