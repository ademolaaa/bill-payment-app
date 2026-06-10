import sys
from playwright.sync_api import sync_playwright

def check_deployment():
    urls = [
        "https://bill-payment-app-lovat.vercel.app/"
    ]
    test_email = "production_tester_verify3@kyvatron.com"
    test_password = "Password123!"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        for base_url in urls:
            print(f"\n--- Checking URL: {base_url} ---")
            context = browser.new_context()
            page = context.new_page()
            
            try:
                # 1. Sign up/Log in
                print(f"Navigating to signup/login on {base_url}...")
                page.goto(f"{base_url}/signup", timeout=15000)
                page.fill('input[name="firstName"]', "Verify")
                page.fill('input[name="lastName"]', "Deploy")
                page.fill('input[name="email"]', test_email)
                page.fill('input[name="password"]', test_password)
                page.fill('input[name="confirmPassword"]', test_password)
                page.click('button:has-text("Create Account"), button:has-text("Sign Up")')
                
                try:
                    page.wait_for_url("**/home", timeout=10000)
                    print("[+] Logged in successfully via signup!")
                except Exception:
                    # Try to log in if already registered
                    page.goto(f"{base_url}/login")
                    page.fill('input[name="email"]', test_email)
                    page.fill('input[name="password"]', test_password)
                    page.click('button:has-text("Log In")')
                    page.wait_for_url("**/home", timeout=10000)
                    print("[+] Logged in successfully via login!")

                # 2. Go to /history
                page.goto(f"{base_url}/history")
                page.wait_for_selector('button:has-text("Download Statement")')
                
                # 3. Check for the class kyvatron-pdf-template
                html = page.content()
                if "kyvatron-pdf-template" in html:
                    print(f"[SUCCESS] Found 'kyvatron-pdf-template' on {base_url}!")
                else:
                    print(f"[FAILED] 'kyvatron-pdf-template' NOT found on {base_url}.")
            except Exception as e:
                print(f"[ERROR] Could not check {base_url}: {str(e)}")
            finally:
                context.close()
                
        browser.close()

if __name__ == "__main__":
    check_deployment()
