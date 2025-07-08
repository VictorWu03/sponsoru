#!/usr/bin/env node

/**
 * TikTok Integration Test Script
 * 
 * This script validates the TikTok integration configuration and provides
 * actionable debugging information.
 */

const https = require('https');
const { URLSearchParams } = require('url');

// Configuration
const BASE_URL = 'https://sponsoru.vercel.app';
const TIKTOK_API_BASE = 'https://open.tiktokapis.com';

console.log('🚀 TikTok Integration Test Script');
console.log('=====================================\n');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
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
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function testEnvironmentConfiguration() {
  console.log('1️⃣  Testing Environment Configuration...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/test-tiktok-env`);
    
    if (response.status === 200) {
      const env = response.data.environment;
      console.log(`   ✅ Environment endpoint accessible`);
      console.log(`   📋 Client Key: ${env.clientKey === 'NOT SET' ? '❌ NOT SET' : '✅ SET'} (${env.clientKeyLength} chars)`);
      console.log(`   📋 Client Secret: ${env.clientSecret === 'NOT SET' ? '❌ NOT SET' : '✅ SET'} (${env.clientSecretLength} chars)`);
      console.log(`   📋 Environment: ${env.nodeEnv}`);
      
      return {
        success: true,
        clientKeyValid: env.clientKeyLength === 18,
        clientSecretValid: env.clientSecretLength === 40,
        data: response.data
      };
    } else {
      console.log(`   ❌ Environment test failed: ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log(`   ❌ Environment test error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAppValidation() {
  console.log('\n2️⃣  Testing App Validation...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/tiktok/validate-app`);
    
    if (response.status === 200) {
      const validation = response.data;
      console.log(`   ✅ Validation endpoint accessible`);
      console.log(`   📊 Overall Status: ${validation.status}`);
      
      if (validation.issues && validation.issues.length > 0) {
        console.log(`   ⚠️  Issues Found:`);
        validation.issues.forEach(issue => console.log(`      - ${issue}`));
      }
      
      if (validation.suggestions && validation.suggestions.length > 0) {
        console.log(`   💡 Suggestions:`);
        validation.suggestions.forEach(suggestion => console.log(`      - ${suggestion}`));
      }
      
      return { success: true, status: validation.status, data: validation };
    } else {
      console.log(`   ❌ App validation failed: ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log(`   ❌ App validation error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testTikTokAPIConnectivity() {
  console.log('\n3️⃣  Testing TikTok API Connectivity...');
  
  try {
    const testParams = new URLSearchParams({
      client_key: 'test_key',
      client_secret: 'test_secret',
      code: 'test_code',
      grant_type: 'authorization_code',
      redirect_uri: `${BASE_URL}/auth/tiktok/callback`,
    });

    const response = await makeRequest(`${TIKTOK_API_BASE}/v2/oauth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: testParams.toString()
    });

    console.log(`   📡 TikTok API Response: ${response.status}`);
    
    if (response.data && response.data.error) {
      console.log(`   📋 Expected Error: ${response.data.error} (${response.data.error_description || 'No description'})`);
      
      // This is expected - we're using test credentials
      if (response.data.error === 'invalid_client' || response.data.error === 'invalid_grant') {
        console.log(`   ✅ TikTok API is reachable and responding correctly`);
        return { success: true, apiReachable: true };
      }
    }
    
    console.log(`   ⚠️  Unexpected response from TikTok API`);
    return { success: true, apiReachable: true, unexpected: true };
    
  } catch (error) {
    console.log(`   ❌ TikTok API connectivity error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function generateOAuthURL() {
  console.log('\n4️⃣  Generating OAuth URL...');
  
  try {
    const envResponse = await makeRequest(`${BASE_URL}/api/test-tiktok-env`);
    
    if (envResponse.status !== 200 || !envResponse.data.environment.clientKey) {
      console.log(`   ❌ Cannot generate OAuth URL - missing client key`);
      return { success: false };
    }
    
    const clientKey = envResponse.data.environment.clientKey;
    const state = Math.random().toString(36).substring(7);
    const redirectUri = `${BASE_URL}/auth/tiktok/callback`;
    const scopes = 'user.info.basic,user.info.profile';
    
    const params = new URLSearchParams({
      client_key: clientKey,
      scope: scopes,
      response_type: 'code',
      redirect_uri: redirectUri,
      state: state
    });
    
    const oauthUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
    
    console.log(`   ✅ OAuth URL Generated Successfully`);
    console.log(`   🔗 URL: ${oauthUrl}`);
    console.log(`   📋 State: ${state}`);
    console.log(`   📋 Redirect URI: ${redirectUri}`);
    console.log(`   📋 Scopes: ${scopes}`);
    
    return { 
      success: true, 
      oauthUrl, 
      state, 
      redirectUri, 
      scopes,
      clientKey: clientKey.substring(0, 8) + '...'
    };
    
  } catch (error) {
    console.log(`   ❌ OAuth URL generation error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('Starting comprehensive TikTok integration test...\n');
  
  const results = {
    environment: await testEnvironmentConfiguration(),
    validation: await testAppValidation(),
    connectivity: await testTikTokAPIConnectivity(),
    oauth: await generateOAuthURL()
  };
  
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
  const allPassed = Object.values(results).every(result => result.success);
  
  console.log(`Environment Config: ${results.environment.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`App Validation: ${results.validation.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`TikTok API Connectivity: ${results.connectivity.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`OAuth URL Generation: ${results.oauth.success ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\n🎯 Overall Status: ${allPassed ? '✅ READY TO TEST' : '❌ ISSUES DETECTED'}`);
  
  if (allPassed) {
    console.log('\n🚀 Next Steps:');
    console.log('1. Visit the generated OAuth URL in your browser');
    console.log('2. Complete the TikTok authorization flow');
    console.log('3. Check the callback page for token exchange results');
    console.log('4. If token exchange fails with "invalid_client", check TikTok Developer Portal');
    
    if (results.oauth.oauthUrl) {
      console.log('\n🔗 Test OAuth URL:');
      console.log(results.oauth.oauthUrl);
    }
  } else {
    console.log('\n🔧 Issues to Fix:');
    Object.entries(results).forEach(([test, result]) => {
      if (!result.success && result.error) {
        console.log(`- ${test}: ${result.error}`);
      }
    });
  }
  
  console.log('\n📚 Troubleshooting Resources:');
  console.log('- TikTok Developer Portal: https://developers.tiktok.com/apps');
  console.log('- Login Kit Documentation: https://developers.tiktok.com/doc/login-kit-web');
  console.log('- Local Troubleshooting Guide: ./TIKTOK_TROUBLESHOOTING.md');
  
  return results;
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testEnvironmentConfiguration, testAppValidation, testTikTokAPIConnectivity, generateOAuthURL }; 