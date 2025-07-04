#!/usr/bin/env python3
"""
Test script for the Personal Grocery Assistant with customer configuration.

This script demonstrates how to use the grocery assistant with customer preferences
loaded from the database at runtime.
"""

import sys
import os
import asyncio
import json
from datetime import datetime
from typing import Dict, Any

# Add the src directory to the path - more robust approach
current_dir = os.path.dirname(os.path.abspath(__file__))
src_path = os.path.join(current_dir, 'src')
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from agent.graph import create_enhanced_agent_graph
from agent.config import get_config

def validate_test_environment():
    """Validate that all required environment variables are set"""
    required_vars = ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_ANON_KEY"]
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        raise EnvironmentError(f"Missing environment variables: {missing}")
    print("✅ Environment validation passed")

def validate_response_content(response_content: str, scenario: Dict[str, str]) -> bool:
    """Validate response content based on scenario expectations"""
    response_lower = response_content.lower()
    
    validation_results = []
    
    if scenario["name"] == "Check Customer Profile Loading":
        # Should mention customer name or personalized greeting
        has_personalization = any(term in response_lower for term in ["sarah", "hi", "hello"])
        validation_results.append(("Personalization", has_personalization))
        
    elif scenario["name"] == "Dietary Restriction Awareness":
        # Should mention gluten-free alternatives
        has_gluten_free = "gluten" in response_lower and "free" in response_lower
        validation_results.append(("Gluten-free awareness", has_gluten_free))
        
    elif scenario["name"] == "Store Preference Recognition":
        # Should mention preferred stores
        has_preferred_stores = any(store.lower() in response_lower for store in ["albert heijn", "jumbo"])
        validation_results.append(("Store preferences", has_preferred_stores))
        
    elif scenario["name"] == "Budget Awareness":
        # Should mention budget or pricing
        has_budget_awareness = any(term in response_lower for term in ["budget", "€", "euro", "cost", "price"])
        validation_results.append(("Budget awareness", has_budget_awareness))
        
    elif scenario["name"] == "Shopping Persona Application":
        # Should suggest healthy options for healthHero persona
        has_healthy_focus = any(term in response_lower for term in ["healthy", "organic", "nutritious", "fresh"])
        validation_results.append(("Health focus", has_healthy_focus))
    
    # Print validation results
    for check_name, passed in validation_results:
        status = "✅" if passed else "❌"
        print(f"   {status} {check_name}: {passed}")
    
    return all(result[1] for result in validation_results)

async def test_grocery_assistant():
    """Test the grocery assistant with customer configuration"""
    
    print("🛒 Testing Personal Grocery Assistant")
    print("=" * 50)
    
    try:
        validate_test_environment()
    except EnvironmentError as e:
        print(f"❌ Environment Error: {e}")
        return
    
    try:
        # Get the agent graph
        graph = create_enhanced_agent_graph()
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("Make sure the agent modules are available in the src directory")
        return
    
    # Customer configuration - this is how you'd configure it from your admin panel
    customer_config = {
        "configurable": {
            "customer_profile_id": "4c432d3e-0a15-4272-beda-0d327088d5f6",  # Sarah Johnson
            "user_id": "sarah_test_session",
            "thread_id": "grocery_session_001"
        }
    }
    
    print("👤 Customer Configuration:")
    print(f"   Profile ID: {customer_config['configurable']['customer_profile_id']}")
    print(f"   User ID: {customer_config['configurable']['user_id']}")
    print()
    
    # Test scenarios
    test_scenarios = [
        {
            "name": "Check Customer Profile Loading",
            "message": "Hi! I'm looking for some healthy breakfast options. What do you recommend?",
            "expected": "Should load Sarah's profile (gluten-free, lactose-intolerant, health-focused)"
        },
        {
            "name": "Dietary Restriction Awareness",
            "message": "I want to make pancakes for breakfast. Can you suggest ingredients?",
            "expected": "Should recommend gluten-free flour and lactose-free milk"
        },
        {
            "name": "Store Preference Recognition",
            "message": "Where should I shop for organic vegetables?",
            "expected": "Should recommend Albert Heijn or Jumbo (Sarah's preferred stores)"
        },
        {
            "name": "Budget Awareness",
            "message": "I need to plan my weekly grocery shopping with a budget of €100",
            "expected": "Should respect the €80-120 budget range from profile"
        },
        {
            "name": "Shopping Persona Application",
            "message": "What snacks would you recommend for me?",
            "expected": "Should suggest healthy options (healthHero persona)"
        }
    ]
    
    print("🧪 Running Test Scenarios:")
    print()
    
    test_results = []
    
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"Test {i}: {scenario['name']}")
        print(f"Message: {scenario['message']}")
        print(f"Expected: {scenario['expected']}")
        print("-" * 40)
        
        try:
            # Run the assistant
            result = await graph.ainvoke(
                {"messages": [{"role": "user", "content": scenario['message']}]},
                config=customer_config
            )
            
            # Extract the response
            if result and 'messages' in result:
                last_message = result['messages'][-1]
                response_content = last_message.content if hasattr(last_message, 'content') else str(last_message)
                
                print("🤖 Assistant Response:")
                print(f"   {response_content[:200]}...")
                print()
                
                # Validate response
                print("🔍 Response Validation:")
                validation_passed = validate_response_content(response_content, scenario)
                test_results.append((scenario['name'], validation_passed))
                print()
                
            else:
                print("❌ No response received")
                test_results.append((scenario['name'], False))
                print()
                
        except Exception as e:
            print(f"❌ Error: {e}")
            test_results.append((scenario['name'], False))
            print()
    
    # Print test summary
    print("📊 Test Summary:")
    print("=" * 30)
    passed_tests = sum(1 for _, passed in test_results if passed)
    total_tests = len(test_results)
    
    for test_name, passed in test_results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {status}: {test_name}")
    
    print()
    print(f"Overall Result: {passed_tests}/{total_tests} tests passed")
    print("✅ Test completed!")


def test_customer_profile_loading():
    """Test loading customer profiles from the database"""
    
    print("📊 Testing Customer Profile Loading")
    print("=" * 50)
    
    from agent.supabase_client import SupabaseClient
    from agent.memory_tools import SupabaseMemoryManager
    from langchain_openai import ChatOpenAI
    
    # Initialize components
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    supabase_client = SupabaseClient()
    
    # Test with customer profile ID
    customer_profile_id = "4c432d3e-0a15-4272-beda-0d327088d5f6"
    memory_manager = SupabaseMemoryManager(model, supabase_client, customer_profile_id)
    
    print(f"👤 Loading profile for: {customer_profile_id}")
    print()
    
    # Test profile loading
    profile = memory_manager.get_user_profile()
    if profile:
        print("✅ Profile loaded successfully:")
        print(f"   Name: {profile.get('preferred_name', 'N/A')}")
        print(f"   Stores: {', '.join(profile.get('preferred_stores', []))}")
        print(f"   Dietary: {', '.join(profile.get('dietary_restrictions', []))}")
        print(f"   Persona: {profile.get('shopping_persona', 'N/A')}")
        print(f"   Budget: {profile.get('budget_range', 'N/A')}")
        print()
    else:
        print("❌ Failed to load profile")
        print()
    
    # Test grocery assistant context
    print("🛒 Grocery Assistant Context:")
    print("-" * 30)
    context = memory_manager.get_grocery_assistant_context()
    print(context)
    print()
    
    # Test formatted user context
    print("📝 Full User Context:")
    print("-" * 30)
    full_context = memory_manager.format_user_context()
    print(full_context)
    print()


def demonstrate_multi_customer_usage():
    """Demonstrate how the same codebase serves multiple customers"""
    
    print("🏢 Multi-Customer Usage Demonstration")
    print("=" * 50)
    
    # Example of how different customers would be configured
    customers = [
        {
            "name": "Sarah Johnson",
            "profile_id": "4c432d3e-0a15-4272-beda-0d327088d5f6",
            "description": "Health-focused, gluten-free, shops at Albert Heijn"
        },
        {
            "name": "Budget-Conscious Customer",
            "profile_id": "example-uuid-2",
            "description": "Price-sensitive, family shopping, prefers deals"
        },
        {
            "name": "Eco-Friendly Customer", 
            "profile_id": "example-uuid-3",
            "description": "Environmentally conscious, organic foods only"
        }
    ]
    
    print("💡 Runtime Configuration Examples:")
    print()
    
    for customer in customers:
        print(f"Customer: {customer['name']}")
        print(f"Profile: {customer['description']}")
        
        config_example = {
            "configurable": {
                "customer_profile_id": customer["profile_id"],
                "user_id": f"user_{customer['name'].lower().replace(' ', '_')}",
                "thread_id": f"session_{customer['profile_id'][:8]}"
            }
        }
        
        print("Configuration:")
        print(json.dumps(config_example, indent=2))
        print()
    
    print("🔑 Key Benefits:")
    print("• Single codebase serves multiple customers")
    print("• Personalized responses based on customer profile")
    print("• Runtime configuration from admin panel")
    print("• No customer data hardcoded in application")
    print("• Scalable architecture for many customers")
    print()


if __name__ == "__main__":
    print("🛒 Personal Grocery Assistant - Test Suite")
    print("=" * 60)
    print()
    
    # Test 1: Customer profile loading
    test_customer_profile_loading()
    
    # Test 2: Multi-customer demonstration
    demonstrate_multi_customer_usage()
    
    # Test 3: Interactive assistant (async)
    print("🤖 Running Interactive Assistant Test...")
    print("Note: This requires OpenAI API key to be set")
    print()
    
    try:
        asyncio.run(test_grocery_assistant())
    except KeyboardInterrupt:
        print("\n👋 Test interrupted by user")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("Make sure all environment variables are set:")
        print("- OPENAI_API_KEY")
        print("- SUPABASE_URL") 
        print("- SUPABASE_ANON_KEY") 