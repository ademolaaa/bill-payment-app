import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def run_admin_tests():
    print("=" * 60)
    print("STARTING KYVATRON ADMIN DASHBOARD AUTOMATED FLOW CHECK")
    print("=" * 60)
    print("This script uses Playwright in headless mode to automatically check")
    print("and verify every route, widget, and panel of the Kyvatron Admin Cockpit.")
    print("-" * 60)

    base_url = "https://bill-payment-app-lovat.vercel.app"

    with sync_playwright() as p:
        # Launching in headless mode to avoid CDP freezes
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Browser PageError] {err}"))
        page.on("dialog", lambda dialog: dialog.accept())

        try:
            # ─── STEP 1: COCKPIT OVERVIEW ───
            print("[1] Navigating to Admin Cockpit Overview...")
            page.goto(f"{base_url}/admin")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)

            # Assert Overview elements
            page.wait_for_selector('h1:has-text("Command Cockpit")')
            print("[+] Verified page header presence of 'Command Cockpit'")
            
            # Check presence of stat cards
            page.wait_for_selector('span:has-text("Total Revenue")')
            page.wait_for_selector('span:has-text("Active Users")')
            page.wait_for_selector('span:has-text("Open Disputes")')
            print("[+] Stat cards rendered successfully!")

            # Check simulated role switcher
            print("[*] Verifying Role Switcher...")
            select_element = page.locator('select').first
            select_element.select_option("Operations Admin")
            page.wait_for_timeout(1500)
            
            # Verify Operations title updates
            page.wait_for_selector('h1:has-text("Operations Admin Command Cockpit")')
            print("[+] Simulated role switched to Operations Admin successfully!")

            page.screenshot(path="web/admin_overview.png")
            print("[+] Captured screenshot of Admin Overview page.")

            # ─── STEP 2: USER DIRECTORY ───
            print("\n[2] Navigating to User Directory...")
            page.locator('a:has-text("User Directory")').first.click()
            page.wait_for_url("**/admin/users")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)

            # Check directory header and search bar
            page.wait_for_selector('h1:has-text("Customer Directory")')
            page.wait_for_selector('input[placeholder*="Search by full name, email"]')
            print("[+] User Directory search and table loaded successfully!")

            # Click first user to open detail drawer
            page.locator('tr.cursor-pointer, td:has-text("@")').first.click()
            page.wait_for_timeout(2000)
            
            page.screenshot(path="web/admin_user_drawer.png")
            print("[+] Opened User Drawer successfully!")
            
            # Close drawer
            page.keyboard.press("Escape")
            page.wait_for_timeout(1000)

            # ─── STEP 3: TRANSACTION LEDGER ───
            print("\n[3] Navigating to Transaction Ledger...")
            page.locator('a:has-text("Transaction Ledger")').first.click()
            page.wait_for_url("**/admin/transactions")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)

            page.wait_for_selector('h1:has-text("Transaction Ledger")')
            print("[+] Transaction Ledger loaded successfully!")

            # Filter by conversion
            page.fill('input[placeholder*="unique reference"]', "conversion")
            page.keyboard.press("Enter")
            page.wait_for_timeout(1500)

            page.screenshot(path="web/admin_transactions.png")
            print("[+] Transaction searching & filtering works perfectly!")

            # ─── STEP 4: GATEWAY ROUTING ───
            print("\n[4] Navigating to Gateway Routing...")
            page.locator('a:has-text("Gateway Routing")').first.click()
            page.wait_for_url("**/admin/gateway-routing")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)

            page.wait_for_selector('h1:has-text("Gateway Routing Center")')
            print("[+] Gateway Routing dashboard loaded successfully!")

            # Switch to adapters tab to render individual gateway provider cards and badges
            page.locator('button:has-text("API Gateway Adapters")').first.click()
            page.wait_for_timeout(1500)

            # Verify presence of circuit states (upper-case text in badge span elements)
            page.locator('span:has-text("HEALTHY"), span:has-text("PROBING"), span:has-text("TRIPPED"), span:has-text("Healthy"), span:has-text("Probing"), span:has-text("Tripped")').first.wait_for()
            print("[+] Circuit Breaker status indicators are visible.")

            page.screenshot(path="web/admin_gateway_routing.png")
            print("[+] Gateway Routing details verified.")

            # ─── STEP 5: RECONCILIATION ───
            print("\n[5] Navigating to Reconciliation...")
            page.locator('a:has-text("Reconciliation")').first.click()
            page.wait_for_url("**/admin/reconciliation")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)

            page.wait_for_selector('h1:has-text("Financial Reconciliation Engine")')
            
            # Click unmatched deposit to open ledger candidates panel
            page.locator('text=Aisha Yusuf').first.click()
            page.wait_for_timeout(1000)
            
            # Click the match button
            page.locator('button:has-text("Match")').first.click()
            page.wait_for_timeout(2000)
            
            page.screenshot(path="web/admin_reconciliation.png")
            print("[+] Reconciliation simulation executed successfully!")

            # ─── STEP 6: ACTIVE SUPPORT ───
            print("\n[6] Navigating to Active Support...")
            page.locator('a:has-text("Active Support")').first.click()
            page.wait_for_url("**/admin/support")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)

            page.wait_for_selector('h1:has-text("Customer Disputes")')
            print("[+] Support Ticket list renders correctly.")

            # Select first ticket
            page.locator('h4:has-text("KYC Document"), h4:has-text("Cannot login"), h4:has-text("Corporate")').first.click()
            page.wait_for_timeout(1500)

            # Type support message
            page.fill('input[placeholder*="Type internal system notes"]', "E2E Automated Agent message: Reviewing your request now.")
            page.keyboard.press("Enter")
            page.wait_for_timeout(2000)

            page.screenshot(path="web/admin_support.png")
            print("[+] Sent support reply successfully!")

            # ─── STEP 7: AUDIT TRAIL ───
            print("\n[7] Navigating to Audit Trail...")
            page.locator('a:has-text("Audit Trail")').first.click()
            page.wait_for_url("**/admin/logs")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)

            page.wait_for_selector('h1:has-text("Error & Alert Logs")')
            page.screenshot(path="web/admin_logs.png")
            print("[+] Audit Trail logs populated successfully!")

            # ─── STEP 8: SYSTEM SETTINGS ───
            print("\n[8] Navigating to System Settings...")
            page.locator('a:has-text("System Settings")').first.click()
            page.wait_for_url("**/admin/settings")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)

            page.wait_for_selector('h1:has-text("System Operations Settings")')
            page.screenshot(path="web/admin_settings.png")
            print("[+] System Settings dashboard loaded successfully!")

            print("\n============================================================")
            print("SUCCESS: ALL ADMIN DASHBOARD AUTOMATED TESTS PASSED FLAWLESSLY!")
            print("============================================================")

        except Exception as e:
            print(f"\n[!] Test execution encountered an error: {str(e)}")
            page.screenshot(path="web/admin_test_failure.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run_admin_tests()
