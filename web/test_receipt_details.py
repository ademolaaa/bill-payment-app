import sys
import time
import random
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def run_receipt_tests():
    print("=" * 60)
    print("STARTING KYVATRON TRANSACTION HISTORY & DETAILS FLOW CHECK")
    print("=" * 60)
    print("This script uses Playwright to verify that the transactions and receipt details")
    print("are completely dynamic, correctly formatted, and fully database-driven.")
    print("-" * 60)

    test_email = "tester_dynamic@kyvatron.com"
    test_password = "Password123!"
    
    print(f"[*] Target user account: {test_email}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, slow_mo=100)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Browser PageError] {err}"))

        try:
            # ─── STEP 1: LOGIN OR REGISTER FLOW (WITH RETRIES FOR NETWORK ROBUSTNESS) ───
            max_retries = 3
            logged_in = False
            
            for attempt in range(max_retries):
                print(f"[1] Attempting to Login (Try {attempt + 1}/{max_retries})...")
                try:
                    if "home" in page.url:
                        print("[+] Already authenticated and on Home page!")
                        logged_in = True
                        break

                    page.goto("http://localhost:3999/login")
                    page.wait_for_load_state("networkidle")

                    if "home" in page.url:
                        print("[+] Already authenticated and redirected to Home page!")
                        logged_in = True
                        break
                    
                    page.fill('input[name="email"]', test_email)
                    page.fill('input[name="password"]', test_password)
                    page.click('button:has-text("Log In")')
                    
                    page.wait_for_url("**/home", timeout=20000)
                    print("[+] Successfully logged in with existing user!")
                    logged_in = True
                    break
                except Exception as ex:
                    print(f"[*] Login attempt {attempt + 1} failed or timed out: {str(ex)}")
                    page.wait_for_timeout(3000)
            
            if not logged_in:
                print("[*] All login attempts failed or user does not exist. Registering fresh account...")
                # Try registering (also with retries)
                registered = False
                for attempt in range(max_retries):
                    print(f"[*] Attempting Registration (Try {attempt + 1}/{max_retries})...")
                    try:
                        if "home" in page.url:
                            print("[+] Already authenticated and on Home page!")
                            registered = True
                            break

                        page.goto("http://localhost:3999/signup")
                        page.wait_for_load_state("networkidle")

                        if "home" in page.url:
                            print("[+] Already authenticated and on Home page!")
                            registered = True
                            break
                        
                        page.fill('input[name="firstName"]', "Dynamic")
                        page.fill('input[name="lastName"]', "Tester")
                        page.fill('input[name="email"]', test_email)
                        page.fill('input[name="password"]', test_password)
                        page.fill('input[name="confirmPassword"]', test_password)
                        page.click('button:has-text("Sign Up")')
                        
                        page.wait_for_url("**/home", timeout=25000)
                        print("[+] Successfully registered and redirected to Dashboard home!")
                        registered = True
                        break
                    except Exception as ex:
                        print(f"[*] Signup attempt {attempt + 1} failed: {str(ex)}")
                        page.wait_for_timeout(3000)
                
                if not registered:
                    raise Exception("Could not authenticate nor register user due to persistent connectivity drops.")

            # ─── STEP 2: wallet FUNDING BACKDOOR ───
            print("[2] Funding wallet with 30,000 NGN...")
            funding_js = """
            (async () => {
                const { data: { user } } = await window.supabase.auth.getUser();
                if (!user) throw new Error("No active session found");
                
                const { data, error } = await window.supabase.rpc('confirm_deposit', {
                    p_user_id: user.id,
                    p_flw_transaction_id: Math.floor(Math.random() * 1000000000),
                    p_tx_ref: 'kyvatron-deposit-' + user.id + '-' + Date.now(),
                    p_amount: 30500.00,
                    p_currency: 'NGN',
                    p_metadata: { is_test: true },
                    p_auth_secret: 'Kyvatron2026F'
                });
                if (error) throw new Error(error.message);
                return data;
            })()
            """
            
            funding_success = False
            for attempt in range(max_retries):
                try:
                    page.evaluate(funding_js)
                    page.reload()
                    page.wait_for_load_state("networkidle")
                    print("[+] Funded successfully!")
                    funding_success = True
                    break
                except Exception as ex:
                    print(f"[*] Funding attempt {attempt + 1} failed: {str(ex)}")
                    page.wait_for_timeout(3000)
            
            if not funding_success:
                raise Exception("Failed to fund wallet.")

            # ─── STEP 3: CURRENCY CONVERSION FLOW ───
            print("[3] Converting 8,500 NGN to USDT...")
            conversion_success = False
            for attempt in range(max_retries):
                try:
                    page.goto("http://localhost:3999/convert")
                    page.wait_for_load_state("networkidle")
                    
                    amount_input = page.locator('input[type="number"]')
                    amount_input.fill("8500")
                    page.wait_for_timeout(1000)
                    
                    # Click Confirm button
                    page.click('button:has-text("Confirm Conversion")')
                    page.wait_for_selector('text=successfully', timeout=10000)
                    print("[+] Conversion completed successfully!")
                    conversion_success = True
                    break
                except Exception as ex:
                    print(f"[*] Conversion attempt {attempt + 1} failed: {str(ex)}")
                    page.wait_for_timeout(3000)

            if not conversion_success:
                raise Exception("Failed to convert currency.")

            # ─── STEP 4: NAVIGATE TO TRANSACTION HISTORY PAGE ───
            print("[4] Navigating to Transaction History list page...")
            page.goto("http://localhost:3999/history")
            page.wait_for_load_state("networkidle")
            
            # Wait up to 15 seconds for dynamic history links to render
            try:
                page.wait_for_selector('a[href^="/history/"]', timeout=15000)
            except Exception:
                print("[!] Timeout waiting for history links to load, proceeding to verify...")
            
            # Verify recent transactions are displayed in UI
            history_items = page.locator('a[href^="/history/"]')
            count = history_items.count()
            print(f"[+] Found {count} dynamic history links in UI!")
            
            if count == 0:
                raise Exception("Expected history items but found 0!")

            # Log all history item texts for visibility
            for i in range(count):
                text_content = history_items.nth(i).text_content()
                print(f"[-] Transaction {i+1}: {text_content}")

            # Find deposit and conversion item
            deposit_item = page.locator('a[href^="/history/"]:has-text("deposit")').first
            conversion_item = page.locator('a[href^="/history/"]:has-text("Conversion"):has-text("8,500")').first
            
            page.screenshot(path="web/history_rendered.png")

            # Click conversion transaction to view receipt details
            clicked = False
            for attempt in range(max_retries):
                try:
                    print(f"[5] Clicking conversion transaction to view receipt details (Try {attempt + 1}/{max_retries})...")
                    conversion_item.click()
                    page.wait_for_url("**/history/*", timeout=5000)
                    clicked = True
                    break
                except Exception as ex:
                    print(f"[*] Click or redirect failed: {str(ex)}")
                    page.wait_for_timeout(2000)
            
            if not clicked:
                raise Exception("Failed to navigate to receipt page after click.")
            
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)
            
            # Print all h2 text content for diagnostics
            h2_locators = page.locator('h2')
            h2_count = h2_locators.count()
            print(f"[Diag] Found {h2_count} h2 elements on the page:")
            for i in range(h2_count):
                print(f"  - H2 {i+1}: {h2_locators.nth(i).text_content()}")

            # Verify details match the conversion of 8,500 NGN
            amount_header = page.locator('h2:has-text("8,500")')
            if not amount_header.is_visible():
                raise Exception(f"Receipt amount header is incorrect or still showing hardcoded/dummy values! All headers were: {[h2_locators.nth(i).text_content() for i in range(h2_count)]}")
                
            status_text = page.locator('span:has-text("successful")').first
            if not status_text.is_visible():
                raise Exception("Receipt status indicator is incorrect!")

            method_text = page.locator('span:has-text("Wallet Conversion")')
            if not method_text.is_visible():
                raise Exception("Receipt payment method is incorrect!")

            print("[+] Receipt details page successfully verified! All values are perfectly dynamic and database-driven!")
            page.screenshot(path="web/receipt_dynamic_success.png")

            print("=" * 60)
            print("CONGRATULATIONS: RECEIPT HISTORY & DYNAMIC DETAILS ALL PASSED!")
            print("=" * 60)
            
        except Exception as e:
            print(f"\n[!] ERROR ENCOUNTERED during receipt flow test: {str(e)}")
            page.screenshot(path="web/receipt_test_error.png")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    run_receipt_tests()
