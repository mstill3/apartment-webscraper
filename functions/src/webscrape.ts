import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import {Apartment} from "./interface";


const allApartments: Apartment[] = [];
const desiredApartments: Apartment[] = [];

const getApartmentsFromWebsite = async (
    URL: string,
    filter?: (apartment: Apartment) => boolean) => {
  // const response: { "models": Apartment[], "sent": number } =
  //       {"models": [], "sent": 0};
  const browser = await puppeteer.launch({args: ["--no-sandbox"]});
  const page = await browser.newPage();
  await page.goto(URL, {waitUntil: "networkidle2"});
  // await page.screenshot({path: 'page.png'});

  const html = await page.evaluate(() => document.body.innerHTML);
  const $ = cheerio.load(html);

  const apartmentDivList = $("div .model-info");
  apartmentDivList.each((index, apartmentDiv) => {
    const title = $(apartmentDiv)
        .find("h4")
        .text()
        .trim();

    const numBeds = parseInt(title.substring(0, title.indexOf(" ")));
    const numBaths = parseInt(title.substring(title.indexOf("| ") + 1,
        title.lastIndexOf(" ")));


    const available = $(apartmentDiv)
        .find("div .model-unavailable")
        .text()
        .trim() === "";

    const availabilityMessage = !available ?
            undefined :
            $(apartmentDiv)
                .find("div .model-available")
                .text()
                .trim();

    const unit = $($(apartmentDiv)
        .find("div .model-subtitle")[0])
        .text()
        .trim();

    const sqft = parseInt(
        $(apartmentDiv)
            .find("div .sqft")
            .text()
            .replace("Sq. Ft.", "")
            .replace("\n", "")
            .replace(",", "")
            .replace("SqFt", "")
            .trim()
    );

    const rent = !available ?
            undefined :
            parseInt($(apartmentDiv)
                .find("div .rent")
                .text()
                .replace("Rent \n", "")
                .replace("$", "")
                .replace(",", "")
                .trim());

    const availableDate = !available ?
            undefined :
            $(apartmentDiv)
                .find("div .available")
                .text()
                .replace("Available \n", "")
                .trim();

    const floor = !available ?
            undefined :
            $($(apartmentDiv)
                .find("div .floor"))
                .text()
                .replace("Floor \n", "")
                .trim();

    const term = !available ?
            undefined :
            $($(apartmentDiv)
                .find("div .term"))
                .text()
                .replace("Term \n", "")
                .trim();

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

    // console.log(apartment);
    allApartments.push(apartment);
    if (!filter || filter(apartment)) {
      desiredApartments.push(apartment);
    }
  });

  await browser.close();
  return [desiredApartments, allApartments];
};

export default getApartmentsFromWebsite;
