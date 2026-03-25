from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    print("Launching playwright...")
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1366, "height": 768})
    
    print("Navigating to http://localhost:3000...")
    page.goto('http://localhost:3000')
    time.sleep(2)
    
    print("Snapshot 1: Login")
    page.screenshot(path=r'c:\Users\Aslam jan\OneDrive\Desktop\Minor\screenshot1.png')
    
    print("Logging in...")
    try:
        page.evaluate('''() => {
            const overlay = document.getElementById("webpack-dev-server-client-overlay");
            if (overlay) overlay.remove();
        }''')
        page.locator('input').nth(0).fill('admin')
        page.locator('input').nth(1).fill('admin123')
        btn = page.locator('button', has_text='Login')
        if btn.count() > 0:
            btn.first.click(force=True)
        else:
            page.locator('button').nth(1).click(force=True)
        time.sleep(3)
    except Exception as e:
        print("Login failed or no inputs found")
    page.screenshot(path=r'c:\Users\Aslam jan\OneDrive\Desktop\Minor\screenshot2.png')
    
    print("Trying to open seat selector...")
    try:
        # Find all buttons and click the first one that says 'BOOK' or 'book'
        buttons = page.locator('button').all()
        for btn in buttons:
            if 'BOOK' in btn.inner_text().upper():
                btn.click()
                break
        time.sleep(1.5)
        print("Snapshot 3: Seat Layout")
        page.screenshot(path=r'c:\Users\Aslam jan\OneDrive\Desktop\Minor\screenshot3.png')
    except Exception as e:
        print("Seat selector open failed:", e)

    browser.close()
    print("All done.")
