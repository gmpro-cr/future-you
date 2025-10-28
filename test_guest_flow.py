#!/usr/bin/env python3
"""
Test the guest flow on deployed Esperit site
"""
from playwright.sync_api import sync_playwright
import time

DEPLOYED_URL = "https://future-you-six.vercel.app"

def test_guest_flow():
    """Test clicking Continue as Guest and reaching personas page"""

    issues = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print(f"🔍 Testing guest flow on: {DEPLOYED_URL}")
        print("=" * 60)

        # Step 1: Load homepage
        print("\n1. Loading homepage...")
        page.goto(DEPLOYED_URL, wait_until='networkidle')
        page.screenshot(path='/tmp/step1_homepage.png')
        print(f"✅ URL: {page.url}")
        print(f"✅ Title: {page.title()}")

        # Step 2: Find and click "Continue as Guest" button
        print("\n2. Clicking 'Continue as Guest' button...")
        try:
            # Wait for button to be visible
            guest_button = page.locator('button:has-text("Continue as Guest")')
            guest_button.wait_for(state='visible', timeout=5000)

            print(f"   Found button: {guest_button.text_content()}")

            # Click and wait for navigation
            with page.expect_navigation(timeout=10000):
                guest_button.click()

            # Wait a bit for page to settle
            page.wait_for_load_state('networkidle')
            time.sleep(2)

            print(f"✅ Navigated to: {page.url}")
            page.screenshot(path='/tmp/step2_after_click.png')

        except Exception as e:
            issues.append(f"❌ Failed to click guest button: {str(e)}")
            print(f"❌ Error: {e}")
            page.screenshot(path='/tmp/step2_error.png')

        # Step 3: Check if we're on personas page
        print("\n3. Checking current page...")
        current_url = page.url
        print(f"   Current URL: {current_url}")

        if '/personas' in current_url:
            print("✅ Successfully reached /personas page")
        elif current_url == DEPLOYED_URL or current_url == f"{DEPLOYED_URL}/":
            issues.append("❌ Still on homepage - guest login didn't work")
            print("❌ Still on homepage")
        else:
            print(f"⚠️  On unexpected page: {current_url}")

        # Step 4: Check page content
        print("\n4. Checking page content...")
        page_content = page.content()

        # Check for persona-related content
        if 'Your Personas' in page_content or 'Create New Persona' in page_content:
            print("✅ Found persona-related content")
        else:
            issues.append("❌ No persona content found on page")
            print("❌ No persona content visible")

        # Check for Create button
        create_button = page.locator('button:has-text("Create New Persona")')
        if create_button.count() > 0:
            print("✅ Found 'Create New Persona' button")
        else:
            issues.append("❌ 'Create New Persona' button not found")
            print("❌ No create button")

        # Step 5: Take final screenshot
        page.screenshot(path='/tmp/step3_final_state.png', full_page=True)

        # Step 6: Check localStorage for session
        print("\n5. Checking localStorage...")
        try:
            local_storage = page.evaluate('() => JSON.stringify(localStorage)')
            print(f"   localStorage content: {local_storage[:200]}...")

            if 'esperit_user' in local_storage or 'userId' in local_storage:
                print("✅ User session found in localStorage")
            else:
                issues.append("⚠️  No user session in localStorage")
                print("⚠️  No session data found")
        except Exception as e:
            print(f"⚠️  Could not read localStorage: {e}")

        browser.close()

    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)

    if not issues:
        print("✅ All tests passed! Guest flow works correctly.")
    else:
        print(f"\n⚠️  Found {len(issues)} issues:\n")
        for i, issue in enumerate(issues, 1):
            print(f"{i}. {issue}")

    print("\n📸 Screenshots saved:")
    print("   - /tmp/step1_homepage.png")
    print("   - /tmp/step2_after_click.png")
    print("   - /tmp/step3_final_state.png")

    return issues

if __name__ == "__main__":
    issues = test_guest_flow()
    exit(0 if len(issues) == 0 else 1)
