#!/usr/bin/env python3
"""
Test persona creation and chat functionality
"""
from playwright.sync_api import sync_playwright
import time

DEPLOYED_URL = "https://future-you-six.vercel.app"

def test_persona_and_chat():
    """Test creating a persona and using chat"""

    issues = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Visible browser for debugging
        page = browser.new_page()

        # Capture console messages
        console_errors = []
        def handle_console(msg):
            if msg.type == 'error':
                console_errors.append(msg.text)
                print(f"❌ CONSOLE ERROR: {msg.text}")

        page.on('console', handle_console)

        print(f"🔍 Testing persona creation and chat on: {DEPLOYED_URL}")
        print("=" * 60)

        # Step 1: Go to homepage and continue as guest
        print("\n1. Loading homepage and continuing as guest...")
        page.goto(DEPLOYED_URL, wait_until='networkidle')

        guest_button = page.locator('button:has-text("Continue as Guest")')
        guest_button.click()
        page.wait_for_url('**/personas', timeout=10000)
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        # Step 2: Count personas before creation
        print("\n2. Counting personas before creation...")
        persona_cards = page.locator('.persona-card, [class*="persona"]').count()
        print(f"   Personas visible BEFORE creation: {persona_cards}")

        # Check localStorage
        personas_in_storage = page.evaluate('() => localStorage.getItem("esperit_personas")')
        if personas_in_storage:
            print(f"   localStorage has data: {len(personas_in_storage)} characters")
            # Parse to count
            import json
            try:
                stored_personas = json.loads(personas_in_storage)
                print(f"   Stored personas count: {len(stored_personas) if isinstance(stored_personas, list) else 'N/A'}")
            except:
                pass
        else:
            print("   localStorage: No personas stored")

        page.screenshot(path='/tmp/before_creation.png', full_page=True)

        # Step 3: Click Create New Persona button
        print("\n3. Clicking 'Create New Persona' button...")
        create_button = page.locator('button:has-text("Create New Persona")')
        if create_button.count() > 0:
            create_button.click()
            page.wait_for_load_state('networkidle')
            time.sleep(1)
            print("✅ Create button clicked")
        else:
            issues.append("❌ Create New Persona button not found")
            print("❌ Button not found")

        page.screenshot(path='/tmp/persona_form.png', full_page=True)

        # Step 4: Fill in persona form
        print("\n4. Filling persona form...")

        # Fill name
        name_input = page.locator('input[name="name"], input[placeholder*="name" i]').first
        if name_input.count() > 0:
            name_input.fill("Test Persona")
            print("   ✅ Filled name: Test Persona")
        else:
            issues.append("❌ Name input not found")
            print("   ❌ Name input not found")

        # Fill system prompt
        prompt_input = page.locator('textarea[name="systemPrompt"], textarea[placeholder*="prompt" i]').first
        if prompt_input.count() > 0:
            prompt_input.fill("You are a helpful assistant for testing")
            print("   ✅ Filled system prompt")
        else:
            issues.append("❌ System prompt textarea not found")
            print("   ❌ System prompt not found")

        time.sleep(1)

        # Step 5: Submit form
        print("\n5. Submitting form...")
        submit_button = page.locator('button:has-text("Create"), button:has-text("Save"), button[type="submit"]').first
        if submit_button.count() > 0:
            submit_button.click()
            print("   ✅ Clicked submit")
            page.wait_for_load_state('networkidle')
            time.sleep(2)
        else:
            issues.append("❌ Submit button not found")
            print("   ❌ Submit button not found")

        page.screenshot(path='/tmp/after_creation.png', full_page=True)

        # Step 6: Count personas after creation
        print("\n6. Counting personas after creation...")
        persona_cards_after = page.locator('.persona-card, [class*="persona"]').count()
        print(f"   Personas visible AFTER creation: {persona_cards_after}")

        # Check localStorage again
        personas_in_storage_after = page.evaluate('() => localStorage.getItem("esperit_personas")')
        if personas_in_storage_after:
            import json
            try:
                stored_personas_after = json.loads(personas_in_storage_after)
                print(f"   Stored personas count: {len(stored_personas_after) if isinstance(stored_personas_after, list) else 'N/A'}")

                if isinstance(stored_personas_after, list) and len(stored_personas_after) > 1:
                    issues.append(f"⚠️  Created 1 persona but {len(stored_personas_after)} are stored")
                    print(f"   ⚠️  ISSUE: Expected 1 persona, found {len(stored_personas_after)}")
                    print(f"   Persona names: {[p.get('name', 'N/A') for p in stored_personas_after[:5]]}")
            except Exception as e:
                print(f"   Error parsing: {e}")

        # Step 7: Test chat functionality
        print("\n7. Testing chat functionality...")

        # Find and click a Chat button
        chat_buttons = page.locator('button:has-text("Chat")')
        if chat_buttons.count() > 0:
            print(f"   Found {chat_buttons.count()} chat buttons")
            chat_buttons.first.click()
            print("   ✅ Clicked first Chat button")

            # Wait for navigation or modal
            time.sleep(2)
            page.wait_for_load_state('networkidle')

            current_url = page.url
            print(f"   Current URL: {current_url}")

            if '/chat' in current_url:
                print("   ✅ Navigated to chat page")
                page.screenshot(path='/tmp/chat_page.png', full_page=True)

                # Check for chat interface elements
                message_input = page.locator('input[placeholder*="message" i], textarea[placeholder*="message" i]')
                if message_input.count() > 0:
                    print("   ✅ Message input found")

                    # Try sending a message
                    message_input.first.fill("Hello, this is a test message")
                    time.sleep(1)

                    # Find send button
                    send_button = page.locator('button[type="submit"], button:has-text("Send")').first
                    if send_button.count() > 0:
                        print("   ✅ Send button found")
                        send_button.click()
                        time.sleep(3)

                        # Check for response
                        page.screenshot(path='/tmp/chat_after_send.png', full_page=True)
                        print("   ✅ Message sent, waiting for response...")

                        # Wait for any error messages
                        time.sleep(5)

                    else:
                        issues.append("❌ Send button not found in chat")
                        print("   ❌ Send button not found")
                else:
                    issues.append("❌ Message input not found in chat")
                    print("   ❌ Message input not found")
            else:
                issues.append(f"❌ Did not navigate to chat page, still at: {current_url}")
                print(f"   ❌ Still at: {current_url}")
        else:
            issues.append("❌ No Chat buttons found")
            print("   ❌ No chat buttons")

        # Wait to see console errors
        time.sleep(3)

        browser.close()

    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)

    if console_errors:
        print(f"\n❌ Console Errors Found: {len(console_errors)}")
        for err in console_errors[:5]:
            print(f"   - {err}")

    if issues:
        print(f"\n⚠️  Issues Found: {len(issues)}")
        for i, issue in enumerate(issues, 1):
            print(f"{i}. {issue}")
    else:
        print("\n✅ All tests passed!")

    print("\n📸 Screenshots saved:")
    print("   - /tmp/before_creation.png")
    print("   - /tmp/persona_form.png")
    print("   - /tmp/after_creation.png")
    print("   - /tmp/chat_page.png (if reached)")
    print("   - /tmp/chat_after_send.png (if message sent)")

    return issues, console_errors

if __name__ == "__main__":
    issues, errors = test_persona_and_chat()
    exit(0 if (len(issues) == 0 and len(errors) == 0) else 1)
