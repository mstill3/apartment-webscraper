import dotenv from "dotenv";
import * as GoogleFunctions from "firebase-functions";
import {pretty} from "./formatter";
import {Apartment} from "./interface";
import Mailer from "./mail";
import getApartmentsFromWebsite from "./webscrape";


dotenv.config();

// Environment Variables
const URL = process.env.WEB_URL || "https://www.wexley100.com/models";
const RECEIVER_EMAILS = process.env.RECEIVER_EMAILS || "";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "";
const SENDER_PASSWORD = process.env.SENDER_PASSWORD || "";
// const GOOGLE_APPLICATION_CREDENTIALS =
// process.env.GOOGLE_APPLICATION_CREDENTIALS || "";


const isDesiredApartment = (apartment: Apartment) =>
  apartment.beds === 2 && apartment.baths === 2 && !apartment.available;

const VERBOSE = true;

const main = (
    request?: GoogleFunctions.https.Request,
    response?: GoogleFunctions.Response
) => {
  const DEBUG = !response;
  getApartmentsFromWebsite(URL, isDesiredApartment)
      .then(([desiredApartments, allApartments]) => {
        if (VERBOSE) {
          console.log(pretty(desiredApartments));
          console.log(pretty(allApartments));
        }

        const mailer = new Mailer(SENDER_EMAIL, SENDER_PASSWORD);
        mailer.sendEmail(desiredApartments, RECEIVER_EMAILS)
            .then((success) => {
              if (DEBUG) {
                console.log("Sent email Successfully");
              } else {
                response.send(pretty(desiredApartments));
              }
            }).catch((error) => {
              if (DEBUG) {
                console.error(error);
              } else {
                response.send(error);
              }
            });
      }).catch((error) => {
        if (DEBUG) {
          console.error(error);
        } else {
          response.send(error);
        }
      });
};

// GCP
const runtimeOptions = {
  timeoutSeconds: 3 * 60,
  memory: "8GB",
} as const;


// For GCP
export const webscrape = GoogleFunctions
    .runWith(runtimeOptions)
    .https.onRequest((request, response) => {
      main(request, response);
    });


if (process.env.ENV === "DEVELOPMENT") {
  console.log("Running the program...");
  main();
}
