#!/usr/bin/env python3
"""
Test script for Esperit deployed website
Tests the deployed site at https://future-you-six.vercel.app
"""
from playwright.sync_api import sync_playwright
import json
import time

DEPLOYED_URL = "https://future-you-six.vercel.app"

def test_esperit_deployment():
    """Test the deployed Esperit website and identify issues"""

    issues = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print(f"🔍 Testing deployed site: {DEPLOYED_URL}")
        print("=" * 60)

        # Test 1: Homepage loads
        print("\n1. Testing homepage load...")
        try:
            response = page.goto(DEPLOYED_URL, wait_until='networkidle', timeout=30000)
            if response.status != 200:
                issues.append(f"❌ Homepage HTTP {response.status} (expected 200)")
            else:
                print("✅ Homepage loads successfully (HTTP 200)")

            # Take screenshot
            page.screenshot(path='/tmp/esperit_homepage.png', full_page=True)
            print("📸 Screenshot saved: /tmp/esperit_homepage.png")
        except Exception as e:
            issues.append(f"❌ Homepage failed to load: {str(e)}")
            print(f"❌ Error loading homepage: {e}")

        # Test 2: Check for console errors
        print("\n2. Checking browser console for errors...")
        console_errors = []
        console_warnings = []

        def handle_console(msg):
            if msg.type == 'error':
                console_errors.append(msg.text)
            elif msg.type == 'warning':
                console_warnings.append(msg.text)

        page.on('console', handle_console)

        # Reload to catch console messages
        page.reload(wait_until='networkidle')
        time.sleep(2)

        if console_errors:
            issues.append(f"❌ {len(console_errors)} console errors found")
            for error in console_errors[:5]:  # Show first 5
                print(f"  ⚠️  {error}")
        else:
            print("✅ No console errors found")

        if console_warnings:
            print(f"⚠️  {len(console_warnings)} console warnings found")

        # Test 3: Check page title and meta
        print("\n3. Checking page metadata...")
        title = page.title()
        if not title or title == "":
            issues.append("❌ Page title is empty")
        else:
            print(f"✅ Page title: {title}")

        # Test 4: Check for main UI elements
        print("\n4. Checking main UI elements...")

        # Get page content for inspection
        content = page.content()

        # Check for personas
        personas = page.locator('[data-testid*="persona"], .persona-card, [class*="persona"]').count()
        if personas == 0:
            issues.append("❌ No persona elements found on homepage")
            print("❌ No persona elements visible")
        else:
            print(f"✅ Found {personas} persona-related elements")

        # Check for navigation
        nav = page.locator('nav, header').count()
        if nav == 0:
            issues.append("⚠️  No navigation/header found")
            print("⚠️  No navigation found")
        else:
            print(f"✅ Found {nav} navigation elements")

        # Test 5: Check for broken images
        print("\n5. Checking for broken images...")
        images = page.locator('img').all()
        broken_images = 0
        for img in images:
            try:
                src = img.get_attribute('src')
                if src and (src.startswith('http') or src.startswith('/')):
                    # Check if image is visible
                    if not img.is_visible():
                        broken_images += 1
            except:
                broken_images += 1

        if broken_images > 0:
            issues.append(f"⚠️  {broken_images} potentially broken images")
            print(f"⚠️  {broken_images} images may be broken")
        else:
            print(f"✅ All {len(images)} images appear OK")

        # Test 6: Test API health endpoint
        print("\n6. Testing API endpoints...")
        try:
            health_response = page.goto(f"{DEPLOYED_URL}/api/health", wait_until='networkidle')
            if health_response.status == 200:
                print("✅ /api/health endpoint working (HTTP 200)")
            else:
                issues.append(f"❌ /api/health returned HTTP {health_response.status}")
        except Exception as e:
            issues.append(f"❌ /api/health failed: {str(e)}")

        # Test personas endpoint
        try:
            personas_response = page.goto(f"{DEPLOYED_URL}/api/personas", wait_until='networkidle')
            if personas_response.status == 200:
                print("✅ /api/personas endpoint working (HTTP 200)")
                # Try to parse response
                try:
                    personas_data = page.content()
                    print(f"   Personas data received (length: {len(personas_data)} bytes)")
                except:
                    pass
            else:
                issues.append(f"❌ /api/personas returned HTTP {personas_response.status}")
        except Exception as e:
            issues.append(f"❌ /api/personas failed: {str(e)}")

        # Test 7: Navigate back to homepage and test persona selection
        print("\n7. Testing persona selection flow...")
        try:
            page.goto(DEPLOYED_URL, wait_until='networkidle')

            # Look for clickable persona elements
            persona_buttons = page.locator('button, a[href*="persona"], [role="button"]').all()
            clickable_personas = 0
            for btn in persona_buttons:
                if btn.is_visible():
                    clickable_personas += 1

            if clickable_personas == 0:
                issues.append("❌ No clickable persona buttons found")
                print("❌ No clickable personas found")
            else:
                print(f"✅ Found {clickable_personas} clickable elements")

                # Try clicking the first persona
                try:
                    first_persona = page.locator('button, a[href*="persona"]').first
                    if first_persona.is_visible():
                        print("   Attempting to click first persona...")
                        first_persona.click(timeout=5000)
                        page.wait_for_load_state('networkidle', timeout=10000)

                        # Take screenshot of persona page
                        page.screenshot(path='/tmp/esperit_persona_page.png', full_page=True)
                        print("   ✅ Persona navigation successful")
                        print("   📸 Screenshot saved: /tmp/esperit_persona_page.png")
                except Exception as e:
                    issues.append(f"⚠️  Persona click failed: {str(e)}")
                    print(f"   ⚠️  Could not click persona: {e}")

        except Exception as e:
            issues.append(f"❌ Persona selection test failed: {str(e)}")
            print(f"❌ Error testing personas: {e}")

        # Test 8: Mobile responsiveness
        print("\n8. Testing mobile responsiveness...")
        try:
            page.set_viewport_size({"width": 375, "height": 667})  # iPhone size
            page.goto(DEPLOYED_URL, wait_until='networkidle')
            page.screenshot(path='/tmp/esperit_mobile.png', full_page=True)
            print("✅ Mobile viewport test completed")
            print("📸 Mobile screenshot saved: /tmp/esperit_mobile.png")
        except Exception as e:
            issues.append(f"⚠️  Mobile test failed: {str(e)}")

        browser.close()

    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)

    if not issues:
        print("✅ All tests passed! No critical issues found.")
    else:
        print(f"\n⚠️  Found {len(issues)} issues:\n")
        for i, issue in enumerate(issues, 1):
            print(f"{i}. {issue}")

    print("\n📸 Screenshots saved to:")
    print("   - /tmp/esperit_homepage.png")
    print("   - /tmp/esperit_persona_page.png")
    print("   - /tmp/esperit_mobile.png")

    # Save issues to file
    with open('/tmp/esperit_test_results.json', 'w') as f:
        json.dump({
            'url': DEPLOYED_URL,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'issues': issues,
            'total_issues': len(issues)
        }, f, indent=2)

    print("\n📄 Full test results saved to: /tmp/esperit_test_results.json")

    return issues

if __name__ == "__main__":
    issues = test_esperit_deployment()
    exit(0 if len(issues) == 0 else 1)
