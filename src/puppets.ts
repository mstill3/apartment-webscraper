const puppeteer = require('puppeteer');


(async () => {
	const URL = "https://www.wexley100.com/models";
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	const WAIT_TIME_SECONDS = 60;
	await page.goto(URL, { timeout: WAIT_TIME_SECONDS * 1000 });
	await page.screenshot({ path: 'example.png' });

	await browser.close();
})();
