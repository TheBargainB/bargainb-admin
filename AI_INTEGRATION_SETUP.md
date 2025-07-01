# 🤖 BargainB AI Integration Setup Guide

This guide will help you integrate your LangGraph grocery shopping agent with the BargainB admin panel.

## 📋 Prerequisites

- ✅ LangGraph grocery shopping agent deployed and working
- ✅ Supabase database with existing WhatsApp chat system
- ✅ Admin panel access with proper permissions
- ✅ Environment variables access

## 🚀 Step-by-Step Setup

### Step 1: Environment Variables

Add these variables to your `.env.local` file:

```bash
# AI Agent Configuration (LangGraph)
BARGAINB_API_URL=https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app
BARGAINB_API_KEY=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
BARGAINB_ASSISTANT_ID=5fd12ecb-9268-51f0-8168-fc7952c7c8b8

# Supabase (you probably already have these)
NEXT_PUBLIC_SUPABASE_URL=https://oumhprsxyxnocgbzosvh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 2: Database Migration

1. Open your **Supabase SQL Editor**
2. Copy and paste the contents of `database-ai-migration.sql`
3. Click **Run** to execute the migration
4. Verify you see the success message: "🎉 AI migration completed successfully!"

### Step 3: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to **AI Management** in your admin panel:
   ```
   http://localhost:3000/admin/ai-management
   ```

3. Check the **LangGraph Agent Status** card:
   - ✅ **Green dot**: "Connected to LangGraph Platform" 
   - ❌ **Red dot**: "Connection Failed" (see troubleshooting below)

### Step 4: Enable AI for a Chat

1. Go to **Chat Management**:
   ```
   http://localhost:3000/admin/chat
   ```

2. Select a conversation from the list

3. In the user profile tabs, click **"AI Configuration"**

4. Toggle **"Enable AI Assistant"** to ON

5. Choose your preferred **Response Style**:
   - **Concise & Quick**: Brief, direct responses
   - **Helpful & Friendly**: Balanced detail with personality  
   - **Detailed & Thorough**: Comprehensive explanations

6. Click **"Save Configuration"**

### Step 5: Test AI Responses

1. In the chat interface, send a test message with the `@bb` trigger:
   ```
   @bb what are some good breakfast cereals on sale?
   ```

2. The AI should respond with grocery shopping assistance

3. Check the **AI Configuration** tab for usage statistics

## 🎯 Features Enabled

### ✨ AI Management Dashboard
- **Real-time connection status** to your LangGraph agent
- **Usage analytics** and performance metrics
- **Global configuration** for AI behavior
- **Recent interactions** monitoring

### 🔧 Per-Chat Configuration
- **Enable/disable AI** for individual conversations
- **Response style selection** (concise, helpful, detailed)
- **Auto-response settings** for advanced users
- **Usage statistics** per conversation

### 📊 AI Capabilities
Your LangGraph agent can now help users with:
- **Product search** across Dutch supermarkets
- **Price comparison** (Albert Heijn, Jumbo, Dirk)
- **Meal planning** and recipe suggestions
- **Shopping list** generation and optimization
- **Budget tracking** and recommendations
- **Nutritional information** and dietary advice

### 💬 How Users Interact
- Users type `@bb` followed by their question
- Example: `@bb what's the cheapest milk at Albert Heijn?`
- AI responds instantly with personalized assistance
- Admins can still override with manual responses

## 🔍 Verification Checklist

- [ ] Environment variables are set correctly
- [ ] Database migration ran successfully  
- [ ] AI Management page shows "Connected" status
- [ ] Can enable AI for a test chat
- [ ] `@bb` messages trigger AI responses
- [ ] Usage statistics are being tracked
- [ ] Admin can still send manual messages

## 🚨 Troubleshooting

### Connection Failed Error

**Symptoms**: Red dot with "Connection Failed" message

**Solutions**:
1. **Check API URL**: Verify `BARGAINB_API_URL` is correct
2. **Verify API Key**: Ensure `BARGAINB_API_KEY` is valid and not expired
3. **Test Assistant ID**: Confirm `BARGAINB_ASSISTANT_ID` exists in your LangGraph deployment
4. **Network Issues**: Check if your server can reach the LangGraph platform

### Database Errors

**Symptoms**: "Failed to save configuration" or database-related errors

**Solutions**:
1. **Service Role Key**: Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
2. **Migration Status**: Ensure the database migration completed successfully
3. **RLS Policies**: Check that Row Level Security policies allow admin access
4. **Table Existence**: Verify AI tables were created (`ai_interactions`, etc.)

### AI Not Responding

**Symptoms**: `@bb` messages don't trigger AI responses

**Solutions**:
1. **Chat Configuration**: Ensure AI is enabled for the specific chat
2. **Message Format**: Verify messages contain the `@bb` trigger
3. **Browser Console**: Check for JavaScript errors in browser console
4. **Server Logs**: Look at your application logs for backend errors
5. **Supabase Logs**: Check Supabase logs for database operation failures

### Performance Issues

**Symptoms**: Slow AI responses or timeouts

**Solutions**:
1. **Response Timeout**: Increase `AI_RESPONSE_TIMEOUT` environment variable
2. **Database Indexes**: Ensure migration created performance indexes
3. **LangGraph Performance**: Check your LangGraph agent's response times
4. **Network Latency**: Consider geographic proximity to LangGraph servers

## 📈 Monitoring & Analytics

### AI Management Dashboard
- Monitor **total interactions** across all chats
- Track **average response times** for performance optimization
- View **active chats** with AI enabled
- Check **success rates** for reliability monitoring

### Per-Chat Analytics
- See **interaction history** for each conversation
- Monitor **response times** per user
- Track **token usage** for cost analysis
- Identify **popular features** and questions

### Database Views
The migration creates helpful views for analysis:
- `ai_chat_stats`: Statistics per chat
- `recent_ai_activity`: Latest AI interactions
- `ai_usage_analytics`: Daily aggregated metrics

## 🔧 Advanced Configuration

### Custom Response Styles
You can modify the AI behavior by:
1. Updating the `ai_config` JSONB field in `whatsapp_chats`
2. Creating new templates in `ai_config_templates`
3. Adjusting the LangGraph agent configuration

### Auto-Response Keywords
Enable automatic responses (without `@bb`) by:
1. Setting `auto_respond: true` in chat configuration
2. Adding relevant keywords to the `keywords` array
3. Testing with grocery-related questions

### Data Retention
- AI interactions are kept for 30 days by default
- Use the `cleanup_old_ai_interactions()` function for custom retention
- Analytics data is preserved longer for trend analysis

## 🎉 Success!

Your AI integration is now complete! Users can get instant grocery shopping assistance by typing `@bb` in their WhatsApp conversations, while you maintain full control and monitoring through the admin panel.

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the browser console for errors
3. Examine your application and Supabase logs
4. Verify your LangGraph agent is functioning independently

The AI integration enhances your WhatsApp customer service while maintaining the personal touch of human admin oversight. 