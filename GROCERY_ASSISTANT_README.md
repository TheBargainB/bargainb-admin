# Personal Grocery Assistant - Customer Configuration Guide

## Overview

The Personal Grocery Assistant is an AI-powered agent that provides personalized grocery shopping recommendations based on customer preferences stored in your Supabase database. Each customer gets a tailored experience with their dietary restrictions, preferred stores, budget constraints, and shopping persona.

## 🏗️ Architecture

### Multi-Customer Design
- **Single Codebase**: One agent serves multiple customers
- **Runtime Configuration**: Customer preferences loaded dynamically
- **No Hardcoded Data**: All customer info stored in database
- **Scalable**: Can handle thousands of customers

### Database Structure
```
crm_profiles (Customer Preferences)
├── preferred_stores: ["Albert Heijn", "Jumbo"]
├── dietary_restrictions: ["gluten-free", "lactose-intolerant"] 
├── shopping_persona: "healthHero"
├── budget_range: "[80,120]"
├── price_sensitivity: "medium"
├── product_interests: ["organic foods", "fresh vegetables"]
└── shopping_frequency: "weekly"

grocery_lists (Shopping Lists)
├── list_name: "Weekly Groceries"
├── products: [{"name": "Gluten-free bread", "quantity": 1}]
├── estimated_total: 85.50
└── preferred_store: "Albert Heijn"

meal_plans (Meal Planning)
├── meal_date: "2024-12-15"
├── meal_type: "breakfast"
├── recipe_name: "Gluten-free pancakes"
└── estimated_cost: 12.50

budget_periods (Budget Tracking)
├── period_name: "December 2024"
├── total_budget: 400.00
├── spent_amount: 245.30
└── categories: [{"name": "Groceries", "allocated": 280.00}]
```

## 🎯 Customer Personas

The assistant supports different shopping personas:

- **🥗 healthHero**: Health-focused, prefers organic and nutritious options
- **🌱 ecoShopper**: Environmentally conscious, sustainable products
- **💊 sensitiveStomach**: Gentle foods, easy digestion
- **💰 budgetSaver**: Price-conscious, looks for deals
- **⚡ convenienceShopper**: Values quick and easy solutions

## 🛠️ Configuration

### 1. Customer Profile Setup

Create a customer profile in your `crm_profiles` table:

```sql
INSERT INTO crm_profiles (
  id,
  full_name,
  preferred_name,
  email,
  preferred_stores,
  shopping_persona,
  dietary_restrictions,
  budget_range,
  shopping_frequency,
  product_interests,
  price_sensitivity,
  communication_style
) VALUES (
  '4c432d3e-0a15-4272-beda-0d327088d5f6',
  'Sarah Johnson',
  'Sarah',
  'sarah.johnson@example.com',
  ARRAY['Albert Heijn', 'Jumbo'],
  'healthHero',
  ARRAY['gluten-free', 'lactose-intolerant'],
  '[80,120]'::numrange,
  'weekly',
  ARRAY['organic foods', 'fresh vegetables', 'lean proteins'],
  'medium',
  'casual'
);
```

### 2. AI Config Template

The grocery assistant uses this AI config template:

```json
{
  "assistant_type": "grocery_assistant",
  "system_prompt": "You are a personal grocery shopping assistant...",
  "use_customer_profile": true,
  "profile_fields": [
    "preferred_stores",
    "dietary_restrictions", 
    "shopping_persona",
    "budget_range",
    "price_sensitivity",
    "product_interests",
    "shopping_frequency"
  ],
  "capabilities": [
    "meal_planning",
    "grocery_list_creation", 
    "budget_optimization",
    "store_recommendations",
    "dietary_compliance"
  ]
}
```

### 3. Runtime Configuration

When creating an assistant instance from your admin panel:

```python
# Configuration passed to the agent
config = {
    "configurable": {
        "customer_profile_id": "4c432d3e-0a15-4272-beda-0d327088d5f6",
        "user_id": "sarah_session_001",
        "thread_id": "grocery_conversation_123"
    }
}

# Invoke the assistant
response = await graph.ainvoke(
    {"messages": [{"role": "user", "content": "I need healthy breakfast ideas"}]},
    config=config
)
```

## 🤖 How It Works

### 1. Customer Profile Loading
When a conversation starts, the assistant:
- Extracts `customer_profile_id` from the runtime config
- Loads customer preferences from the database
- Formats personalized context for the AI

### 2. Personalized Responses
The assistant considers:
- **Dietary restrictions**: Suggests gluten-free options for Sarah
- **Preferred stores**: Recommends Albert Heijn and Jumbo
- **Shopping persona**: Focuses on healthy, organic options
- **Budget constraints**: Stays within €80-120 range
- **Communication style**: Uses casual, friendly tone

### 3. Memory Integration
The assistant remembers:
- Previous grocery lists and shopping patterns
- Meal plans and recipe preferences
- Budget tracking and spending habits
- Product likes and dislikes

## 💡 Example Interactions

### Scenario 1: Breakfast Recommendations
**User**: "I need healthy breakfast ideas"

**Assistant Response** (considers Sarah's profile):
```
Hi Sarah! 🌅 Since you're focused on healthy eating and have gluten-free and lactose-intolerant restrictions, here are some great breakfast ideas:

🥣 **Gluten-Free Options:**
• Gluten-free oatmeal with fresh berries (€3.50 at Albert Heijn)
• Rice cakes with almond butter (€4.20 at Jumbo)
• Quinoa breakfast bowl with nuts (€5.80)

🥛 **Lactose-Free Dairy:**
• Oat milk for smoothies (€2.15 at Albert Heijn)
• Lactose-free yogurt with granola (€3.45)

💰 **Budget-Friendly**: All options fit within your €80-120 weekly budget!

Would you like me to create a shopping list for these items? I can check prices at both Albert Heijn and Jumbo for you! 🛒
```

### Scenario 2: Meal Planning
**User**: "Plan my meals for this week"

**Assistant Response** (considers preferences and budget):
```
Perfect! Let me create a healthy meal plan for you, Sarah! 🍽️

**This Week's Meal Plan** (Budget: €95 of your €80-120 range)

**Monday:**
• Breakfast: Gluten-free pancakes with berries (€4.50)
• Lunch: Quinoa salad with grilled chicken (€6.20)
• Dinner: Baked salmon with roasted vegetables (€8.30)

**Tuesday:**
• Breakfast: Smoothie bowl with oat milk (€3.80)
• Lunch: Lettuce wraps with turkey (€5.60)
• Dinner: Stir-fry with rice noodles (€7.20)

🛒 **Shopping List Created!**
I'll organize items by store:
• Albert Heijn: Fresh produce, gluten-free products
• Jumbo: Proteins and pantry staples

Would you like me to add this to your grocery list? 📝
```

## 🧪 Testing

Run the test suite to see the assistant in action:

```bash
python test_grocery_assistant.py
```

The test script demonstrates:
- Customer profile loading
- Personalized recommendations
- Multi-customer usage patterns
- Runtime configuration examples

## 📊 Admin Panel Integration

### Customer Creation Flow
1. **Create Customer Profile**: Add customer to `crm_profiles` table
2. **Set Preferences**: Configure dietary restrictions, stores, persona
3. **Generate Assistant**: Create assistant instance with profile ID
4. **Runtime Config**: Pass `customer_profile_id` in configurable parameters

### Example Admin Panel Code
```python
# Create new customer assistant
def create_customer_assistant(customer_data):
    # 1. Create CRM profile
    profile_id = create_crm_profile(customer_data)
    
    # 2. Create assistant configuration
    config = {
        "configurable": {
            "customer_profile_id": profile_id,
            "user_id": customer_data["user_id"],
            "thread_id": f"session_{profile_id[:8]}"
        }
    }
    
    # 3. Initialize assistant
    return initialize_grocery_assistant(config)

# Update customer preferences
def update_customer_preferences(profile_id, updates):
    # Update CRM profile in database
    update_crm_profile(profile_id, updates)
    
    # Assistant automatically picks up changes on next conversation
    return {"status": "preferences_updated"}
```

## 🔧 Configuration Options

### config.yaml Settings
```yaml
# Agent Configuration
agent:
  name: "Personal Grocery Assistant"
  crm_profile_id: null  # Always null - configured at runtime
  max_response_length: 2000
  validate_profile: false  # Set to true in production

# Grocery Assistant Features
grocery_assistant:
  supported_personas:
    - healthHero: "Health-focused, organic options"
    - ecoShopper: "Environmentally conscious"
    - sensitiveStomach: "Gentle, easy-to-digest foods"
    - budgetSaver: "Price-conscious shopping"
    - convenienceShopper: "Quick, easy solutions"
  
  default_stores:
    - "Albert Heijn"
    - "Jumbo"
    - "Dirk"
```

## 🚀 Benefits

### For Customers
- **Personalized Experience**: Tailored to individual preferences
- **Dietary Compliance**: Respects restrictions and allergies
- **Budget Management**: Helps stay within spending limits
- **Store Optimization**: Suggests best stores for their needs
- **Memory**: Remembers preferences and shopping history

### For Business
- **Scalable**: Single codebase serves unlimited customers
- **Efficient**: No code changes needed for new customers
- **Data-Driven**: Rich customer insights and behavior tracking
- **Flexible**: Easy to add new features and preferences
- **Cost-Effective**: Shared infrastructure across all customers

## 🔐 Security & Privacy

- **Profile Isolation**: Each customer only sees their own data
- **Runtime Validation**: Profile IDs validated at runtime
- **Data Encryption**: All customer data encrypted in database
- **Access Control**: Only authorized admin panel access
- **Audit Trail**: All interactions logged for compliance

## ⚠️ Error Handling & Validation

### Profile Not Found
```python
# When customer_profile_id doesn't exist in database
{
  "error": "customer_profile_not_found",
  "message": "Customer profile ID not found in database",
  "fallback": "Uses generic grocery assistant without personalization"
}
```

### Missing Configuration
```python
# When customer_profile_id not provided in runtime config
{
  "error": "missing_customer_profile_id", 
  "message": "No customer_profile_id provided in configurable parameters",
  "behavior": "Assistant will request customer identification"
}
```

### Database Connection Issues
```python
# Handle Supabase connection failures gracefully
try:
    profile = memory_manager.get_user_profile()
except Exception as e:
    # Fallback to basic assistant without personalization
    logger.warning(f"Profile loading failed: {e}")
    profile = None
```

### Validation Examples
```python
def validate_customer_profile(profile_data):
    """Validate customer profile data before saving"""
    required_fields = ['preferred_name', 'email']
    optional_fields = ['dietary_restrictions', 'preferred_stores', 'shopping_persona']
    
    # Validate required fields
    for field in required_fields:
        if not profile_data.get(field):
            raise ValueError(f"Missing required field: {field}")
    
    # Validate dietary restrictions format
    if 'dietary_restrictions' in profile_data:
        valid_restrictions = ['gluten-free', 'lactose-intolerant', 'vegan', 'vegetarian', 'nut-free']
        invalid = [r for r in profile_data['dietary_restrictions'] if r not in valid_restrictions]
        if invalid:
            raise ValueError(f"Invalid dietary restrictions: {invalid}")
    
    return True
```

## 🎯 Next Steps

1. **Test the Configuration**: Run `test_grocery_assistant.py`
2. **Create Sample Customers**: Add more profiles to test with
3. **Integrate with Admin Panel**: Use the configuration patterns
4. **Monitor Performance**: Track response times and accuracy
5. **Gather Feedback**: Collect customer satisfaction data

---

**Ready to launch your personalized grocery assistant!** 🛒🤖

The architecture is designed to scale and provides a rich, personalized experience for every customer while maintaining a single, maintainable codebase. 