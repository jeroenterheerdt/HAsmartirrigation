#!/usr/bin/env python3
"""Demonstration of the Days Between Irrigation feature."""

import asyncio
from datetime import datetime

print("🌱 Smart Irrigation: Days Between Irrigation Feature")
print("=" * 60)
print()

print("This feature allows you to control the minimum number of days")
print("between irrigation events, useful for:")
print("• Water conservation")  
print("• Plant health management")
print("• Compliance with local watering restrictions")
print()

# Simulate a week of irrigation attempts with different settings
async def simulate_irrigation_week(days_between, description):
    """Simulate a week of irrigation with given days_between setting."""
    print(f"📊 {description}")
    print(f"   Setting: {days_between} days between irrigation")
    print("   " + "-" * 40)
    
    days_since_last = 0
    irrigation_events = []
    
    for day in range(7):
        day_name = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day]
        
        # Check if irrigation should fire
        if days_between <= 0:
            # No restriction
            should_fire = True
        else:
            should_fire = days_since_last >= days_between
        
        if should_fire:
            result = "🚿 IRRIGATED"
            irrigation_events.append(day)
            days_since_last = 0
        else:
            result = f"⏳ Skip ({days_since_last}/{days_between} days)"
            
        print(f"   {day_name}: {result}")
        
        # End of day - increment counter if not irrigated
        if not should_fire:
            days_since_last += 1
        
    irrigation_count = len(irrigation_events)
    print(f"   📈 Total irrigation events: {irrigation_count}/7 days")
    print(f"   💧 Water savings: {((7-irrigation_count)/7*100):.0f}% reduction")
    print()
    
    return irrigation_count


async def demonstrate_feature():
    """Demonstrate the days between irrigation feature."""
    print("🔍 DEMONSTRATION: 7-day irrigation simulation")
    print()
    
    scenarios = [
        (0, "Default behavior (no restriction)"),
        (1, "Every other day maximum"),
        (2, "Every 2 days minimum"),
        (3, "Every 3 days minimum"),
        (6, "Once per week maximum"),
    ]
    
    results = []
    for days_between, description in scenarios:
        count = await simulate_irrigation_week(days_between, description)
        results.append((days_between, count))
    
    print("📊 SUMMARY COMPARISON")
    print("-" * 40)
    print("Days Between | Irrigations | Water Savings")
    print("-" * 40)
    baseline = results[0][1]  # Default behavior count
    
    for days_between, count in results:
        savings = ((baseline - count) / baseline * 100) if baseline > 0 else 0
        print(f"{days_between:11d} | {count:11d} | {savings:11.0f}%")
    
    print("-" * 40)
    print()
    
    print("✨ BENEFITS")
    print("• Prevents overwatering")
    print("• Reduces water consumption")
    print("• Ensures adequate drying time between irrigations")
    print("• Helps comply with local watering restrictions")
    print("• Works alongside existing precipitation forecasting")
    print()
    
    print("⚙️  CONFIGURATION")
    print("• Available in Home Assistant integration options")
    print("• Range: 0-365 days (0 = no restriction)")
    print("• Default: 0 (maintains current behavior)")
    print("• Changes take effect immediately")
    print()
    
    print("🎯 REAL-WORLD USAGE EXAMPLES")
    print("• Lawn care: Set to 1-2 days between watering")
    print("• Drought restrictions: Set to 6 for weekly watering")
    print("• Deep-rooted plants: Set to 3-7 days for less frequent watering")
    print("• Water conservation: Set based on local climate and soil conditions")
    print()
    
    print("✅ Feature implementation complete!")
    print("Ready for production use in Home Assistant Smart Irrigation integration.")


if __name__ == "__main__":
    asyncio.run(demonstrate_feature())