# 🚀 Comprehensive Agent Runtime Configuration Guide

## Overview
The BargainB grocery assistant supports **comprehensive dynamic configuration** to provide personalized experiences across different messaging platforms. This guide explains all available configuration options including dietary preferences, store preferences, custom instructions, and much more.

## 🔧 Complete Runtime Configuration Structure

### Full Configuration Schema
```json
{
  "config": {
    "configurable": {
      // === CORE IDENTIFICATION ===
      "customer_name": "Customer Name",
      "instance_name": "Grocery Assistant",
      "user_id": "unique_user_id",
      "customer_profile_id": "uuid-from-crm-system",
      
      // === PLATFORM FORMATTING ===
      "source": "whatsapp",           // Platform: "whatsapp", "telegram", "general"
      
      // === LANGUAGE SETTINGS ===
      "primary_language": "english",
      "language_enforcement": "flexible",
      "fallback_language": "english",
      "translation_enabled": true,
      "cultural_context": "middle_east",
      
      // === CUSTOMER PREFERENCES ===
      "dietary_restrictions": ["lactose_intolerant", "vegetarian", "nut_allergy"],
      "preferred_stores": ["Albert Heijn", "Jumbo"],
      "shopping_persona": "busy_professional",
      "budget_range": "medium",
      "price_sensitivity": "high",
      "default_currency": "EUR",
      "shopping_frequency": "weekly",
      
      // === AGENT BEHAVIOR ===
      "enable_memory_updates": true,
      "memory_update_threshold": 0.7,
      "enable_pricing_data": true,
      "price_comparison_enabled": true,
      "enable_personalized_recommendations": true,
      "consider_dietary_restrictions": true,
      "consider_budget_constraints": true,
      "suggest_alternatives": true,
      "include_price_estimates": true,
      "suggest_recipes_for_ingredients": true,
      "default_search_limit": 10,
      
      // === RESPONSE CONFIGURATION ===
      "max_response_length": 2000,
      "response_style": "helpful_and_practical",
      "use_emojis": true,
      "include_tips": true,
      
      // === CUSTOM INSTRUCTIONS ===
      "custom_instructions": "Always suggest meal prep options for busy professionals",
      "system_prompt_additions": "Be extra helpful with budget-friendly options",
      
      // === FEATURE TOGGLES ===
      "enable_meal_planning": true,
      "enable_grocery_lists": true,
      "enable_budget_tracking": true,
      "enable_recipe_suggestions": true,
      "enable_cross_thread_memory": true,
      
      // === PERFORMANCE SETTINGS ===
      "cache_enabled": true,
      "cache_duration_minutes": 30,
      "validate_all_operations": true,
      "graceful_degradation": true,
      
      // === GUARD RAILS ===
      "rate_limiting_enabled": true,
      "max_requests_per_minute": 30,
      "content_safety_enabled": true,
      "cost_controls_enabled": true,
      "max_tokens_per_request": 4000
    }
  }
}
```

## 📋 Configuration Categories

### 1. Core Identification
**Required for all deployments**
```json
{
  "customer_name": "John Doe",
  "instance_name": "John's Grocery Assistant",
  "user_id": "user_12345",
  "customer_profile_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. Platform Formatting
**Controls message formatting per platform**
```json
{
  "source": "whatsapp"  // "whatsapp", "telegram", "general"
}
```

### 3. Language & Cultural Settings
**Comprehensive language configuration**
```json
{
  "primary_language": "arabic",
  "language_enforcement": "strict",
  "fallback_language": "english",
  "translation_enabled": true,
  "cultural_context": "middle_east"
}
```

### 4. Customer Preferences
**Personalization settings**
```json
{
  "dietary_restrictions": [
    "lactose_intolerant",
    "vegetarian", 
    "nut_allergy",
    "gluten_free",
    "vegan",
    "keto",
    "halal",
    "kosher"
  ],
  "preferred_stores": [
    "Albert Heijn",
    "Jumbo", 
    "Dirk",
    "Lidl",
    "Aldi"
  ],
  "shopping_persona": "busy_professional",  // "budget_conscious", "health_focused", "family_oriented"
  "budget_range": "medium",  // "low", "medium", "high"
  "price_sensitivity": "high",  // "low", "medium", "high"
  "default_currency": "EUR",
  "shopping_frequency": "weekly"  // "daily", "weekly", "monthly"
}
```

### 5. Agent Behavior
**Core AI behavior settings**
```json
{
  "enable_memory_updates": true,
  "memory_update_threshold": 0.7,
  "enable_pricing_data": true,
  "price_comparison_enabled": true,
  "enable_personalized_recommendations": true,
  "consider_dietary_restrictions": true,
  "consider_budget_constraints": true,
  "suggest_alternatives": true,
  "include_price_estimates": true,
  "suggest_recipes_for_ingredients": true,
  "default_search_limit": 10
}
```

### 6. Response Configuration
**Control response style and format**
```json
{
  "max_response_length": 2000,
  "response_style": "helpful_and_practical",  // "concise", "detailed", "friendly"
  "use_emojis": true,
  "include_tips": true
}
```

### 7. Custom Instructions
**Override default behavior**
```json
{
  "custom_instructions": "Always suggest meal prep options for busy professionals",
  "system_prompt_additions": "Be extra helpful with budget-friendly options"
}
```

### 8. Feature Toggles
**Enable/disable specific capabilities**
```json
{
  "enable_meal_planning": true,
  "enable_grocery_lists": true,
  "enable_budget_tracking": true,
  "enable_recipe_suggestions": true,
  "enable_cross_thread_memory": true
}
```

### 9. Performance Settings
**Optimization configuration**
```json
{
  "cache_enabled": true,
  "cache_duration_minutes": 30,
  "validate_all_operations": true,
  "graceful_degradation": true
}
```

### 10. Guard Rails
**Safety and rate limiting**
```json
{
  "rate_limiting_enabled": true,
  "max_requests_per_minute": 30,
  "content_safety_enabled": true,
  "cost_controls_enabled": true,
  "max_tokens_per_request": 4000
}
```

## 🌐 Platform-Specific Examples

### WhatsApp - Health-Focused Family
```json
{
  "config": {
    "configurable": {
      "source": "whatsapp",
      "customer_name": "Sarah Johnson",
      "instance_name": "Sarah's Family Grocery Assistant",
      "user_id": "sarah_whatsapp_123",
      "customer_profile_id": "550e8400-e29b-41d4-a716-446655440001",
      "dietary_restrictions": ["gluten_free", "nut_allergy"],
      "preferred_stores": ["Albert Heijn", "Jumbo"],
      "shopping_persona": "health_focused",
      "budget_range": "medium",
      "price_sensitivity": "medium",
      "shopping_frequency": "weekly",
      "custom_instructions": "Always suggest family-friendly healthy options",
      "enable_meal_planning": true,
      "max_response_length": 1500,
      "response_style": "friendly"
    }
  }
}
```

### Telegram - Budget-Conscious Student
```json
{
  "config": {
    "configurable": {
      "source": "telegram",
      "customer_name": "Ahmed Al-Rashid",
      "instance_name": "Ahmed's Budget Grocery Assistant",
      "user_id": "ahmed_telegram_456",
      "customer_profile_id": "550e8400-e29b-41d4-a716-446655440002",
      "primary_language": "arabic",
      "language_enforcement": "flexible",
      "cultural_context": "middle_east",
      "dietary_restrictions": ["halal"],
      "preferred_stores": ["Lidl", "Aldi"],
      "shopping_persona": "budget_conscious",
      "budget_range": "low",
      "price_sensitivity": "high",
      "shopping_frequency": "weekly",
      "custom_instructions": "Always prioritize cheapest options and bulk buying",
      "enable_budget_tracking": true,
      "max_response_length": 1000,
      "response_style": "concise"
    }
  }
}
```

### General - Busy Professional
```json
{
  "config": {
    "configurable": {
      "source": "general",
      "customer_name": "Maria Rodriguez",
      "instance_name": "Maria's Quick Grocery Assistant",
      "user_id": "maria_web_789",
      "customer_profile_id": "550e8400-e29b-41d4-a716-446655440003",
      "primary_language": "spanish",
      "language_enforcement": "strict",
      "dietary_restrictions": ["vegetarian"],
      "preferred_stores": ["Albert Heijn"],
      "shopping_persona": "busy_professional",
      "budget_range": "high",
      "price_sensitivity": "low",
      "shopping_frequency": "weekly",
      "custom_instructions": "Always suggest quick meal prep options and time-saving tips",
      "enable_meal_planning": true,
      "suggest_recipes_for_ingredients": true,
      "max_response_length": 2000,
      "response_style": "detailed"
    }
  }
}
```

## 🔄 Dynamic Configuration Workflow

### Step 1: Create Assistant with Base Config
```bash
curl https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app/assistants \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_API_KEY' \
  --data '{
    "graph_id": "product_retrieval_agent",
    "name": "Dynamic Grocery Assistant",
    "description": "Comprehensive grocery assistant with full dynamic configuration",
    "config": {
      "configurable": {
        "enable_memory_updates": true,
        "enable_personalized_recommendations": true,
        "graceful_degradation": true
      }
    }
  }'
```

### Step 2: Create Thread with User Context
```bash
curl https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app/threads \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_API_KEY' \
  --data '{
    "metadata": {
      "user_id": "USER_ID_FROM_YOUR_SYSTEM",
      "platform": "whatsapp",
      "customer_name": "CUSTOMER_NAME_FROM_YOUR_SYSTEM",
      "customer_profile_id": "PROFILE_ID_FROM_YOUR_CRM"
    }
  }'
```

### Step 3: Run with Full Dynamic Config
```bash
curl https://ht-ample-carnation-93-62e3a16b2190526eac38c74198169a7f.us.langgraph.app/threads/THREAD_ID/runs \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_API_KEY' \
  --data '{
    "assistant_id": "ASSISTANT_ID",
    "input": {
      "messages": [
        {
          "role": "user",
          "content": "USER_MESSAGE"
        }
      ]
    },
    "config": {
      "configurable": {
        "source": "whatsapp",
        "customer_name": "DYNAMIC_CUSTOMER_NAME",
        "instance_name": "DYNAMIC_INSTANCE_NAME",
        "user_id": "DYNAMIC_USER_ID",
        "customer_profile_id": "DYNAMIC_PROFILE_ID",
        "dietary_restrictions": ["DIETARY_RESTRICTIONS_FROM_CRM"],
        "preferred_stores": ["PREFERRED_STORES_FROM_CRM"],
        "shopping_persona": "PERSONA_FROM_CRM",
        "budget_range": "BUDGET_FROM_CRM",
        "custom_instructions": "CUSTOM_INSTRUCTIONS_FROM_CRM"
      }
    }
  }'
```

## 📊 Configuration Examples by Use Case

### 1. Health-Focused Family
- **Dietary restrictions**: gluten_free, nut_allergy
- **Shopping persona**: health_focused
- **Custom instructions**: "Always suggest organic and wholesome options"
- **Enable features**: meal_planning, recipe_suggestions

### 2. Budget-Conscious Student
- **Budget range**: low
- **Price sensitivity**: high
- **Shopping persona**: budget_conscious
- **Custom instructions**: "Always prioritize cheapest options and bulk buying"
- **Enable features**: budget_tracking, price_comparison

### 3. Busy Professional
- **Shopping persona**: busy_professional
- **Budget range**: high
- **Price sensitivity**: low
- **Custom instructions**: "Always suggest quick meal prep and time-saving options"
- **Enable features**: meal_planning, quick_recipes

### 4. International Customer
- **Primary language**: arabic
- **Language enforcement**: strict
- **Cultural context**: middle_east
- **Dietary restrictions**: halal
- **Custom instructions**: "Provide culturally appropriate meal suggestions"

## 🚀 Integration Best Practices

### 1. CRM Integration
- Pull customer preferences from your CRM system
- Map CRM fields to configuration parameters
- Update configuration based on customer behavior

### 2. Platform Detection
- Automatically detect platform from webhook source
- Apply appropriate formatting rules
- Optimize response length per platform

### 3. Performance Optimization
- Cache customer configurations
- Use default values for missing parameters
- Enable graceful degradation for errors

### 4. A/B Testing
- Test different configuration combinations
- Monitor response quality and engagement
- Adjust configuration based on results

## 🔍 Configuration Validation

### Required Parameters
- `customer_name` (string)
- `user_id` (string)
- `source` (string: whatsapp/telegram/general)

### Optional Parameters
- All other parameters have sensible defaults
- Missing parameters won't cause errors
- System will gracefully handle invalid values

## 💡 Advanced Configuration Tips

### 1. Conditional Logic
```json
{
  "dietary_restrictions": ["vegetarian"],
  "suggest_recipes_for_ingredients": true,
  "custom_instructions": "Always suggest plant-based alternatives"
}
```

### 2. Multi-Language Support
```json
{
  "primary_language": "arabic",
  "language_enforcement": "flexible",
  "fallback_language": "english",
  "translation_enabled": true
}
```

### 3. Performance Tuning
```json
{
  "cache_enabled": true,
  "cache_duration_minutes": 60,
  "max_response_length": 1500,
  "default_search_limit": 8
}
```

### 4. Safety Configuration
```json
{
  "rate_limiting_enabled": true,
  "max_requests_per_minute": 20,
  "content_safety_enabled": true,
  "graceful_degradation": true
}
```

This comprehensive configuration system allows you to create highly personalized grocery assistant experiences that adapt to each customer's specific needs, preferences, and constraints while maintaining optimal performance and safety across all platforms. 