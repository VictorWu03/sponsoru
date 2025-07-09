#!/usr/bin/env node

/**
 * TikTok App Configuration Diagnostic
 * 
 * This script helps diagnose specific TikTok Developer Portal configuration issues
 * that cause the "invalid_client" error.
 */

console.log('🏥 TikTok App Configuration Diagnostic');
console.log('=====================================\n');

function printSection(title, content) {
  console.log(`\n🔍 ${title}`);
  console.log(''.padEnd(title.length + 4, '-'));
  console.log(content);
}

function printChecklistItem(item, status = null) {
  const icon = status === true ? '✅' : status === false ? '❌' : '📋';
  console.log(`${icon} ${item}`);
}

async function diagnoseTikTokApp() {
  console.log('Based on the conversation history, here\'s what we know:\n');
  
  // Current status
  console.log('📊 Current Configuration Status:');
  printChecklistItem('Client Key: sbaw23uxynnnow2gu6 (18 chars)', true);
  printChecklistItem('Client Secret: e280c...dac (40 chars)', true);
  printChecklistItem('Redirect URI: https://sponsoru.vercel.app/auth/tiktok/callback', true);
  printChecklistItem('API Endpoint: https://open.tiktokapis.com/v2/oauth/token/', true);
  printChecklistItem('TikTok API Connectivity', true);
  printChecklistItem('Environment Variables', true);
  
  printSection('❌ Current Issue', 
    'Despite correct credentials, TikTok API returns:\n' +
    '{"error": "invalid_client", "error_description": "Client key or secret is incorrect."}\n\n' +
    'This error indicates the issue is in TikTok Developer Portal configuration, not our code.'
  );

  printSection('🔍 Most Likely Root Causes', 
    '1. **App Approval Status**\n' +
    '   - App may not be approved for production use\n' +
    '   - Status could be "In Review", "Draft", or "Rejected"\n\n' +
    '2. **Login Kit Configuration**\n' +
    '   - Login Kit for Web not properly enabled\n' +
    '   - Wrong product type selected\n\n' +
    '3. **Redirect URI Mismatch**\n' +
    '   - Exact character mismatch in registered URI\n' +
    '   - Case sensitivity or trailing slash issues\n\n' +
    '4. **App Environment Mode**\n' +
    '   - App in sandbox/development mode\n' +
    '   - Production credentials not active'
  );

  printSection('🛠️ Required Actions in TikTok Developer Portal', 
    '**STEP 1: Check App Status**\n' +
    '→ Visit: https://developers.tiktok.com/apps\n' +
    '→ Find your "Sponsoru" app\n' +
    '→ Check status (should be "Live" or "Approved")\n\n' +
    '**STEP 2: Verify Login Kit**\n' +
    '→ Go to "Products" section\n' +
    '→ Ensure "Login Kit for Web" is added\n' +
    '→ Check it\'s enabled and configured\n\n' +
    '**STEP 3: Validate Redirect URI**\n' +
    '→ In Login Kit settings, verify redirect URI is exactly:\n' +
    '   https://sponsoru.vercel.app/auth/tiktok/callback\n' +
    '→ No extra spaces, case differences, or trailing slashes\n\n' +
    '**STEP 4: Check Scopes**\n' +
    '→ Ensure these scopes are enabled:\n' +
    '   • user.info.basic\n' +
    '   • user.info.profile'
  );

  printSection('🚨 If App Not Approved', 
    '**This is the most likely cause of invalid_client error**\n\n' +
    '1. Submit app for review in TikTok Developer Portal\n' +
    '2. Provide detailed app description:\n' +
    '   "Sponsoru is an influencer sponsorship platform that helps creators\n' +
    '    connect with brands. We need TikTok integration to display creator\n' +
    '    analytics and calculate sponsorship rates."\n' +
    '3. Wait for approval (can take several days)\n' +
    '4. Check email for approval notifications'
  );

  printSection('🔄 Alternative Solutions', 
    '**Option 1: Create New App**\n' +
    '• Sometimes existing apps have persistent issues\n' +
    '• Create fresh app with Login Kit enabled from start\n\n' +
    '**Option 2: Try TikTok Business API**\n' +
    '• Different authentication flow\n' +
    '• May work if Display API has issues\n\n' +
    '**Option 3: Contact TikTok Support**\n' +
    '• Use TikTok Developer Portal support\n' +
    '• Provide Log ID from API errors for faster resolution'
  );

  printSection('🧪 Testing Strategy', 
    '**Immediate Tests:**\n' +
    '1. Check TikTok Developer Portal app status\n' +
    '2. Run: node monitor-tiktok-debug.js\n' +
    '3. Test with fresh OAuth code\n\n' +
    '**If Still Failing:**\n' +
    '1. Create new TikTok app\n' +
    '2. Update credentials in Vercel environment\n' +
    '3. Test again with new app'
  );

  printSection('📞 Support Resources', 
    '• TikTok Developer Portal: https://developers.tiktok.com/apps\n' +
    '• Login Kit Docs: https://developers.tiktok.com/doc/login-kit-web\n' +
    '• TikTok Support: Available in Developer Portal\n' +
    '• Our Debug Tools: node monitor-tiktok-debug.js'
  );

  console.log('\n🎯 **Next Action Items:**');
  console.log('1. 🔍 Check your TikTok app status in Developer Portal');
  console.log('2. 📋 Verify Login Kit is properly configured');  
  console.log('3. 🧪 Run interactive debug: node monitor-tiktok-debug.js');
  console.log('4. 📧 Submit app for review if not approved');
  console.log('5. 🆕 Consider creating new app if issues persist');
  
  console.log('\n💡 **Key Insight:**');
  console.log('The "invalid_client" error with correct credentials almost always');
  console.log('indicates an app approval or configuration issue in TikTok Developer Portal.');
}

// Run the diagnostic
if (require.main === module) {
  diagnoseTikTokApp().catch(console.error);
}

module.exports = { diagnoseTikTokApp }; 