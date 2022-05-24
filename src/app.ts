import cheerio from 'cheerio';
// import axios from 'axios';
import pretty from 'pretty';
import puppeteer from 'puppeteer';
import fs from 'fs';


// URL of the page we want to scrape
const URL = "https://www.wexley100.com/models";
//
//
// // Async function which scrapes the data
// async function scrapeData() {
// 	try {
//
// 		// Fetch HTML of the page we want to scrape
// 		const { data } = await axios.get(URL);
//
// 		// Load HTML we fetched in the previous line
// 		const $ = cheerio.load(data);
//
// 		console.log(pretty($.html()));
//
// 		// h4  class model-title
//
//
// 		// div class model-unavailable model-subtitle
// 		// div class model-available
//
//
//
// 		// class wrap-models
// 		// class wrap-model-item item
//
// 		// const models = $('.wrap-model-item div');
// 		// models.each((index, model) => {
// 		// 	console.log("a");
// 		// 	// const title = $(model).children('.model-title');
// 		// 	// const avaliablity = $(model).children('.model-title');
// 		//
// 		// 	// console.log(title);
// 		// });
//
// 		// // Select all the list items in plainlist class
// 		// const listItems = $(".plainlist ul li");
// 		// // Stores data for all countries
// 		// const countries = [];
// 		// // Use .each method to loop through the li we selected
// 		// listItems.each((idx, el) => {
// 		// 	// Object holding data for each country/jurisdiction
// 		// 	const country = { name: "", iso3: "" };
// 		// 	// Select the text content of a and span elements
// 		// 	// Store the textcontent in the above object
// 		// 	country.name = $(el).children("a").text();
// 		// 	country.iso3 = $(el).children("span").text();
// 		// 	// Populate countries array with country data
// 		// 	countries.push(country);
// 		// });
// 		// Logs countries array to the console
// 		// console.dir(countries);
// 		// // Write countries array in countries.json file
// 		// fs.writeFile("coutries.json", JSON.stringify(countries, null, 2), (err) => {
// 		// 	if (err) {
// 		// 		console.error(err);
// 		// 		return;
// 		// 	}
// 		// 	console.log("Successfully written data to file");
// 		// });
// 	} catch (err) {
// 		console.error(err);
// 	}
// }
//
// const main = () => {
// 	// const $ = cheerio.load('<h2 class="title">Hello world</h2>');
// 	//
// 	// $('h2.title').text('Hello there!');
// 	// $('h2').addClass('welcome');
// 	//
// 	// console.log(pretty($.html()));
// 	//
// 	// console.log('hi');
//
// 	// Invoke the above function
// 	scrapeData();
// };
//
//
// main();
//
//
//


(async () => {
	const URL = "https://www.wexley100.com/models";
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(URL, { waitUntil: 'networkidle2' });
	await page.screenshot({ path: 'page.png' });

	const html = await page.evaluate(() => document.body.innerHTML);
	const $ = cheerio.load(html);
	fs.writeFileSync('page.html', html);
	// console.log(pretty(html));

	const models = $('div .wrap-model-item');
	models.each((index, model) => {
		const title = $(model).find('h4 .model-title').text();
		const unav = $(model).find('div .model-unavailable');
		const av = $(model).find('div .model-available');

		console.log("hello world");
		console.log(title);
	});

	await browser.close();
})();



// (async () => {
// 	const browser = await puppeteer.launch();
// 	const page = await browser.newPage();
//
// 	try {
// 		await page.goto(URL, { timeout: 180000 });
// 		let bodyHTML = await page.evaluate(() => document.body.innerHTML);
// 		let $ = cheerio.load(bodyHTML);
// 		console.log(pretty(bodyHTML));
// 		fs.writeFileSync('data.html', bodyHTML);
//
// 		let models = $('.wrap-model-item div')
// 		models.each((index, model) => {
// 			const title = $(model).find('.model-title').text();
// 			console.log(title);
// 		});
//
// 	}  catch(err) {
// 		console.log(err);
// 	}
//
// 	await browser.close();
// })();
