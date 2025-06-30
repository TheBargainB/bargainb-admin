import { ContactService } from '../../../lib/contact-service'

export async function POST() {
  console.log('🔄 Contact sync API called - fetching and storing contacts');
  
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
    console.log('📋 WASender contacts response received with', result.data?.length || 0, 'contacts');
    
    // WASender returns { success: true, data: [...] }
    if (result.success && result.data) {
      const contactsArray = result.data.filter((contact: any) => contact.id);
      console.log('💾 Storing contacts with profile pictures...');
      
      // Process contacts in smaller batches to fetch profile pictures
      const batchSize = 5; // Small batches to avoid rate limits
      let totalStored = 0;
      let totalWithImages = 0;
      
      for (let i = 0; i < contactsArray.length; i += batchSize) {
        const batch = contactsArray.slice(i, i + batchSize);
        console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(contactsArray.length/batchSize)}...`);
        
        // Fetch profile pictures for each contact in the batch
        const contactsWithImages = await Promise.all(
                    batch.map(async (contact: any) => {
            let imgUrl = contact.imgUrl || null;
            // Use raw phone number (contact.id), not with @s.whatsapp.net
            const phoneNumber = contact.id.replace('@s.whatsapp.net', '');
            
            // Try to fetch profile picture from WASender API
            if (!imgUrl) {
              try {
                console.log(`📸 Fetching profile picture for: ${phoneNumber}`);
                const pictureResponse = await fetch(`${apiUrl}/api/contacts/${phoneNumber}/picture`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (pictureResponse.ok) {
                  const pictureResult = await pictureResponse.json();
                  if (pictureResult.success && pictureResult.data?.imgUrl) {
                    imgUrl = pictureResult.data.imgUrl;
                    console.log(`✅ Got profile picture for ${phoneNumber}`);
                  } else {
                    console.log(`📷 No profile picture available for ${phoneNumber}`);
                  }
                } else {
                  console.warn(`⚠️ Failed to fetch profile picture for ${phoneNumber}: ${pictureResponse.status}`);
                }
              } catch (error) {
                console.warn(`⚠️ Error fetching profile picture for ${phoneNumber}:`, error);
              }
            }
            
            // Track if this contact has an image
            const hasImage = !!imgUrl;
            
            return {
              phoneNumber: phoneNumber, // Use cleaned phone number instead of contact.id
              hasImage: hasImage,
              data: {
                id: contact.id,
                name: contact.name,
                notify: contact.notify,
                verifiedName: contact.verifiedName,
                imgUrl: imgUrl,
                status: contact.status
              }
            };
          })
        );

        const storedContacts = await ContactService.upsertContacts(contactsWithImages.map(c => ({ phoneNumber: c.phoneNumber, data: c.data })));
        const imagesInBatch = contactsWithImages.filter(c => c.hasImage).length;
        console.log(`💾 Stored batch ${Math.floor(i/batchSize) + 1}: ${storedContacts.length} contacts (${imagesInBatch} with images)`);
        totalStored += storedContacts.length;
        totalWithImages += imagesInBatch;
        
        // Small delay between batches to be nice to the API
        if (i + batchSize < contactsArray.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log('💾 Successfully stored', totalStored, 'contacts in database');
      console.log('📸 Profile pictures found for', totalWithImages, 'contacts');
      
      const message = totalWithImages > 0 
        ? `Synced ${totalStored} contacts (${totalWithImages} with profile pictures) from WASender to database`
        : `Synced ${totalStored} contacts from WASender to database (no profile pictures available)`;
      
      return Response.json({
        success: true,
        message: message,
        synced: totalStored,
        withImages: totalWithImages,
        total: result.data.length
      });
    } else {
      console.log('⚠️ WASender returned unsuccessful response or no data');
      return Response.json({
        success: false,
        error: 'No contacts received from WASender'
      });
    }
    
  } catch (error) {
    console.error('❌ Error syncing contacts:', error);
    return Response.json(
      { error: 'Failed to sync contacts from WASender API' }, 
      { status: 500 }
    );
  }
} 