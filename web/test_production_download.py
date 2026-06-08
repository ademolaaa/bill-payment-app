import os
import sys
import time
from playwright.sync_api import sync_playwright

def download_statement():
    base_url = "https://bill-payment-app-lovat.vercel.app"
    test_email = "production_tester_verify3@kyvatron.com"
    test_password = "Password123!"

    print("Starting Playwright...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set a standard desktop viewport
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        try:
            print(f"Navigating to login page on {base_url}...")
            page.goto(f"{base_url}/login", timeout=30000)
            
            print("Filling login details...")
            page.fill('input[name="email"]', test_email)
            page.fill('input[name="password"]', test_password)
            
            print("Clicking login...")
            page.click('button:has-text("Log In")')
            
            print("Waiting for redirection to home...")
            page.wait_for_url("**/home", timeout=20000)
            print("Login successful!")

            print("Navigating to history page...")
            page.goto(f"{base_url}/history", timeout=20000)
            
            print("Waiting for Download Statement button...")
            download_btn = page.wait_for_selector('button:has-text("Download Statement")')
            
            print("Clicking Download Statement button...")
            download_btn.click()
            
            print("Waiting for calendar overlay...")
            page.wait_for_selector('div:has-text("Select a date range to generate")')
            
            # Since the calendar is custom, let's select a date range.
            # Usually, the DatePicker has dates. Let's find "1" in the calendar.
            # We want to click '1' (first day) and '28' (end day).
            # The DatePicker renders days. Let's select May 1st and May 28th.
            # In May 2026? Or May 2024?
            # Let's see. Let's click the 'Prev' arrow to go to May 2026 (or whichever month the calendar starts at).
            # Let's inspect the calendar. Or we can just click two days in the calendar.
            print("Selecting date range...")
            # Let's click the first '1' and '28' we see in the grid
            days_1 = page.locator('span:has-text("1")')
            days_28 = page.locator('span:has-text("28")')
            
            # Click first occurrences
            if days_1.count() > 0:
                days_1.first.click()
                print("Clicked start day (1)")
                time.sleep(0.5)
            if days_28.count() > 0:
                days_28.first.click()
                print("Clicked end day (28)")
                time.sleep(0.5)

            # Wait for download to start when clicking the popup download button
            popup_download_btn = page.locator('button:has-text("Download Statement")').nth(1)
            
            print("Clicking Download Statement inside popup...")
            with page.expect_download(timeout=30000) as download_info:
                popup_download_btn.click()
            
            download = download_info.value
            download_path = os.path.join(os.getcwd(), download.suggested_filename)
            download.save_as(download_path)
            print(f"[SUCCESS] PDF downloaded and saved to: {download_path}")
            
        except Exception as e:
            print(f"[ERROR] Failed to download PDF: {str(e)}")
            # Take a screenshot on failure
            page.screenshot(path="download_failure.png")
            print("Saved screenshot to download_failure.png")
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    download_statement()
