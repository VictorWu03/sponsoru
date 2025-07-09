import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      // Check all possible TikTok environment variables
      TIKTOK_CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY ? 'SET' : 'NOT SET',
      TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_TIKTOK_CLIENT_KEY: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY ? 'SET' : 'NOT SET',
      
      // Show lengths for debugging (without exposing values)
      TIKTOK_CLIENT_KEY_LENGTH: process.env.TIKTOK_CLIENT_KEY?.length || 0,
      TIKTOK_CLIENT_SECRET_LENGTH: process.env.TIKTOK_CLIENT_SECRET?.length || 0,
      NEXT_PUBLIC_TIKTOK_CLIENT_KEY_LENGTH: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY?.length || 0,
      
      // Show prefixes for verification (first 8 chars only)
      TIKTOK_CLIENT_KEY_PREFIX: process.env.TIKTOK_CLIENT_KEY?.substring(0, 8) || 'N/A',
      TIKTOK_CLIENT_SECRET_PREFIX: process.env.TIKTOK_CLIENT_SECRET?.substring(0, 8) || 'N/A',
      NEXT_PUBLIC_TIKTOK_CLIENT_KEY_PREFIX: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY?.substring(0, 8) || 'N/A',
      
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    recommendations: {
      current_issue: "Token exchange is failing due to missing credentials",
      quick_fix: "Either set TIKTOK_CLIENT_KEY/TIKTOK_CLIENT_SECRET or revert to NEXT_PUBLIC_TIKTOK_CLIENT_KEY",
      options: [
        "Option 1: Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in Vercel dashboard",
        "Option 2: Revert code to use NEXT_PUBLIC_TIKTOK_CLIENT_KEY (less secure but works)"
      ]
    }
  });
} 