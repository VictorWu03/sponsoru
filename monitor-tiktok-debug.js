#!/usr/bin/env node

/**
 * TikTok OAuth Debug Monitor
 * 
 * This script helps monitor and debug TikTok OAuth attempts in real-time
 */

const https = require('https');

console.log('🔍 TikTok OAuth Debug Monitor');
console.log('============================\n');

function formatTimestamp() {
  return new Date().toLocaleTimeString();
}

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function checkEnvironment() {
  try {
    const response = await makeRequest('https://sponsoru.vercel.app/api/test-tiktok-env');
    if (response.status === 200) {
      const env = response.data.environment;
      return {
        status: 'OK',
        clientKey: env.clientKey !== 'NOT SET',
        clientSecret: env.clientSecret !== 'NOT SET'
      };
    }
    return { status: 'ERROR', error: `HTTP ${response.status}` };
  } catch (error) {
    return { status: 'ERROR', error: error.message };
  }
}

async function testWithFreshCode() {
  console.log(`[${formatTimestamp()}] 🧪 Testing with a fresh authorization code...`);
  console.log('');
  console.log('🔗 Get a fresh code from:');
  console.log('https://www.tiktok.com/v2/auth/authorize/?client_key=sbaw23uxynnnow2gu6&scope=user.info.basic%2Cuser.info.profile&response_type=code&redirect_uri=https%3A%2F%2Fsponsoru.vercel.app%2Fauth%2Ftiktok%2Fcallback&state=debug123');
  console.log('');
  console.log('📋 Steps:');
  console.log('1. Open the URL above in a new browser tab');
  console.log('2. Complete TikTok authorization');
  console.log('3. From the callback URL, copy the "code" parameter');
  console.log('4. Enter it below when prompted');
  console.log('');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question('Enter the authorization code (or "skip" to skip): ', async (code) => {
      readline.close();
      
      if (code === 'skip' || !code) {
        console.log('Skipping fresh code test.\n');
        resolve(null);
        return;
      }

      try {
        console.log(`[${formatTimestamp()}] 🔄 Testing code: ${code.substring(0, 20)}...`);
        
        const response = await makeRequest(`https://sponsoru.vercel.app/api/tiktok-debug-live?code=${encodeURIComponent(code)}`);
        
        console.log(`[${formatTimestamp()}] 📡 Response Status: ${response.status}`);
        
        if (response.status === 200 && response.data) {
          const testResult = response.data;
          
          console.log('📊 Test Results:');
          console.log(`   Code Length: ${testResult.test_info?.code_length || 'unknown'}`);
          console.log(`   Response Time: ${testResult.test_info?.response_time_ms || 'unknown'}ms`);
          console.log(`   TikTok API Status: ${testResult.response?.status || 'unknown'}`);
          
          if (testResult.response?.data?.error) {
            console.log(`   ❌ Error: ${testResult.response.data.error}`);
            console.log(`   📝 Description: ${testResult.response.data.error_description || 'No description'}`);
            console.log(`   🆔 Log ID: ${testResult.response.data.log_id || 'No log ID'}`);
            
            if (testResult.response.data.error === 'invalid_client') {
              console.log('');
              console.log('🔍 INVALID_CLIENT Analysis:');
              console.log('   This error means TikTok doesn\'t recognize your app credentials.');
              console.log('   Most likely causes:');
              console.log('   1. App not approved for production use');
              console.log('   2. Login Kit not properly enabled');
              console.log('   3. App credentials don\'t match TikTok Developer Portal');
              console.log('   4. App is in wrong mode (sandbox vs production)');
            }
          } else if (testResult.response?.data?.access_token) {
            console.log('   ✅ Success! Access token received');
            console.log(`   🎫 Token: ${testResult.response.data.access_token.substring(0, 20)}...`);
          }
        } else {
          console.log(`   ❌ Debug endpoint error: ${response.status}`);
        }
        
        resolve(testResult);
      } catch (error) {
        console.log(`   ❌ Test error: ${error.message}`);
        resolve(null);
      }
    });
  });
}

async function monitorAndDebug() {
  console.log(`[${formatTimestamp()}] 🚀 Starting TikTok OAuth Debug Session`);
  console.log('');
  
  // Check environment first
  console.log(`[${formatTimestamp()}] 📋 Checking environment...`);
  const envCheck = await checkEnvironment();
  
  if (envCheck.status === 'OK') {
    console.log(`[${formatTimestamp()}] ✅ Environment: OK`);
    console.log(`   Client Key: ${envCheck.clientKey ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   Client Secret: ${envCheck.clientSecret ? '✅ SET' : '❌ NOT SET'}`);
  } else {
    console.log(`[${formatTimestamp()}] ❌ Environment: ${envCheck.error}`);
    return;
  }
  
  console.log('');
  
  // Test with fresh code
  await testWithFreshCode();
  
  console.log(`[${formatTimestamp()}] 📊 Debug Session Complete`);
  console.log('');
  console.log('🔧 Troubleshooting Resources:');
  console.log('- TikTok Developer Portal: https://developers.tiktok.com/apps');
  console.log('- App Validation: https://sponsoru.vercel.app/api/tiktok/validate-app');
  console.log('- Local Guide: ./TIKTOK_TROUBLESHOOTING.md');
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('1. If you got "invalid_client", check TikTok Developer Portal');
  console.log('2. Verify your app has Login Kit enabled');
  console.log('3. Ensure app is approved for production use');
  console.log('4. Check redirect URI matches exactly');
}

// Run the monitor
if (require.main === module) {
  monitorAndDebug().catch(console.error);
}

module.exports = { monitorAndDebug, checkEnvironment }; 