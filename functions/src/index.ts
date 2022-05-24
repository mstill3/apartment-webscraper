import * as cheerio from "cheerio";
import dotenv from "dotenv";
import * as GCP from "firebase-functions";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";


dotenv.config();

// URL of the page we want to scrape
const URL = process.env.WEB_URL || "https://www.wexley100.com/models";

const DESIRED_NUM_BEDS = process.env.DESIRED_NUM_BEDS || "2";
const DESIRED_NUM_BATHS = process.env.DESIRED_NUM_BATHS || "2";

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

const main = () => {
  (async () => {
    const browser = await puppeteer.launch({args: ["--no-sandbox"]});
    const page = await browser.newPage();
    await page.goto(URL, {waitUntil: "networkidle2"});
    // await page.screenshot({path: 'page.png'});

    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(html);

    const models = $("div .model-info");
    models.each((index, model) => {
      const title = $(model).find("h4").text().trim();
      const numBeds = parseInt(title.substring(0, title.indexOf(" ")));
      const numBaths = parseInt(title.substring(title.indexOf("| ") + 1,
          title.lastIndexOf(" ")));

      const available = $(model).find("div .model-unavailable").text()
          .trim() === "";
      const availabilityMessage = !available ? undefined : $(model)
          .find("div .model-available").text().trim();

      const unit = $($(model).find("div .model-subtitle")[0]).text().trim();

      const sqft = parseInt(
          $(model).find("div .sqft").text()
              .replace("Sq. Ft.", "")
              .replace("\n", "")
              .replace(",", "")
              .replace("SqFt", "")
              .trim()
      );

      const rent = !available ? undefined : parseInt($(model)
          .find("div .rent").text()
          .replace("Rent \n", "")
          .replace("$", "")
          .replace(",", "").trim());
      const availableDate = !available ? undefined : $(model)
          .find("div .available").text()
          .replace("Available \n", "").trim();
      const floor = !available ? undefined : $($(model)
          .find("div .floor")).text()
          .replace("Floor \n", "").trim();
      const term = !available ? undefined : $($(model)
          .find("div .term")).text()
          .replace("Term \n", "").trim();

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
        term,
      };
      console.log(apartment);
      if (apartment.beds === parseInt(DESIRED_NUM_BEDS) &&
                apartment.baths === parseInt(DESIRED_NUM_BATHS) &&
                apartment.available) {
        sendMail(apartment).catch(console.error);
      }
    });

    await browser.close();
  })();
};


// async..await is not allowed in global scope, must use a wrapper
const sendMail = async (apartment: Apartment) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDING_EMAIL,
      pass: process.env.SENDING_PASSWORD,
    },
  });

  // Create our number formatter.
  const commaNumberFormat = new Intl.NumberFormat("en-US");

  const messageText = `
Unit:\t\t\t\t${apartment.unit}
Square Feet:\t\t${commaNumberFormat.format(apartment.sqft)}
Rent:\t\t\t$${commaNumberFormat.format(apartment.rent || 0)}
Number of beds:\t${apartment.beds}
Number of baths:\t${apartment.baths}
Date:\t\t\t${apartment.availableDate}
Term:\t\t\t${apartment.term} 
Floor:\t\t${apartment.floor}`;

  const messageHtml = `
    <b>Unit</b>: ${apartment.unit}<br/>
    <b>Square Feet</b>: ${commaNumberFormat.format(apartment.sqft)}<br/>
    <b>Rent</b>: $${commaNumberFormat.format(apartment.rent || 0)}<br/>
    <b>Number of beds</b>: ${apartment.beds}<br/>
    <b>Number of baths</b>: ${apartment.baths}<br/>
    <b>Date</b>: ${apartment.availableDate}<br/>
    <b>Term</b>: ${apartment.term}<br/>
    <b>Floor</b>: ${apartment.floor}`;

  const mailOptions = {
    from: "\"Tweetie Bird 🦆\" <notify@webscraper.com>",
    to: process.env.SEND_TO_EMAILS,
    subject: "Apartment Available!",
    text: messageText,
    html: messageHtml,
  };

  // send mail with defined transport object
  await transporter.sendMail(mailOptions);
};

// For GCP
const TOPIC = "trigger-webscraper";
export const webscrape = GCP.runWith({
  timeoutSeconds: 3 * 60,
  memory: "8GB",
}).pubsub.topic(TOPIC)
    .onPublish((message: GCP.pubsub.Message) => {
      main();
    });

main();
