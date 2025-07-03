// Debug BB Agent API response structure
const BB_AGENT_URL = 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app';
const BB_AGENT_KEY = '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';
const CORRECT_ASSISTANT_ID = '0456e5fa-5c9f-428a-8750-f68bb14f11ad';

async function debugBBAgentResponse() {
  console.log('🔍 Debugging BB Agent API Response Structure...\n');
  
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
    
    if (!threadResponse.ok) {
      throw new Error(`Thread creation failed: ${threadResponse.statusText}`);
    }
    
    const threadData = await threadResponse.json();
    console.log('✅ Thread created:', threadData.thread_id);
    
    // Step 2: Send message and get response
    console.log('\\n📤 Step 2: Sending message to AI...');
    const messageResponse = await fetch(`${BB_AGENT_URL}/threads/${threadData.thread_id}/runs/wait`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': BB_AGENT_KEY
      },
      body: JSON.stringify({
        assistant_id: CORRECT_ASSISTANT_ID,
        input: {
          messages: [{ role: 'user', content: 'Hello, please help me find wireless headphones under $100' }]
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
    
    console.log(`📊 Message Response Status: ${messageResponse.status}`);
    
    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.log(`❌ Message API Error: ${errorText}`);
      return;
    }
    
    const messageData = await messageResponse.json();
    console.log('\\n📋 Raw Response Data:');
    console.log(JSON.stringify(messageData, null, 2));
    
    // Step 3: Analyze the response structure
    console.log('\\n🔍 Response Analysis:');
    console.log('- Response type:', typeof messageData);
    console.log('- Has messages property:', !!messageData.messages);
    console.log('- Messages type:', typeof messageData.messages);
    console.log('- Messages length:', messageData.messages?.length);
    
    if (messageData.messages && messageData.messages.length > 0) {
      const lastMessage = messageData.messages[messageData.messages.length - 1];
      console.log('- Last message:', lastMessage);
      console.log('- Last message content:', lastMessage?.content);
      console.log('- Content type:', typeof lastMessage?.content);
    }
    
    // Step 4: Test the exact logic from the service
    console.log('\\n🧪 Testing Service Logic:');
    const aiResponse = messageData.messages?.[messageData.messages.length - 1]?.content;
    console.log('- Extracted AI response:', aiResponse);
    console.log('- AI response type:', typeof aiResponse);
    console.log('- AI response length:', aiResponse?.length);
    
    if (!aiResponse || typeof aiResponse !== 'string') {
      console.log('❌ This would cause the undefined error!');
    } else {
      console.log('✅ Response extraction successful!');
    }
    
  } catch (error) {
    console.error('❌ Debug Error:', error);
  }
}

debugBBAgentResponse(); 