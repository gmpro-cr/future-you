#!/usr/bin/env python3
"""
Automated test for chat functionality
"""
from playwright.sync_api import sync_playwright
import time
import json

DEPLOYED_URL = "https://future-you-six.vercel.app"

def test_chat():
    """Test complete chat flow: create persona → navigate to chat → send message"""

    print(f"🔍 Testing Chat Functionality")
    print("=" * 60)

    issues = []
    console_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Visible for debugging
        page = browser.new_page()

        # Capture console errors
        def handle_console(msg):
            if msg.type == 'error':
                console_errors.append(msg.text)
                print(f"  ❌ Console Error: {msg.text[:100]}")

        page.on('console', handle_console)

        # Step 1: Go to site and continue as guest
        print("\n1️⃣ Going to homepage...")
        page.goto(DEPLOYED_URL, wait_until='networkidle')

        print("2️⃣ Continuing as guest...")
        page.locator('button:has-text("Continue as Guest")').click()
        page.wait_for_url('**/personas', timeout=10000)
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        # Step 2: Create a persona
        print("\n3️⃣ Creating a test persona...")
        page.locator('button:has-text("Create New Persona")').click()
        time.sleep(1)

        # Find and fill the name field
        print("   📝 Filling persona form...")

        # Try different selectors for name input
        name_input = None
        for selector in [
            'input[type="text"]',
            'input[placeholder*="name"]',
            'input[placeholder*="Name"]',
            'input[maxlength="50"]',
        ]:
            if page.locator(selector).count() > 0:
                name_input = page.locator(selector).first
                break

        if name_input:
            name_input.fill("Test Chat Persona")
            print("   ✅ Name filled")
        else:
            issues.append("❌ Could not find name input field")
            print("   ❌ Name input not found")
            page.screenshot(path='/tmp/chat_test_form_error.png')
            browser.close()
            return issues

        # Fill system prompt (textarea)
        textarea = page.locator('textarea').first
        if textarea.count() > 0:
            textarea.fill("You are a helpful test assistant. Keep responses brief.")
            print("   ✅ System prompt filled")
        else:
            issues.append("❌ Could not find textarea for system prompt")

        time.sleep(1)
        page.screenshot(path='/tmp/chat_test_form_filled.png')

        # Submit the form
        print("   💾 Saving persona...")
        save_button = page.locator('button:has-text("Save Persona")')

        # Wait for button to be enabled
        try:
            save_button.wait_for(state='visible', timeout=5000)
            # Check if disabled
            is_disabled = save_button.get_attribute('disabled')
            if is_disabled:
                print("   ⚠️  Save button is disabled, waiting...")
                time.sleep(2)

            save_button.click(timeout=5000)
            print("   ✅ Persona save clicked")
        except Exception as e:
            issues.append(f"❌ Could not click Save button: {str(e)}")
            print(f"   ❌ Save error: {e}")
            page.screenshot(path='/tmp/chat_test_save_error.png')

        page.wait_for_load_state('networkidle')
        time.sleep(3)

        page.screenshot(path='/tmp/chat_test_after_save.png')

        # Step 3: Find and click Chat button
        print("\n4️⃣ Looking for Chat button...")
        chat_buttons = page.locator('button:has-text("Chat")')

        if chat_buttons.count() == 0:
            issues.append("❌ No Chat button found after creating persona")
            print("   ❌ Chat button not found")
            page.screenshot(path='/tmp/chat_test_no_button.png')
        else:
            print(f"   ✅ Found {chat_buttons.count()} Chat button(s)")
            print("   🖱️  Clicking Chat button...")

            chat_buttons.first.click()

            # Wait for navigation to chat page
            try:
                page.wait_for_url('**/chat', timeout=10000)
                page.wait_for_load_state('networkidle')
                print("   ✅ Navigated to chat page")
            except Exception as e:
                current_url = page.url
                issues.append(f"❌ Did not navigate to chat page. URL: {current_url}, Error: {str(e)}")
                print(f"   ❌ Navigation failed. Current URL: {current_url}")

        page.screenshot(path='/tmp/chat_test_chat_page.png')

        # Step 4: Try to send a message
        print("\n5️⃣ Testing message sending...")

        # Look for message input
        message_input = None
        for selector in [
            'input[placeholder*="message"]',
            'input[placeholder*="Message"]',
            'textarea[placeholder*="message"]',
            'textarea[placeholder*="Message"]',
            'input[type="text"]',
        ]:
            if page.locator(selector).count() > 0:
                message_input = page.locator(selector).first
                print(f"   ✅ Found message input: {selector}")
                break

        if not message_input:
            issues.append("❌ Could not find message input field on chat page")
            print("   ❌ Message input not found")
        else:
            print("   📝 Typing test message...")
            message_input.fill("Hello, this is a test message")
            time.sleep(1)

            # Send message by pressing Enter
            print("   📤 Sending message (pressing Enter)...")
            message_input.press("Enter")

            print("   ⏳ Waiting for response (10 seconds)...")
            time.sleep(10)

            page.screenshot(path='/tmp/chat_test_after_send.png')

            # Check for AI response
            page_content = page.content()

            # Check if message appears in chat
            if 'Hello, this is a test message' in page_content:
                print("   ✅ User message appeared in chat")

                # Check for AI response (any text that's not the user's message)
                # Look for a response by checking if there's more than one message
                messages = page.locator('[class*="message"], p').all_text_contents()
                if len([m for m in messages if m.strip() and m.strip() != 'Hello, this is a test message']) > 2:
                    print("   ✅ AI response received")
                else:
                    print("   ⚠️  No AI response detected yet")
            else:
                issues.append("❌ User message did not appear in chat")
                print("   ❌ Message not visible")

            # Look for actual error messages (not just the word "error")
            error_indicators = [
                'something went wrong',
                'an error occurred',
                'failed to send',
                'failed to load',
                'error sending message'
            ]
            for indicator in error_indicators:
                if indicator in page_content.lower():
                    issues.append(f"⚠️  Error message visible: {indicator}")
                    print(f"   ⚠️  Error detected: {indicator}")

        # Wait a bit more to see any delayed responses
        time.sleep(5)
        page.screenshot(path='/tmp/chat_test_final.png', full_page=True)

        # Close browser
        print("\n⏸️  Keeping browser open for 10 seconds for inspection...")
        time.sleep(10)
        browser.close()

    # Print summary
    print("\n" + "=" * 60)
    print("📊 CHAT TEST SUMMARY")
    print("=" * 60)

    if console_errors:
        print(f"\n❌ Console Errors: {len(console_errors)}")
        for i, error in enumerate(console_errors[:5], 1):
            print(f"{i}. {error[:150]}")

    if issues:
        print(f"\n⚠️  Issues Found: {len(issues)}")
        for i, issue in enumerate(issues, 1):
            print(f"{i}. {issue}")
    else:
        print("\n✅ No issues found during automated test")

    print("\n📸 Screenshots saved:")
    print("   - /tmp/chat_test_form_filled.png - Persona form")
    print("   - /tmp/chat_test_after_save.png - After saving persona")
    print("   - /tmp/chat_test_chat_page.png - Chat page loaded")
    print("   - /tmp/chat_test_after_send.png - After sending message")
    print("   - /tmp/chat_test_final.png - Final state")

    print("\n💡 Next Steps:")
    print("   1. Review screenshots to see what happened")
    print("   2. Check console errors above")
    print("   3. Identify the specific chat issue")

    return issues, console_errors

if __name__ == "__main__":
    issues, errors = test_chat()
    exit(0 if (len(issues) == 0 and len(errors) == 0) else 1)
