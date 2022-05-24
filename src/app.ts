import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';


// URL of the page we want to scrape
const URL = "https://www.wexley100.com/models";
const EMAILS = ["email@gmail.com"];

const DESIRED_NUM_BEDS = 2;
const DESIRED_NUM_BATHS = 2;

interface Apartment {
	name: string;
	beds: number;
	baths: number;
	available: boolean;
	availabilityMessage?: string;
	unit: string;
	sqft: number;
	rent?: number;
	availableDate?: string;
	floor?: string;
	term?: string;
}

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(URL, { waitUntil: 'networkidle2' });
	await page.screenshot({ path: 'page.png' });

	const html = await page.evaluate(() => document.body.innerHTML);
	const $ = cheerio.load(html);

	const models = $('div .model-info');
	models.each((index, model) => {

		const title = $(model).find('h4').text().trim();
		const numBeds = parseInt(title.substring(0, title.indexOf(' ')));
		const numBaths = parseInt(title.substring(title.indexOf('| ') + 1, title.lastIndexOf(' ')));

		const available = $(model).find('div .model-unavailable').text().trim() === '';
		const availabilityMessage = !available ? undefined : $(model).find('div .model-available').text().trim();

		const unit = $($(model).find('div .model-subtitle')[0]).text().trim();

		const sqft = parseInt(
			$(model).find('div .sqft').text()
				.replace('Sq. Ft.', '')
				.replace('\n', '')
				.replace(',', '')
				.replace('SqFt', '')
				.trim()
		);

		const rent = !available ? undefined : parseInt($(model).find('div .rent').text()
			.replace('Rent \n', '')
			.replace('$', '')
			.replace(',', '').trim());
		const availableDate = !available ? undefined : $(model).find('div .available').text()
			.replace('Available \n', '').trim();
		const floor = !available ? undefined : $($(model).find('div .floor')).text()
			.replace('Floor \n', '').trim();
		const term = !available ? undefined : $($(model).find('div .term')).text()
			.replace('Term \n', '').trim();

		const apartment: Apartment = {
			name: title,
			beds: numBeds,
			baths: numBaths,
			available: available,
			availabilityMessage,
			unit,
			sqft,
			rent,
			availableDate,
			floor,
			term
		}
		console.log(apartment);
		if (apartment.beds === DESIRED_NUM_BEDS &&
			apartment.baths === DESIRED_NUM_BATHS &&
			apartment.available) {
			sendMail(apartment).catch(console.error);
		}
	});

	await browser.close();
})();


// async..await is not allowed in global scope, must use a wrapper
const sendMail = async (apartment: Apartment) => {
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'email@gmail.com',
			pass: 'password1!'
		}
	});

	// Create our number formatter.
	const commaNumberFormat = new Intl.NumberFormat('en-US')

	// @ts-ignore
	const messageText = `
Unit:\t\t\t\t${apartment.unit}
Square Feet:\t\t${commaNumberFormat.format(apartment.sqft)}
Rent:\t\t\t$${commaNumberFormat.format(apartment.rent || 0)}
Number of beds:\t${apartment.beds}
Number of baths:\t${apartment.baths}
Date:\t\t\t${apartment.availableDate}
Term:\t\t\t${apartment.term}
Floor:\t\t${apartment.floor}`;

	// @ts-ignore
	const messageHtml = `
	<strong>Unit</strong>: ${apartment.unit}<br/>
	<strong>Square Feet</strong>: ${commaNumberFormat.format(apartment.sqft)}<br/>
	<strong>Rent</strong>: $${commaNumberFormat.format(apartment.rent || 0)}<br/>
	<strong>Number of beds</strong>: ${apartment.beds}<br/>
	<strong>Number of baths</strong>: ${apartment.baths}<br/>
	<strong>Date</strong>: ${apartment.availableDate}<br/>
	<strong>Term</strong>: ${apartment.term}<br/>
	<strong>Floor</strong>: ${apartment.floor}`;

	const mailOptions = {
		from: '"Tweetie Bird 🦆" <notify@webscraper.com>',
		to: EMAILS.join(', '),
		subject: "Apartment Available!",
		text: messageText,
		html: messageHtml
	};

	// send mail with defined transport object
	await transporter.sendMail(mailOptions);
}
