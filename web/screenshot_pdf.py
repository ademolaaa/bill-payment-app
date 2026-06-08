import os
from playwright.sync_api import sync_playwright

def screenshot_pdf():
    pdf_filename = "Kyvatron_Statement_2026-05-30_to_2026-06-27.pdf"
    pdf_path = os.path.abspath(pdf_filename)
    
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} does not exist.")
        return
        
    print(f"Opening PDF in browser: {pdf_path}")
    
    with sync_playwright() as p:
        # Launch browser with headless=True
        browser = p.chromium.launch(headless=True)
        # Load PDF directly
        page = browser.new_page(viewport={"width": 800, "height": 1130})
        page.goto(f"file:///{pdf_path}")
        
        # Wait a moment for PDF reader UI to load
        page.wait_for_timeout(3000)
        
        # Take screenshot
        screenshot_path = os.path.join(os.getcwd(), "statement_screenshot.png")
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"[SUCCESS] Screenshot saved to: {screenshot_path}")
        
        browser.close()

if __name__ == "__main__":
    screenshot_pdf()
