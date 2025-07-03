// Fix BB Agent assistant configuration with correct CRM profile ID
const BB_AGENT_URL = 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app';
const BB_AGENT_KEY = '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';
const ASSISTANT_ID = '0456e5fa-5c9f-428a-8750-f68bb14f11ad';
const CORRECT_CRM_PROFILE_ID = 'a2ecb77b-f7a4-474c-a4ce-47ad47f4dea6'; // Focused Creativity

async function fixAssistantCRMProfile() {
  console.log('🔧 Fixing Assistant CRM Profile Configuration...\n');
  
  try {
    // Step 1: Get current assistant configuration
    console.log('📋 Step 1: Getting current assistant configuration...');
    const getResponse = await fetch(`${BB_AGENT_URL}/assistants/${ASSISTANT_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': BB_AGENT_KEY
      }
    });
    
    if (!getResponse.ok) {
      throw new Error(`Failed to get assistant: ${getResponse.statusText}`);
    }
    
    const currentAssistant = await getResponse.json();
    console.log('✅ Current assistant retrieved');
    console.log('📝 Current config:', JSON.stringify(currentAssistant.config, null, 2));
    
    // Step 2: Update the CRM profile ID in the configuration
    console.log('\\n🔄 Step 2: Updating CRM profile ID...');
    const updatedConfig = {
      ...currentAssistant.config,
      configurable: {
        ...currentAssistant.config.configurable,
        CRM_PROFILE_ID: CORRECT_CRM_PROFILE_ID
      }
    };
    
    console.log('📝 Updated config:', JSON.stringify(updatedConfig, null, 2));
    
    // Step 3: Update the assistant
    console.log('\\n📤 Step 3: Updating assistant configuration...');
    const updateResponse = await fetch(`${BB_AGENT_URL}/assistants/${ASSISTANT_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': BB_AGENT_KEY
      },
      body: JSON.stringify({
        name: currentAssistant.name,
        config: updatedConfig,
        metadata: currentAssistant.metadata
      })
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update assistant: ${updateResponse.status} ${errorText}`);
    }
    
    const updatedAssistant = await updateResponse.json();
    console.log('✅ Assistant updated successfully!');
    console.log('📝 New CRM Profile ID:', updatedAssistant.config.configurable.CRM_PROFILE_ID);
    
    // Step 4: Test the fix by sending a message
    console.log('\\n🧪 Step 4: Testing the fix...');
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
    console.log('✅ Test thread created:', threadData.thread_id);
    
    const testResponse = await fetch(`${BB_AGENT_URL}/threads/${threadData.thread_id}/runs/wait`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': BB_AGENT_KEY
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
        input: {
          messages: [{ role: 'user', content: 'Test message: help me find headphones under $100' }]
        },
        config: {
          configurable: { 
            user_id: 'test-user',
            source: 'whatsapp',
            user_profile: null,
            RESPONSE_STYLE: 'concise'
          }
        }
      })
    });
    
    const testData = await testResponse.json();
    
    if (testData.__error__) {
      console.log('❌ Test failed with error:', testData.__error__);
    } else if (testData.messages && testData.messages.length > 0) {
      console.log('✅ Test successful! AI responded with:', testData.messages[testData.messages.length - 1].content.substring(0, 100) + '...');
    } else {
      console.log('⚠️ Test completed but no response message found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function main() {
  console.log('🔧 BB Agent Assistant CRM Profile Fix');
  console.log('=====================================\\n');
  
  console.log(`🎯 Target Assistant: ${ASSISTANT_ID}`);
  console.log(`🆔 Correct CRM Profile: ${CORRECT_CRM_PROFILE_ID} (Focused Creativity)\\n`);
  
  await fixAssistantCRMProfile();
  
  console.log('\\n🎉 Fix completed! The assistant should now work with the correct CRM profile.');
}

main().catch(console.error); 