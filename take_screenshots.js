const puppeteer = require('puppeteer');

(async () => {
    let browser;
    try {
        console.log("Launching puppeteer...");
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });
        
        console.log("Navigating to http://localhost:3000...");
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
        
        console.log("Capturing Login Screen...");
        await page.screenshot({ path: 'screenshot1.png' });
        
        console.log("Logging in as admin...");
        // Handle login page inputs if they exist (based on our UI implementation 'Username' 'Password')
        await page.type('input[placeholder="Username"], input[type="text"]', 'admin');
        await page.type('input[placeholder="Password"], input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        
        console.log("Waiting for dashboard to load...");
        await new Promise(r => setTimeout(r, 4000)); // wait for map and websockets
        
        console.log("Capturing Dashboard...");
        await page.screenshot({ path: 'screenshot2.png' });
        
        // Open the seat selector if possible
        try {
            // Find a "Book Now" or "Book" button
            const bookButtons = await page.$$('button');
            for (let btn of bookButtons) {
                const text = await page.evaluate(el => el.textContent, btn);
                if (text.toLowerCase().includes('book')) {
                    await btn.click();
                    break;
                }
            }
            await new Promise(r => setTimeout(r, 1500));
            console.log("Capturing Seat Selection...");
            await page.screenshot({ path: 'screenshot3.png' });
        } catch(e) {
            console.log("Could not open seat selector for screenshot 3.", e);
        }

    } catch (e) {
        console.error("Puppeteer Error:", e);
    } finally {
        if (browser) await browser.close();
        console.log("Done");
    }
})();
