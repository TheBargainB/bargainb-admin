// Test configuration
const BASE_URL = 'https://www.thebargainb.com';
const TEST_CONVERSATION_ID = '7b6e9444-f07f-450b-b42d-1f7e3127221c';
const TEST_MESSAGE = '@bb FIXED TEST: Help me find wireless headphones under $100';
const TEST_USER_ID = '7b6e9444-f07f-450b-b42d-1f7e3127221c'; // Use conversation ID as user ID like the send-message API does

async function testAIProcessing() {
  console.log('🤖 Testing AI Processing Endpoint with FIXED assistant ID...\n');
  
  try {
    // Test the AI processing endpoint directly
    const response = await fetch(`${BASE_URL}/api/whatsapp/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: TEST_CONVERSATION_ID,
        message: TEST_MESSAGE,
        userId: TEST_USER_ID
      })
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS: AI Processing works!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
      return { success: true, result };
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED: AI Processing error`);
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
  console.log('🔧 AI Processing Test with Fixed Assistant ID');
  console.log('==============================================\n');
  
  // Test AI processing endpoint directly
  const aiTest = await testAIProcessing();
  
  console.log('\n📊 RESULT:');
  console.log('==========');
  console.log(`AI Processing: ${aiTest.success ? '✅ Working' : '❌ Failed'}`);
  
  if (!aiTest.success) {
    console.log('\n🔍 Issue Details:');
    console.log(`- ${aiTest.error}`);
  } else {
    console.log('\n🎉 AI Processing is now working! The issue was the assistant ID mismatch.');
  }
}

main().catch(console.error); 