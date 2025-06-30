import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    console.log(`🗑️ Deleting conversation: ${conversationId}`);

    // Delete in the correct order to avoid foreign key constraint violations
    const results = [];
    
    // First, get conversation info to find the contact
    const { data: conversationData } = await supabase
      .from('conversations')
      .select('whatsapp_contact_id')
      .eq('id', conversationId)
      .single();

    // Delete messages first (they reference the conversation)
    console.log('🗑️ Deleting messages...');
    const { error: messagesError, count: messagesCount } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);
    
    if (messagesError) {
      console.error('❌ Error deleting messages:', messagesError);
      throw messagesError;
    }
    console.log(`✅ Deleted ${messagesCount || 0} messages`);
    results.push({ step: 'messages', deleted: messagesCount || 0 });

    // Get CRM profile for this contact (will be used for related data deletion)
    let crmProfile = null;
    if (conversationData?.whatsapp_contact_id) {
      const { data: profileData } = await supabase
        .from('crm_profiles')
        .select('id')
        .eq('whatsapp_contact_id', conversationData.whatsapp_contact_id)
        .single();
      crmProfile = profileData;
    }

    // Delete grocery lists and customer events related to this conversation's contact
    if (crmProfile) {
      console.log('🗑️ Deleting grocery lists...');
      const { error: groceryListsError, count: groceryListsCount } = await supabase
        .from('grocery_lists')
      .delete()
        .eq('crm_profile_id', crmProfile.id);
    
      if (groceryListsError) {
        console.error('❌ Error deleting grocery lists:', groceryListsError);
        throw groceryListsError;
      }
      console.log(`✅ Deleted ${groceryListsCount || 0} grocery lists`);
      results.push({ step: 'grocery lists', deleted: groceryListsCount || 0 });

      // Delete customer events related to this CRM profile
      console.log('🗑️ Deleting customer events...');
      const { error: eventsError, count: eventsCount } = await supabase
        .from('customer_events')
        .delete()
        .eq('crm_profile_id', crmProfile.id);
      
      if (eventsError) {
        console.error('❌ Error deleting customer events:', eventsError);
        throw eventsError;
      }
      console.log(`✅ Deleted ${eventsCount || 0} customer events`);
      results.push({ step: 'customer events', deleted: eventsCount || 0 });
    } else {
      console.log('ℹ️ No CRM profile found for this contact, skipping related data deletion');
    }

    // Delete the conversation
    console.log('🗑️ Deleting conversation...');
    const { error: conversationError, count: conversationCount } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    
    if (conversationError) {
      console.error('❌ Error deleting conversation:', conversationError);
      throw conversationError;
    }
    console.log(`✅ Deleted ${conversationCount || 0} conversation`);
    results.push({ step: 'conversation', deleted: conversationCount || 0 });

    // Optionally delete the WhatsApp contact and CRM profile if no other conversations exist
    // This is more aggressive - you might want to keep the contact for future conversations
    if (conversationData?.whatsapp_contact_id) {
      // Check if contact has other conversations
      const { data: otherConversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('whatsapp_contact_id', conversationData.whatsapp_contact_id)
        .limit(1);

      if (!otherConversations || otherConversations.length === 0) {
        console.log('🗑️ No other conversations found, deleting contact and CRM profile...');
        
        // Delete CRM profile (reuse the crmProfile data we already fetched)
        if (crmProfile) {
          const { error: crmProfileError, count: crmProfileCount } = await supabase
            .from('crm_profiles')
            .delete()
            .eq('id', crmProfile.id);
          
          if (crmProfileError) {
            console.warn('⚠️ Error deleting CRM profile (non-critical):', crmProfileError);
          } else {
            console.log(`✅ Deleted ${crmProfileCount || 0} CRM profile`);
            results.push({ step: 'crm profile', deleted: crmProfileCount || 0 });
          }
        }

        // Delete WhatsApp contact
        const { error: contactError, count: contactCount } = await supabase
          .from('whatsapp_contacts')
          .delete()
          .eq('id', conversationData.whatsapp_contact_id);
        
        if (contactError) {
          console.warn('⚠️ Error deleting WhatsApp contact (non-critical):', contactError);
        } else {
          console.log(`✅ Deleted ${contactCount || 0} WhatsApp contact`);
          results.push({ step: 'whatsapp contact', deleted: contactCount || 0 });
        }
      } else {
        console.log('ℹ️ Contact has other conversations, keeping contact and CRM profile');
      }
    }

    console.log('✅ Conversation deleted successfully:', results);

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully',
      results
    });

  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete conversation' 
      },
      { status: 500 }
    );
  }
} 