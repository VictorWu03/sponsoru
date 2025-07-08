# Instagram/Meta Developer App Setup Guide

The Instagram integration requires a properly configured Meta/Facebook Developer App. Here's how to set it up:

## 1. Create a Meta Developer Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Sign up or log in with your Facebook account
3. Complete the developer registration process

## 2. Create a New App

1. In the Meta Developer Portal, click "Create App"
2. Choose "Consumer" as the app type
3. Fill in the required information:
   - **App Name**: Sponsoru (or your preferred name)
   - **App Contact Email**: Your email address
   - **Purpose**: Business or other appropriate category

## 3. Add Instagram Basic Display Product

**CRITICAL**: You must add the Instagram Basic Display product for basic Instagram integration!

1. In your app dashboard, click **"Add Product"**
2. Find and click **"Instagram Basic Display"** to add it to your app
3. Click **"Set up"** on the Instagram Basic Display card

## 4. Configure Instagram Basic Display

1. **Valid OAuth Redirect URIs**: Add these URLs:
   - `http://localhost:3000/auth/instagram/callback` (for development)
   - `https://yourdomain.com/auth/instagram/callback` (for production)

2. **Deauthorize Callback URL**: (Optional)
   - `http://localhost:3000/auth/instagram/deauthorize`

3. **Data Deletion Request URL**: (Optional)
   - `http://localhost:3000/auth/instagram/delete`

## 5. Add Instagram Business API (Optional - for Business Features)

If you need business features like insights and media publishing:

1. Add **"Instagram Graph API"** product
2. Configure the same redirect URIs
3. Request additional permissions during app review

## 6. Get Your Credentials

1. Go to **Instagram Basic Display** > **Basic Display**
2. Copy your **Instagram App ID** and **Instagram App Secret**
3. Update your `.env.local` file:
   ```
   NEXT_PUBLIC_INSTAGRAM_APP_ID=your_app_id_here
   NEXT_PUBLIC_INSTAGRAM_APP_SECRET=your_app_secret_here
   ```

## 7. Add Test Users (During Development)

**IMPORTANT**: Instagram Basic Display only works with test users until your app is approved!

1. Go to **Instagram Basic Display** > **Basic Display**
2. Scroll down to **User Token Generator**
3. Click **"Add or Remove Instagram Testers"**
4. Add Instagram accounts that will test your app
5. Test users must accept the invitation in their Instagram app

## 8. App Review Process (For Production)

For public use, you need to submit your app for review:

1. **App Review** > **Permissions and Features**
2. Request these permissions:
   - `instagram_graph_user_profile`
   - `instagram_graph_user_media`
3. Provide detailed use case descriptions
4. Submit for review (can take 7-14 days)

## Common Issues & Solutions

1. **"User not allowed" Error**:
   - User is not added as a test user
   - App is not approved for public use
   - Solution: Add user as tester or wait for app approval

2. **"Invalid Client" Error**:
   - Wrong App ID or Secret
   - Redirect URI not registered
   - Solution: Double-check credentials and URIs

3. **"Scope Errors"**:
   - Requesting permissions not approved
   - Solution: Only request basic permissions during development

4. **"Access Token Invalid"**:
   - Token expired (60 days for long-lived tokens)
   - Solution: Implement token refresh logic

## Permissions Required

### Basic (Always Available):
- `user_profile` - Basic profile information
- `user_media` - User's media

### Business (Requires App Review):
- `instagram_basic` - Basic Instagram permissions
- `instagram_manage_insights` - Access to insights
- `pages_read_engagement` - Page insights
- `business_management` - Business account management

## Current Status

After completing setup, update your `.env.local` with your credentials and test the connection at `/api/test-instagram`.

## Testing Your Setup

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000/api/test-instagram` to test credentials
3. Try connecting an Instagram account through your app's UI
4. Check browser console for any error messages

## Important Notes

- Instagram tokens are long-lived (60 days) but need to be refreshed
- Basic Display API has rate limits (200 requests per hour per user)
- Business API requires business Instagram accounts
- Personal accounts work with Basic Display API only 