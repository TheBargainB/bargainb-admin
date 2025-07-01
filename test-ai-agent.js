#!/usr/bin/env node

/**
 * Complete AI Agent Test Script
 * Tests the full pipeline: AI Agent -> Database -> WhatsApp Sending
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration - Using your actual BargainB setup
const AI_AGENT_URL = process.env.BARGAINB_API_URL || 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app';
const AI_AGENT_API_KEY = process.env.BARGAINB_API_KEY || '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';
const AI_ASSISTANT_ID = process.env.BARGAINB_ASSISTANT_ID || '5fd12ecb-9268-51f0-8168-fc7952c7c8b8';
const SUPABASE_URL = 'https://oumhprsxyxnocgbzosvh.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bWhwcnN4eXhub2NnYnpvc3ZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUwOTkxMiwiZXhwIjoyMDY0MDg1OTEyfQ.IBgTilAos3LC1ZoDKRWcu1F0mcOiAAFTFInQMhE2Bt0';
const WASENDER_API_KEY = process.env.WASENDER_API_KEY || '6d71a8f58abe8f8fe42039a1c4d8c141b8c607f6a3269159de47d9de7f5f47d3';

// Test conversation details
const TEST_CONVERSATION_ID = '74c46d53-4881-407c-b46b-ec695fb11c38';
const TEST_PHONE_NUMBER = '+31614539919';
const TEST_MESSAGE = 'Can you help me find premium Dutch chocolate under 12 euros?';

console.log('🧪 BargainB AI Agent Complete Test Suite');
console.log('=========================================\n');

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Test 1: Direct AI Agent API Test
 */
async function testAIAgentDirect() {
  console.log('1️⃣ Testing AI Agent Direct API...');
  
  try {
    // First create a thread
    const threadResponse = await fetch(`${AI_AGENT_URL}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': AI_AGENT_API_KEY
      },
      body: JSON.stringify({
        metadata: {
          conversation_id: TEST_CONVERSATION_ID,
          phone_number: TEST_PHONE_NUMBER
        }
      })
    });

    if (!threadResponse.ok) {
      throw new Error(`Thread creation failed: ${threadResponse.status} ${threadResponse.statusText}`);
    }

    const thread = await threadResponse.json();
    console.log(`✅ Thread created: ${thread.thread_id}`);

    // Now create a run with our test message
    const runResponse = await fetch(`${AI_AGENT_URL}/threads/${thread.thread_id}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': AI_AGENT_API_KEY
      },
      body: JSON.stringify({
        assistant_id: AI_ASSISTANT_ID,
        input: {
          messages: [
            {
              role: 'user',
              content: TEST_MESSAGE
            }
          ]
        }
      })
    });

    if (!runResponse.ok) {
      throw new Error(`Run creation failed: ${runResponse.status} ${runResponse.statusText}`);
    }

    const run = await runResponse.json();
    console.log(`✅ Run created: ${run.run_id}`);

    // Wait for the run to complete
    let runStatus = run;
    while (runStatus.status === 'pending' || runStatus.status === 'running') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`${AI_AGENT_URL}/threads/${thread.thread_id}/runs/${run.run_id}`, {
        headers: {
          'X-Api-Key': AI_AGENT_API_KEY
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Run status check failed: ${statusResponse.status}`);
      }
      
      runStatus = await statusResponse.json();
      console.log(`⏳ Run status: ${runStatus.status}`);
    }

    if (runStatus.status === 'success') {
      // Get the thread state to see the AI response
      const stateResponse = await fetch(`${AI_AGENT_URL}/threads/${thread.thread_id}/state`, {
        headers: {
          'X-Api-Key': AI_AGENT_API_KEY
        }
      });

      if (stateResponse.ok) {
        const state = await stateResponse.json();
        console.log('🔍 Thread state:', JSON.stringify(state, null, 2));
        
        // Try different ways to get the AI response
        let aiResponse = null;
        
        // Method 1: Look in messages array
        if (state.values?.messages) {
          const lastMessage = state.values.messages[state.values.messages.length - 1];
          if (lastMessage?.content) {
            aiResponse = lastMessage.content;
          }
        }
        
        // Method 2: Look in the run result
        if (!aiResponse && runStatus.output) {
          aiResponse = runStatus.output;
        }
        
        if (aiResponse) {
          console.log(`✅ AI Response received: ${aiResponse.substring(0, 200)}...`);
          return { success: true, response: aiResponse, threadId: thread.thread_id };
        } else {
          console.log('⚠️ Run successful but no AI response found in state');
          return { success: false, error: 'No AI response found in successful run' };
        }
      } else {
        console.log(`❌ Failed to get thread state: ${stateResponse.status}`);
        return { success: false, error: 'Failed to get thread state' };
      }
    }

    console.log(`❌ Run failed with status: ${runStatus.status}`);
    return { success: false, error: `Run failed: ${runStatus.status}` };

  } catch (error) {
    console.log(`❌ AI Agent test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: Database Save Test
 */
async function testDatabaseSave(aiResponse, threadId) {
  console.log('\n2️⃣ Testing Database Save...');
  
  try {
    // Generate unique message ID
    const whatsappMessageId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save AI response to database
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: TEST_CONVERSATION_ID,
        whatsapp_message_id: whatsappMessageId,
        content: aiResponse,
        message_type: 'text',
        direction: 'outbound',
        from_me: true,
        sender_type: 'ai_agent',
        is_ai_triggered: true,
        ai_thread_id: threadId,
      });

    if (error) {
      throw new Error(`Database save failed: ${error.message}`);
    }

    console.log(`✅ AI response saved to database with ID: ${whatsappMessageId}`);
    return { success: true, messageId: whatsappMessageId };

  } catch (error) {
    console.log(`❌ Database save failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: WhatsApp Sending Test
 */
async function testWhatsAppSending(message) {
  console.log('\n3️⃣ Testing WhatsApp Sending...');
  
  try {
    // Test sending via our send-message API
    const response = await fetch(`https://bargainb-git-main-bargainbs-projects.vercel.app/admin/chat/api/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: TEST_PHONE_NUMBER,
        text: message,
        conversationId: TEST_CONVERSATION_ID
      })
    });

    if (!response.ok) {
      throw new Error(`WhatsApp send failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ WhatsApp message sent successfully`);
    return { success: true, result };

  } catch (error) {
    console.log(`❌ WhatsApp sending failed: ${error.message}`);
    
    // Try direct WASender API test
    console.log('🔄 Testing direct WASender API...');
    
    try {
      const wasenderResponse = await fetch('https://www.wasenderapi.com/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WASENDER_API_KEY}`
        },
        body: JSON.stringify({
          to: TEST_PHONE_NUMBER,
          text: `[TEST] ${message}`
        })
      });

      if (wasenderResponse.ok) {
        console.log(`✅ Direct WASender API works`);
        return { success: true, method: 'direct_wasender' };
      } else {
        const errorText = await wasenderResponse.text();
        console.log(`❌ Direct WASender failed: ${wasenderResponse.status} ${errorText}`);
      }
    } catch (wasenderError) {
      console.log(`❌ Direct WASender error: ${wasenderError.message}`);
    }

    return { success: false, error: error.message };
  }
}

/**
 * Test 4: Environment Check
 */
async function checkEnvironment() {
  console.log('\n4️⃣ Checking Environment...');
  
  const checks = [
    { name: 'BARGAINB_API_KEY', value: AI_AGENT_API_KEY, sensitive: true },
    { name: 'BARGAINB_API_URL', value: AI_AGENT_URL },
    { name: 'BARGAINB_ASSISTANT_ID', value: AI_ASSISTANT_ID },
    { name: 'SUPABASE_URL', value: SUPABASE_URL },
    { name: 'SUPABASE_SERVICE_KEY', value: SUPABASE_SERVICE_KEY, sensitive: true },
    { name: 'WASENDER_API_KEY', value: WASENDER_API_KEY, sensitive: true },
  ];

  checks.forEach(check => {
    const hasValue = check.value && check.value !== `YOUR_${check.name}`;
    const displayValue = check.sensitive ? (hasValue ? '***CONFIGURED***' : '❌ NOT SET') : check.value;
    console.log(`${hasValue ? '✅' : '❌'} ${check.name}: ${displayValue}`);
  });
}

/**
 * Main Test Runner
 */
async function runCompleteTest() {
  console.log(`🎯 Testing with conversation: ${TEST_CONVERSATION_ID}`);
  console.log(`📱 Phone number: ${TEST_PHONE_NUMBER}`);
  console.log(`💬 Test message: "${TEST_MESSAGE}"\n`);

  // Check environment
  await checkEnvironment();

  // Test 1: AI Agent Direct
  const aiTest = await testAIAgentDirect();
  if (!aiTest.success) {
    console.log('\n❌ AI Agent test failed. Cannot proceed with further tests.');
    process.exit(1);
  }

  // Test 2: Database Save
  const dbTest = await testDatabaseSave(aiTest.response, aiTest.threadId);
  if (!dbTest.success) {
    console.log('\n⚠️ Database save failed, but continuing with WhatsApp test...');
  }

  // Test 3: WhatsApp Sending
  const whatsappTest = await testWhatsAppSending(aiTest.response);

  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`AI Agent Direct: ${aiTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Database Save: ${dbTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`WhatsApp Send: ${whatsappTest.success ? '✅ PASS' : '❌ FAIL'}`);

  if (aiTest.success && dbTest.success && whatsappTest.success) {
    console.log('\n🎉 ALL TESTS PASSED! The complete pipeline is working.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
}

// Run the test
runCompleteTest().catch(console.error); 