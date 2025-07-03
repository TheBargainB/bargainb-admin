// BB Agent API configuration
const BB_AGENT_URL = 'https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app';
const BB_AGENT_KEY = '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';

// Assistant ID from database
const DATABASE_ASSISTANT_ID = '0456e5fa-7acc-45e8-9e23-9c1b0a9b5c3b';
const DATABASE_THREAD_ID = '5d4c83a5-85a1-4edf-a36f-98a4cc4ae62b';

async function testBBAgentConnection() {
  console.log('🔗 Testing BB Agent Connection...\n');
  
  try {
    const response = await fetch(`${BB_AGENT_URL}/assistants/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': BB_AGENT_KEY
      },
      body: JSON.stringify({
        metadata: {},
        graph_id: "product_retrieval_agent",
        limit: 10,
        offset: 0,
        sort_by: "created_at",
        sort_order: "desc"
      })
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS: BB Agent is accessible!');
      console.log(`📋 Found ${result.length} assistants`);
      
      // Check if our database assistant ID exists
      const ourAssistant = result.find(a => a.assistant_id === DATABASE_ASSISTANT_ID);
      if (ourAssistant) {
        console.log('✅ Database assistant ID found in BB Agent!');
        console.log('📋 Assistant details:', JSON.stringify(ourAssistant, null, 2));
      } else {
        console.log('❌ Database assistant ID NOT found in BB Agent!');
        console.log('📋 Available assistant IDs:');
        result.forEach((assistant, index) => {
          console.log(`  ${index + 1}. ${assistant.assistant_id} (${assistant.name || 'Unnamed'})`);
        });
      }
      
      return { success: true, assistants: result, ourAssistant };
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED: BB Agent error`);
      console.log(`📋 Error Response: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log(`❌ FAILED: Network error connecting to BB Agent`);
    console.log(`📋 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testSpecificAssistant() {
  console.log('\n🤖 Testing Specific Assistant...\n');
  
  try {
    const response = await fetch(`${BB_AGENT_URL}/assistants/${DATABASE_ASSISTANT_ID}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': BB_AGENT_KEY
      }
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS: Assistant exists!');
      console.log('📋 Assistant:', JSON.stringify(result, null, 2));
      return { success: true, assistant: result };
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED: Assistant not found`);
      console.log(`📋 Error Response: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log(`❌ FAILED: Network error`);
    console.log(`📋 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testThreadCreation() {
  console.log('\n🧵 Testing Thread Creation...\n');
  
  try {
    const response = await fetch(`${BB_AGENT_URL}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': BB_AGENT_KEY
      },
      body: JSON.stringify({
        metadata: { 
          user_id: 'test-user', 
          source: 'whatsapp',
          assistant_id: DATABASE_ASSISTANT_ID 
        }
      })
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS: Thread created!');
      console.log('📋 Thread ID:', result.thread_id);
      return { success: true, threadId: result.thread_id };
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED: Thread creation failed`);
      console.log(`📋 Error Response: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log(`❌ FAILED: Network error`);
    console.log(`📋 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔧 BB Agent Debug Tool');
  console.log('======================\n');
  console.log('Database Assistant ID:', DATABASE_ASSISTANT_ID);
  console.log('Database Thread ID:', DATABASE_THREAD_ID);
  console.log('');
  
  // Test BB Agent connection and list assistants
  const connectionTest = await testBBAgentConnection();
  
  // Test specific assistant
  const assistantTest = await testSpecificAssistant();
  
  // Test thread creation
  const threadTest = await testThreadCreation();
  
  console.log('\n📊 SUMMARY:');
  console.log('===========');
  console.log(`BB Agent Connection: ${connectionTest.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`Database Assistant: ${assistantTest.success ? '✅ Exists' : '❌ Not Found'}`);
  console.log(`Thread Creation: ${threadTest.success ? '✅ Working' : '❌ Failed'}`);
  
  if (!connectionTest.success || !assistantTest.success || !threadTest.success) {
    console.log('\n🔍 Issues Found:');
    if (!connectionTest.success) console.log(`- BB Agent: ${connectionTest.error}`);
    if (!assistantTest.success) console.log(`- Assistant: ${assistantTest.error}`);
    if (!threadTest.success) console.log(`- Thread: ${threadTest.error}`);
    
    if (connectionTest.success && !assistantTest.success && connectionTest.assistants?.length > 0) {
      console.log('\n💡 Suggested Fix:');
      console.log('Update the database assistant_id to one of these working assistants:');
      connectionTest.assistants.forEach((assistant, index) => {
        console.log(`  ${index + 1}. ${assistant.assistant_id} (${assistant.name || 'Unnamed'})`);
      });
    }
  } else {
    console.log('\n✅ All tests passed! The issue might be elsewhere in the AI processing chain.');
  }
}

main().catch(console.error); 