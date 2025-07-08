# TikTok Integration Troubleshooting Guide

This guide helps resolve common TikTok integration issues in the Sponsoru platform.

## Current Issue: `invalid_client` Error

The main issue is that TikTok API is returning `"invalid_client"` errors despite having correct credentials. This indicates a problem with the app configuration in TikTok Developer Portal.

### Issue Analysis

**Symptoms:**
- TikTok OAuth redirects work, but token exchange fails
- Error: `{"error": "invalid_client", "error_description": "Client key or secret is incorrect."}`
- Authorization codes expire quickly before exchange

**Root Causes:**
1. **App Not Approved**: TikTok app may not be approved for production use
2. **Login Kit Not Enabled**: App may not have Login Kit for Web properly configured
3. **Redirect URI Mismatch**: Exact mismatch between registered and actual redirect URI
4. **App Type Issues**: Using wrong API endpoints for app type

## Step-by-Step Resolution

### 1. Verify TikTok Developer App Configuration

**Go to TikTok Developer Portal:**
- Visit: https://developers.tiktok.com/apps
- Log in with your TikTok developer account
- Select your "Sponsoru" app

**Check App Status:**
- Ensure app status is "Live" or "Approved"
- If status is "In Review" or "Draft", the app cannot be used in production

**Verify Login Kit Configuration:**
1. Go to "Products" section in your app
2. Ensure "Login Kit for Web" is added and enabled
3. Check the redirect URI is exactly: `https://sponsoru.vercel.app/auth/tiktok/callback`
4. Verify scopes include: `user.info.basic` and `user.info.profile`

### 2. Validate Environment Variables

**Check Current Configuration:**
```bash
# Visit this endpoint to validate your setup
curl https://sponsoru.vercel.app/api/tiktok/validate-app
```

**Expected Values:**
- `NEXT_PUBLIC_TIKTOK_CLIENT_KEY`: 18 characters (e.g., `sbaw23uxynnnow2gu6`)
- `TIKTOK_CLIENT_SECRET`: 40 characters

### 3. Test Token Exchange

**Use Enhanced Debug Endpoint:**
1. Get a fresh authorization code by visiting TikTok OAuth URL
2. Test immediately: `https://sponsoru.vercel.app/api/tiktok-debug-live?code=YOUR_FRESH_CODE`
3. Review the detailed response for error patterns

### 4. Common Solutions

**Solution A: App Approval Issues**
- Submit your app for review in TikTok Developer Portal
- Provide detailed app description and use case
- Wait for approval before testing in production

**Solution B: Create New App**
If current app has persistent issues:
1. Create a new TikTok Developer App
2. Enable Login Kit for Web from the start
3. Use the exact redirect URI: `https://sponsoru.vercel.app/auth/tiktok/callback`
4. Copy new Client Key and Client Secret to environment variables

**Solution C: Sandbox vs Production**
- Ensure you're not using sandbox credentials in production
- Verify the app is configured for production use
- Check if there are separate staging and production apps

### 5. Alternative Approaches

**Approach 1: Use TikTok Business API**
- If Display API continues failing, try Business API endpoints
- Different authentication flow may work better

**Approach 2: Manual Token Testing**
- Use TikTok's official OAuth testing tools
- Verify credentials work outside of our application

## Debug Endpoints

The application includes several debug endpoints to help diagnose issues:

1. **Environment Test**: `/api/test-tiktok-env`
   - Validates environment variables
   - Tests API connectivity

2. **Live Code Test**: `/api/tiktok-debug-live?code=YOUR_CODE`
   - Tests fresh authorization codes
   - Provides detailed error analysis

3. **App Validation**: `/api/tiktok/validate-app`
   - Comprehensive app configuration check
   - Provides actionable recommendations

## Expected Behavior

**Successful Flow:**
1. User clicks "Connect TikTok"
2. Redirects to TikTok OAuth: `https://www.tiktok.com/v2/auth/authorize/`
3. User authorizes app
4. TikTok redirects to: `https://sponsoru.vercel.app/auth/tiktok/callback?code=...`
5. Code immediately exchanged for access token
6. User data fetched and displayed

**Current Failure Point:**
- Step 5 fails with `invalid_client` error
- This suggests TikTok doesn't recognize our app credentials

## Next Steps

1. **Immediate**: Check TikTok Developer Portal for app approval status
2. **If Not Approved**: Submit app for review with detailed description
3. **If Approved**: Verify Login Kit configuration and redirect URI
4. **If Still Failing**: Create new TikTok app with fresh credentials
5. **Alternative**: Consider using TikTok Business API instead

## Support Resources

- **TikTok Developer Portal**: https://developers.tiktok.com/apps
- **Login Kit Documentation**: https://developers.tiktok.com/doc/login-kit-web
- **Business API Documentation**: https://business-api.tiktok.com/portal/docs?id=1738855099573250

## Recent Changes Made

The following improvements have been implemented:

1. **Enhanced Token Exchange API** with multiple fallback approaches
2. **Improved Error Handling** with detailed debugging information
3. **Comprehensive Validation** endpoints for app configuration
4. **Better User Experience** with helpful error messages and troubleshooting tips

## Configuration Validation

**Current Credentials (from conversation summary):**
- Client Key: `sbaw23uxynnnow2gu6` (18 characters) ✅
- Client Secret: `e280c7584ec7987b031b42c1b3b2a9a36faf7dac` (40 characters) ✅
- Redirect URI: `https://sponsoru.vercel.app/auth/tiktok/callback` ✅
- API Endpoint: `https://open.tiktokapis.com/v2/oauth/token/` ✅

**Issue**: Despite correct configuration, TikTok returns `invalid_client`
**Likely Cause**: App approval or Login Kit configuration in TikTok Developer Portal 