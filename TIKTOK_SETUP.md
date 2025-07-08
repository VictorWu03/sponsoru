# TikTok Developer App Setup Guide

The TikTok integration requires a properly configured TikTok Developer App. Here's how to set it up:

## 1. Create a TikTok Developer Account

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Sign up or log in with your TikTok account
3. Complete the developer registration process

## 2. Create a New App

1. In the TikTok Developer Portal, click "Manage Apps"
2. Click "Create an App"
3. Fill in the required information:
   - **App Name**: Sponsoru (or your preferred name)
   - **App Description**: Influencer sponsorship platform with social media analytics
   - **Category**: Business Tools or Social Media
   - **Website URL**: http://localhost:3000 (for development)

## 3. Enable and Configure Login Kit

**CRITICAL**: You must enable Login Kit for your app to work!

1. In your app dashboard, look for **"Products"** or **"Add Products"**
2. Find and click **"Login Kit for Web"** to add it to your app
3. Configure Login Kit settings:
   - **Redirect URI**: `http://localhost:3000/auth/tiktok/callback`
   - **Scopes**: Request the following scopes:
     - `user.info.basic`
     - `user.info.profile` 
     - `user.info.stats`
     - `video.list`
4. Save the configuration

## 4. Get Your Credentials

1. Copy your **Client Key** and **Client Secret**
2. Update your `.env.local` file:
   ```
   NEXT_PUBLIC_TIKTOK_CLIENT_KEY=your_client_key_here
   TIKTOK_CLIENT_SECRET=your_client_secret_here
   ```

## 5. App Approval (Important!)

**TikTok requires app approval for production use.** During development:

- Your app may only work with the developer account that created it
- Some features may be limited until approval
- The app needs to be submitted for review for public use

## Common Issues

1. **"Access Denied" Error**: 
   - App not approved for public use
   - User cancelled authorization
   - Missing required permissions

2. **"Invalid Client" Error**:
   - Wrong Client Key or Secret
   - App not properly configured
   - Redirect URI not registered

3. **Scope Errors**:
   - Requested scopes not approved
   - App doesn't have permission for analytics data

## Testing

You can test the connection with the TikTok account that created the developer app. For other users, the app needs to be approved by TikTok.

## Current Status

The app is configured with these credentials:
- Client Key: `awfrw7ueuqlbbngh`
- Client Secret: `fH0XBTLmEoVwoedlzVIZnQ1uZCeQkUIK`

If the connection is not working, the app may need to be submitted for TikTok's approval process. 