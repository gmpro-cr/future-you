#!/usr/bin/env python3
"""
Test persona privacy fix - verify users only see their own personas
"""
from playwright.sync_api import sync_playwright
import time

DEPLOYED_URL = "https://future-you-six.vercel.app"

def test_privacy_fix():
    """Test that two different users only see their own personas"""

    print(f"🔍 Testing Persona Privacy Fix")
    print("=" * 60)

    issues = []

    with sync_playwright() as p:
        # Test with User 1
        print("\n👤 USER 1: Creating persona...")
        browser1 = p.chromium.launch(headless=True)
        context1 = browser1.new_context()  # Fresh context = new guest session
        page1 = context1.new_page()

        # User 1: Go to site and continue as guest
        page1.goto(DEPLOYED_URL, wait_until='networkidle')
        page1.locator('button:has-text("Continue as Guest")').click()
        page1.wait_for_url('**/personas', timeout=10000)
        page1.wait_for_load_state('networkidle')
        time.sleep(2)

        # User 1: Count initial personas
        initial_count_user1 = page1.locator('text=No personas yet').count()
        if initial_count_user1 > 0:
            print("   ✅ User 1 starts with no personas")
        else:
            existing = page1.locator('[class*="persona"]').count()
            print(f"   ⚠️  User 1 sees {existing} personas initially")

        # User 1: Create persona
        page1.locator('button:has-text("Create New Persona")').click()
        time.sleep(1)

        # Fill form
        name_input = page1.locator('input[placeholder*="name" i]').first
        name_input.fill("User 1 Persona")

        prompt_input = page1.locator('textarea').first
        prompt_input.fill("You are User 1's test persona")

        # Submit
        page1.locator('button:has-text("Save Persona")').click()
        page1.wait_for_load_state('networkidle')
        time.sleep(2)

        # Count personas for User 1
        user1_personas = page1.locator('text=User 1 Persona').count()
        print(f"   ✅ User 1 created persona, sees: {user1_personas} persona(s)")

        page1.screenshot(path='/tmp/user1_personas.png', full_page=True)

        # Test with User 2 (completely separate browser context)
        print("\n👤 USER 2: Creating persona...")
        browser2 = p.chromium.launch(headless=True)
        context2 = browser2.new_context()  # Different context = different guest session
        page2 = context2.new_page()

        # User 2: Go to site and continue as guest
        page2.goto(DEPLOYED_URL, wait_until='networkidle')
        page2.locator('button:has-text("Continue as Guest")').click()
        page2.wait_for_url('**/personas', timeout=10000)
        page2.wait_for_load_state('networkidle')
        time.sleep(2)

        # User 2: Check if they see User 1's persona
        user1_visible_to_user2 = page2.locator('text=User 1 Persona').count()
        if user1_visible_to_user2 > 0:
            issues.append("❌ PRIVACY VIOLATION: User 2 can see User 1's persona!")
            print(f"   ❌ User 2 can see User 1's persona (PRIVACY BUG!)")
        else:
            print("   ✅ User 2 cannot see User 1's persona (privacy working!)")

        # User 2: Create their own persona
        page2.locator('button:has-text("Create New Persona")').click()
        time.sleep(1)

        name_input2 = page2.locator('input[placeholder*="name" i]').first
        name_input2.fill("User 2 Persona")

        prompt_input2 = page2.locator('textarea').first
        prompt_input2.fill("You are User 2's test persona")

        page2.locator('button:has-text("Save Persona")').click()
        page2.wait_for_load_state('networkidle')
        time.sleep(2)

        # Count personas for User 2
        user2_personas = page2.locator('text=User 2 Persona').count()
        user1_still_visible = page2.locator('text=User 1 Persona').count()

        print(f"   ✅ User 2 created persona, sees: {user2_personas} persona(s)")

        if user1_still_visible > 0:
            issues.append("❌ User 2 still sees User 1's persona after creating their own")
            print(f"   ❌ User 2 still sees User 1's persona")

        page2.screenshot(path='/tmp/user2_personas.png', full_page=True)

        # Verify User 1 still only sees their own
        print("\n🔄 Verifying User 1's view...")
        page1.reload(wait_until='networkidle')
        time.sleep(2)

        user1_count_final = page1.locator('text=User 1 Persona').count()
        user2_visible_to_user1 = page1.locator('text=User 2 Persona').count()

        print(f"   User 1 sees their persona: {user1_count_final}")
        print(f"   User 1 sees User 2's persona: {user2_visible_to_user1}")

        if user2_visible_to_user1 > 0:
            issues.append("❌ PRIVACY VIOLATION: User 1 can see User 2's persona!")
            print(f"   ❌ Privacy violation!")
        else:
            print("   ✅ User 1 cannot see User 2's persona (privacy working!)")

        # Close browsers
        browser1.close()
        browser2.close()

    # Print summary
    print("\n" + "=" * 60)
    print("📊 PRIVACY TEST SUMMARY")
    print("=" * 60)

    if not issues:
        print("\n✅ ✅ ✅ PRIVACY FIX SUCCESSFUL! ✅ ✅ ✅")
        print("\n✓ User 1 only sees their own persona")
        print("✓ User 2 only sees their own persona")
        print("✓ No cross-user visibility")
        print("\n🎉 The persona privacy issue is FIXED!")
    else:
        print(f"\n❌ Found {len(issues)} privacy issues:\n")
        for i, issue in enumerate(issues, 1):
            print(f"{i}. {issue}")

    print("\n📸 Screenshots saved:")
    print("   - /tmp/user1_personas.png")
    print("   - /tmp/user2_personas.png")

    return issues

if __name__ == "__main__":
    issues = test_privacy_fix()
    exit(0 if len(issues) == 0 else 1)
