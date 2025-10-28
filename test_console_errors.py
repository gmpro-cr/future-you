#!/usr/bin/env python3
"""
Capture console errors from personas page
"""
from playwright.sync_api import sync_playwright
import json

DEPLOYED_URL = "https://future-you-six.vercel.app"

def test_console_errors():
    """Capture all console errors when navigating to personas"""

    console_messages = {
        'errors': [],
        'warnings': [],
        'logs': []
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Set up console listeners
        def handle_console(msg):
            text = msg.text
            msg_type = msg.type

            if msg_type == 'error':
                console_messages['errors'].append({
                    'text': text,
                    'location': msg.location if msg.location else None
                })
                print(f"❌ ERROR: {text}")
                if msg.location:
                    print(f"   Location: {msg.location}")

            elif msg_type == 'warning':
                console_messages['warnings'].append(text)
                print(f"⚠️  WARNING: {text}")

            elif msg_type == 'log':
                console_messages['logs'].append(text)

        page.on('console', handle_console)

        # Also capture page errors
        def handle_page_error(error):
            print(f"🔴 PAGE ERROR: {error}")
            console_messages['errors'].append({
                'text': str(error),
                'type': 'uncaught_exception'
            })

        page.on('pageerror', handle_page_error)

        print(f"🔍 Capturing console errors from: {DEPLOYED_URL}")
        print("=" * 60)

        # Step 1: Go to homepage
        print("\n1. Loading homepage...")
        page.goto(DEPLOYED_URL, wait_until='networkidle')

        # Step 2: Click Continue as Guest
        print("\n2. Clicking 'Continue as Guest'...")
        guest_button = page.locator('button:has-text("Continue as Guest")')
        guest_button.wait_for(state='visible')
        guest_button.click()

        # Wait for navigation and errors to appear
        page.wait_for_url('**/personas', timeout=10000)
        page.wait_for_load_state('networkidle')

        # Wait a bit more for any async errors
        page.wait_for_timeout(3000)

        print(f"\n3. Current URL: {page.url}")

        browser.close()

    # Print summary
    print("\n" + "=" * 60)
    print("📊 CONSOLE ERROR SUMMARY")
    print("=" * 60)

    if console_messages['errors']:
        print(f"\n❌ Found {len(console_messages['errors'])} errors:\n")
        for i, error in enumerate(console_messages['errors'], 1):
            print(f"{i}. {error['text']}")
            if error.get('location'):
                print(f"   {error['location']}")
    else:
        print("\n✅ No console errors found")

    if console_messages['warnings']:
        print(f"\n⚠️  Found {len(console_messages['warnings'])} warnings")

    # Save to file
    with open('/tmp/console_errors.json', 'w') as f:
        json.dump(console_messages, f, indent=2)

    print("\n📄 Full console log saved to: /tmp/console_errors.json")

    return console_messages

if __name__ == "__main__":
    errors = test_console_errors()
    exit(0 if len(errors['errors']) == 0 else 1)
