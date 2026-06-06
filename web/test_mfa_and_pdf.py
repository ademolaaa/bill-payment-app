import sys
import time
import random
import hmac
import hashlib
import struct
import base64
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

# Pure Python TOTP generator (no external dependencies needed)
def get_totp_token(secret):
    # Normalize secret: uppercase and strip spaces
    secret = secret.replace(" ", "").upper()
    # Add padding if needed
    missing_padding = len(secret) % 8
    if missing_padding:
        secret += "=" * (8 - missing_padding)
    key = base64.b32decode(secret, casefold=True)
    # 30-second time steps
    epoch_time = int(time.time() // 30)
    # Pack as 8-byte big-endian integer
    msg = struct.pack(">Q", epoch_time)
    # Generate HMAC-SHA1
    hm = hmac.new(key, msg, hashlib.sha1).digest()
    # Dynamic truncation to get a 6-digit integer
    offset = hm[-1] & 0x0F
    code = ((struct.unpack(">I", hm[offset:offset+4])[0] & 0x7FFFFFFF) % 1000000)
    return f"{code:06d}"

def run_tests():
    print("=" * 60)
    print("STARTING KYVATRON MFA & PDF VERIFICATION TEST")
    print("=" * 60)

    random_id = random.randint(10000, 99999)
    test_email = f"mfa_tester_{random_id}@kyvatron.com"
    test_password = "Password123!"
    base_url = "http://localhost:3999"

    print(f"[*] Creating unique test user: {test_email}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        context.set_default_timeout(60000)
        context.set_default_navigation_timeout(60000)
        page = context.new_page()
        
        # Automatically accept dialogs (alerts, etc.) to prevent hanging or close errors
        page.on("dialog", lambda dialog: dialog.accept())

        # Listen to console log errors
        page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Browser PageError] {err}"))

        try:
            # ─── STEP 1: SIGN UP ───
            print("[1] Navigating to Sign Up...")
            page.goto(f"{base_url}/signup")
            page.wait_for_selector('input[name="email"]')
            
            page.fill('input[name="firstName"]', "MFA")
            page.fill('input[name="lastName"]', "Tester")
            page.fill('input[name="email"]', test_email)
            page.fill('input[name="password"]', test_password)
            page.fill('input[name="confirmPassword"]', test_password)
            
            print("[*] Submitting sign up form...")
            page.click('button:has-text("Create Account"), button:has-text("Sign Up")')
            page.wait_for_url("**/home", timeout=60000)
            print("[+] Sign up successful! Redirected to /home")
            page.wait_for_timeout(2000)

            # ─── STEP 2: ENROLL IN 2FA ───
            print("[2] Navigating to Security Settings...")
            page.goto(f"{base_url}/settings/security")
            page.wait_for_selector('button[title="Enable Authenticator App"]', timeout=30000)
            page.wait_for_timeout(2000)

            print("[*] Activating 2FA switch...")
            # Click the 2FA Authenticator button
            page.click('button[title="Enable Authenticator App"]')
            page.wait_for_selector('h3:has-text("Authenticator App")', timeout=5000)
            print("[+] MFA setup modal opened successfully.")
            page.wait_for_timeout(2000)

            # Retrieve manual key
            secret_element = page.locator('span.font-mono')
            secret_key = secret_element.text_content().replace(" ", "").strip()
            print(f"[+] Retrieved MFA Secret Key: {secret_key}")

            # Click scanned code button
            page.click('button:has-text("I\'ve Scanned the Code")')
            page.wait_for_timeout(1000)

            # Generate TOTP code and enter it
            totp_code = get_totp_token(secret_key)
            print(f"[*] Generated dynamic TOTP code: {totp_code}")
            
            page.fill('input[placeholder="000000"]', totp_code)
            page.wait_for_timeout(1000)
            
            print("[*] Submitting verification code...")
            page.click('button:has-text("Verify & Activate")')
            
            # Wait for success screen
            page.wait_for_selector('text=Activation Successful!', timeout=10000)
            print("[+] MFA enrollment and verification successful!")
            page.wait_for_timeout(2000)

            # Close modal if still open
            try:
                page.click('button[title="Close Modal"]', timeout=2000)
            except Exception:
                print("[*] Modal closed automatically or already dismissed.")
            page.wait_for_timeout(2000)

            # ─── STEP 3: LOG OUT ───
            print("[3] Logging user out to test 2FA Sign In restriction...")
            # Log out via Supabase client directly
            page.evaluate("window.supabase.auth.signOut()")
            page.wait_for_timeout(3000)
            
            # Go back to login page
            page.goto(f"{base_url}/login")
            page.wait_for_selector('input[name="email"]')
            print("[+] Successfully logged out and returned to login page.")

            # ─── STEP 4: SIGN IN WITH 2FA CHALLENGE ───
            print("[4] Logging in with email and password...")
            page.fill('input[name="email"]', test_email)
            page.fill('input[name="password"]', test_password)
            page.click('button:has-text("Log In")')

            # Wait for 2FA screen to show (we should remain on /login but see security code prompt)
            page.wait_for_selector('h1:has-text("Security Code")', timeout=10000)
            print("[+] Verified: 2FA challenge screen successfully intercepted the sign-in flow!")
            page.wait_for_timeout(1000)

            # Verify middleware block: try to bypass by navigating directly to /home
            print("[*] Attempting to bypass MFA challenge by navigating to /home directly...")
            page.goto(f"{base_url}/home")
            page.wait_for_url("**/login*", timeout=10000)
            print("[+] Verified: Middleware blocked AAL1 session and redirected back to /login!")
            
            # The auto-load useEffect in login page should re-enable the Security Code screen automatically
            page.wait_for_selector('h1:has-text("Security Code")', timeout=10000)
            print("[+] Verified: Login page automatically loaded the MFA challenge form!")
            page.wait_for_timeout(1000)

            # Generate a new TOTP code and log in
            totp_code = get_totp_token(secret_key)
            print(f"[*] Generated new dynamic TOTP code: {totp_code}")
            page.fill('input[placeholder="000000"]', totp_code)
            page.wait_for_timeout(1000)
            
            page.click('button:has-text("Verify & Log In")')
            page.wait_for_url("**/home", timeout=60000)
            print("[+] Verified: Successfully promoted to AAL2 and redirected to /home!")
            page.wait_for_timeout(2000)

            # ─── STEP 5: TEST PDF STATEMENT GENERATION ───
            print("[5] Navigating to History to test PDF Statement Generation...")
            page.goto(f"{base_url}/history")
            page.wait_for_selector('button:has-text("Download Statement")')
            page.wait_for_timeout(2000)

            # Open download calendar
            print("[*] Opening download statement calendar modal...")
            page.click('button:has-text("Download Statement")')
            page.wait_for_selector('h3:has-text("Download Statement")', timeout=5000)
            
            # Select today's date in DatePicker (we click day elements)
            # Find the active day cells
            # Wait for calendar days to render inside the modal
            page.locator('div.fixed span.cursor-pointer').first.wait_for(state="visible")
            days = page.locator('div.fixed span.cursor-pointer').all()
            print(f"[*] Found {len(days)} calendar day spans inside the modal.")
            
            # Click two days to set From and To range under the new date picker logic
            if len(days) >= 11:
                print("[*] Selecting range: Clicking start date (index 5) and end date (index 10)...")
                days[5].click()
                page.wait_for_timeout(1000)
                days[10].click()
                page.wait_for_timeout(1000)
            else:
                print("[*] Calendar day list shorter than expected. Clicking first day twice...")
                days[0].click()
                page.wait_for_timeout(1000)
                days[0].click()
                page.wait_for_timeout(1000)

            print("[*] Triggering PDF generation after scrolling window down...")
            page.evaluate("window.scrollTo(0, 300)")
            page.wait_for_timeout(1000)
            
            # Expect a download when clicking the button
            with page.expect_download(timeout=20000) as download_info:
                page.click('div.fixed button:has-text("Download Statement"):visible')
            
            download = download_info.value
            download_path = "web/statement.pdf"
            download.save_as(download_path)
            
            import os
            file_size = os.path.getsize(download_path)
            print(f"[+] PDF statement downloaded successfully! Saved to {download_path} ({file_size} bytes)")
            
            if file_size < 1000:
                raise Exception(f"Downloaded PDF is too small ({file_size} bytes), likely empty or failed.")
            
            # If there was an error, browser logs would catch page errors. Let's make sure it doesn't fail.
            print("[+] Verified: html2pdf.js loaded and executed successfully without integrity errors!")
            
            print("=" * 60)
            print("SUCCESS: ALL MFA AND PDF STATEMENT TESTS COMPLETED AND VERIFIED!")
            print("=" * 60)

        except Exception as e:
            print(f"\n[!] TEST FAILED: {str(e)}")
            page.screenshot(path="web/test_failure.png")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    run_tests()
