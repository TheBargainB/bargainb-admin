#!/usr/bin/env node

/**
 * WhatsApp Sending Test Only
 * Tests just the WhatsApp API to verify it's working
 */

const WASENDER_API_KEY = '6d71a8f58abe8f8fe42039a1c4d8c141b8c607f6a3269159de47d9de7f5f47d3';
const TEST_PHONE_NUMBER = '+31614539919';
const TEST_MESSAGE = 'Test AI response: I found some great Dutch chocolate options for you!';

console.log('📱 BargainB WhatsApp Sending Test');
console.log('==================================\n');

/**
 * Test Direct WASender API
 */
async function testDirectWASenderAPI() {
  console.log('📤 Testing Direct WASender API...');
  
  try {
    console.log(`📱 Phone: ${TEST_PHONE_NUMBER}`);
    console.log(`💬 Message: "${TEST_MESSAGE}"`);
    console.log(`🔑 API Key: ${WASENDER_API_KEY.substring(0, 10)}...`);
    
    const wasenderResponse = await fetch('https://www.wasenderapi.com/api/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WASENDER_API_KEY}`
      },
      body: JSON.stringify({
        to: TEST_PHONE_NUMBER,
        text: `[AI AGENT TEST] ${TEST_MESSAGE}`
      })
    });

    console.log(`📊 Response Status: ${wasenderResponse.status} ${wasenderResponse.statusText}`);
    
    if (wasenderResponse.ok) {
      const result = await wasenderResponse.json();
      console.log('✅ SUCCESS: Direct WASender API works!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
      return { success: true, result };
    } else {
      const errorText = await wasenderResponse.text();
      console.log(`❌ FAILED: WASender API error`);
      console.log(`📋 Error Response: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log(`❌ FAILED: Network error`);
    console.log(`📋 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test Send Message API
 */
async function testSendMessageAPI() {
  console.log('\n📡 Testing BargainB Send Message API...');
  
  try {
    const response = await fetch('https://bargainb-git-main-bargainbs-projects.vercel.app/admin/chat/api/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: TEST_PHONE_NUMBER,
        text: `[API TEST] ${TEST_MESSAGE}`,
        conversationId: '74c46d53-4881-407c-b46b-ec695fb11c38'
      })
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS: Send Message API works!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
      return { success: true, result };
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED: Send Message API error`);
      console.log(`📋 Error Response: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log(`❌ FAILED: Network error`);
    console.log(`📋 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Main Test Runner
 */
async function runWhatsAppTests() {
  console.log('🎯 Testing WhatsApp sending functionality...\n');

  // Test 1: Direct WASender API
  const directTest = await testDirectWASenderAPI();

  // Test 2: Send Message API  
  const apiTest = await testSendMessageAPI();

  // Summary
  console.log('\n📊 WHATSAPP TEST RESULTS');
  console.log('=========================');
  console.log(`Direct WASender API: ${directTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Send Message API: ${apiTest.success ? '✅ PASS' : '❌ FAIL'}`);

  if (directTest.success && apiTest.success) {
    console.log('\n🎉 ALL WHATSAPP TESTS PASSED!');
    console.log('✅ WhatsApp sending is working correctly');
  } else if (directTest.success) {
    console.log('\n⚠️ Direct API works but Send Message API fails');
    console.log('💡 Check your admin API configuration');
  } else {
    console.log('\n❌ WhatsApp API issues detected');
    console.log('💡 Check API key and endpoint configuration');
  }
}

// Run the test
runWhatsAppTests().catch(console.error); 