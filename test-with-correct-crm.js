// Test AI processing with correct CRM profile ID in config
const BB_AGENT_URL = 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app';
const BB_AGENT_KEY = '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';
const ASSISTANT_ID = '0456e5fa-5c9f-428a-8750-f68bb14f11ad';
const CORRECT_CRM_PROFILE_ID = 'a2ecb77b-f7a4-474c-a4ce-47ad47f4dea6'; // Focused Creativity

async function testWithCorrectCRM() {
  console.log('🧪 Testing AI with Correct CRM Profile ID in Config...\n');
  
  try {
    // Step 1: Create a thread
    console.log('📝 Step 1: Creating thread...');
    const threadResponse = await fetch(`${BB_AGENT_URL}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': BB_AGENT_KEY
      },
      body: JSON.stringify({
        metadata: { 
          user_id: 'test-user',
          source: 'whatsapp'
        }
      })
    });
    
    const threadData = await threadResponse.json();
    console.log('✅ Thread created:', threadData.thread_id);
    
    // Step 2: Send message with correct CRM profile ID in config
    console.log('\\n📤 Step 2: Sending message with CORRECT CRM profile ID...');
    const messageResponse = await fetch(`${BB_AGENT_URL}/threads/${threadData.thread_id}/runs/wait`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': BB_AGENT_KEY
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
        input: {
          messages: [{ role: 'user', content: 'FIXED TEST: Help me find wireless headphones under $100. The CRM profile has been corrected!' }]
        },
        config: {
          configurable: { 
            user_id: 'test-user',
            source: 'whatsapp',
            user_profile: null,
            CRM_PROFILE_ID: CORRECT_CRM_PROFILE_ID, // Override with correct ID
            RESPONSE_STYLE: 'concise'
          }
        }
      })
    });
    
    console.log(`📊 Message Response Status: ${messageResponse.status}`);
    
    const messageData = await messageResponse.json();
    
    if (messageData.__error__) {
      console.log('❌ Still getting error:', messageData.__error__);
      return false;
    } else if (messageData.messages && messageData.messages.length > 0) {
      const aiResponse = messageData.messages[messageData.messages.length - 1].content;
      console.log('✅ SUCCESS! AI responded with:', aiResponse.substring(0, 200) + '...');
      return true;
    } else {
      console.log('⚠️ Unexpected response structure:', messageData);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

async function main() {
  console.log('🔧 AI Processing Test with Correct CRM Profile ID');
  console.log('==================================================\\n');
  
  console.log(`🎯 Assistant ID: ${ASSISTANT_ID}`);
  console.log(`🆔 Correct CRM Profile: ${CORRECT_CRM_PROFILE_ID} (Focused Creativity)\\n`);
  
  const success = await testWithCorrectCRM();
  
  if (success) {
    console.log('\\n🎉 SUCCESS! The AI processing works with the correct CRM profile ID.');
    console.log('💡 Now we need to fix the live API to use this correct ID.');
  } else {
    console.log('\\n❌ Still not working. We may need to investigate further.');
  }
}

main().catch(console.error); 