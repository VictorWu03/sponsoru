# Instagram/Meta Authentication Troubleshooting Guide

This guide helps you diagnose and fix common issues with Instagram authentication in your Sponsoru application.

## Quick Diagnosis

1. **Test your configuration first:**
   ```bash
   npm run dev
   curl http://localhost:3000/api/test-instagram
   ```

2. **Check browser console for errors when clicking "Connect Instagram"**

3. **Verify environment variables are loaded:**
   - `NEXT_PUBLIC_INSTAGRAM_APP_ID` should be your Meta app ID
   - `INSTAGRAM_APP_SECRET` should be your Meta app secret (keep private!)

## Common Issues & Solutions

### 1. "Instagram App ID not configured" Error

**Symptoms:**
- Error message when clicking connect button
- `/api/test-instagram` shows missing credentials

**Solutions:**
1. Check your `.env.local` file exists in the project root
2. Verify the environment variables are set:
   ```
   NEXT_PUBLIC_INSTAGRAM_APP_ID=your_actual_app_id
   INSTAGRAM_APP_SECRET=your_actual_app_secret
   ```
3. Restart your development server after changing .env.local
4. Ensure no spaces around the `=` sign in environment variables

### 2. "Invalid Client" or OAuth Errors

**Symptoms:**
- Redirected to Instagram but get error page
- "Invalid redirect_uri" error
- "Application does not exist" error

**Solutions:**
1. **Check Redirect URI Configuration:**
   - In Meta Developer Console, go to Instagram Basic Display
   - Add: `http://localhost:3000/auth/instagram/callback`
   - For production: `https://yourdomain.com/auth/instagram/callback`

2. **Verify App ID/Secret:**
   - Double-check you copied the correct values from Meta console
   - App ID should be numbers only
   - App Secret should be a long alphanumeric string

3. **Check App Status:**
   - Ensure Instagram Basic Display product is added
   - App should be in "Development" mode for testing

### 3. "User not allowed" Error

**Symptoms:**
- OAuth flow completes but user gets access denied
- "This app is not approved" message

**Solutions:**
1. **Add Test Users:**
   - Go to Instagram Basic Display > Basic Display
   - Scroll to "User Token Generator"
   - Click "Add or Remove Instagram Testers"
   - Add the Instagram accounts you want to test with
   - Test users must accept the invitation in their Instagram app

2. **For Production:**
   - Submit app for Meta review
   - Provide detailed use case documentation
   - Wait for approval (7-14 days)

### 4. Token Exchange Failures

**Symptoms:**
- Successful OAuth but "Token exchange failed" error
- 400/500 errors in `/api/instagram/exchange-token`

**Solutions:**
1. **Check Server Logs:**
   ```bash
   # Look for detailed error messages in console
   npm run dev
   # Then try connecting Instagram again
   ```

2. **Verify API Endpoints:**
   - Ensure using Instagram Basic Display API endpoints
   - Check network tab for failed requests

3. **Environment Variable Issues:**
   - App Secret should not have `NEXT_PUBLIC_` prefix
   - Restart server after changing environment variables

### 5. "Scope" or Permission Errors

**Symptoms:**
- "Insufficient permissions" errors
- Limited data returned from API

**Solutions:**
1. **Use Basic Scopes Only (for development):**
   - `user_profile` - Basic profile information
   - `user_media` - User's media

2. **For Business Features (requires approval):**
   - Submit for additional permissions
   - Document specific use cases
   - Wait for Meta approval

### 6. Network/CORS Issues

**Symptoms:**
- Request blocked by browser
- Network errors in console

**Solutions:**
1. **Development Environment:**
   - Ensure using `http://localhost:3000` (not 127.0.0.1)
   - Check your next.config.ts for CORS settings

2. **Production Environment:**
   - Use HTTPS only
   - Update redirect URIs to production URLs
   - Check DNS configuration

## Testing Your Fix

After making changes:

1. **Clear browser data** (localStorage, cookies)
2. **Restart development server**
3. **Test the flow:**
   ```bash
   # 1. Test API configuration
   curl http://localhost:3000/api/test-instagram
   
   # 2. Try Instagram connection in browser
   # 3. Check browser console for any errors
   # 4. Verify token storage in localStorage
   ```

## Advanced Debugging

### Enable Verbose Logging

Add to your `.env.local`:
```
DEBUG=instagram:*
NODE_ENV=development
```

### Check Token Validity

```javascript
// In browser console after connecting
const tokens = JSON.parse(localStorage.getItem('instagram_tokens'));
console.log('Token:', tokens);

// Test token with Instagram API
fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${tokens.access_token}`)
  .then(r => r.json())
  .then(console.log);
```

### Common API Response Codes

- **200**: Success
- **400**: Bad request (check parameters)
- **401**: Invalid/expired token
- **403**: Insufficient permissions
- **429**: Rate limit exceeded
- **500**: Server error (check logs)

## Meta App Checklist

Before testing, ensure your Meta app has:

- ✅ Instagram Basic Display product added
- ✅ Valid redirect URIs configured
- ✅ Test users added (for development)
- ✅ Correct app ID and secret in environment
- ✅ App is not restricted or suspended

## Getting Help

If you're still having issues:

1. **Check Meta Developer Documentation:**
   - [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
   - [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)

2. **Debug Information to Collect:**
   - Response from `/api/test-instagram`
   - Browser console errors
   - Network tab requests/responses
   - Meta app configuration screenshots

3. **Contact Support:**
   - Include specific error messages
   - Provide steps to reproduce
   - Share debug information (without secrets!)

## Security Notes

- Never commit `.env.local` to version control
- App secrets should never be exposed to the client
- Use HTTPS in production
- Implement proper token refresh logic
- Consider implementing logout/token revocation 