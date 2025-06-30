import { ContactService } from '../../lib/contact-service'

export async function GET() {
  console.log('🔍 Contacts API called - fetching from WASender');
  
  try {
    const apiKey = process.env.WASENDER_API_KEY;
    const apiUrl = process.env.WASENDER_API_URL || 'https://www.wasenderapi.com';
    
    if (!apiKey) {
      console.error('❌ WASENDER_API_KEY not found in environment variables');
      return Response.json(
        { error: 'WASender API key not configured' }, 
        { status: 500 }
      );
    }
    
    console.log('📡 Calling WASender API for contacts...');
    const response = await fetch(`${apiUrl}/api/contacts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 WASender API response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ WASender API error:', errorText);
      return Response.json(
        { error: `WASender API error: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }
    
    const result = await response.json();
    console.log('📋 WASender contacts response:', JSON.stringify(result, null, 2));
    
    // WASender returns { success: true, data: [...] }
    if (result.success && result.data) {
      console.log('✅ Successfully fetched', result.data.length, 'contacts from WASender');
      console.log('📱 Individual contacts:');
      result.data.forEach((contact: any, index: number) => {
        console.log(`   ${index + 1}:`, JSON.stringify(contact, null, 2));
      });

      return Response.json({
        data: result.data
      });
    } else {
      console.log('⚠️ WASender returned unsuccessful response or no data');
      return Response.json({
        data: []
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching contacts from WASender:', error);
    return Response.json(
      { error: 'Failed to fetch contacts from WASender API' }, 
      { status: 500 }
    );
  }
} 