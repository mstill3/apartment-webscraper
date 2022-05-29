import dotenv from "dotenv";
import * as GoogleFunctions from "firebase-functions";
import {equal} from "./compare";
import Database from "./database";
import {day, month, MONTHS} from "./date";
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
const GOOGLE_APPLICATION_CREDENTIALS =
    process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
const VERBOSE = false;


const isDesiredApartment = (apartment: Apartment) =>
  apartment.beds === 2 &&
    apartment.baths === 2 &&
    apartment.available &&
    month(apartment.availableDate!) >= MONTHS.JULY &&
    day(apartment.availableDate!) >= 6;


const main = (
    request?: GoogleFunctions.https.Request,
    response?: GoogleFunctions.Response
) => {
  const DEBUG = !response;
  getApartmentsFromWebsite(URL, isDesiredApartment)
      .then(([desiredApartments, allApartments]) => {
        console.log("Retrieved apartments from website");
        if (VERBOSE) {
          console.log(pretty(desiredApartments));
          console.log(pretty(allApartments));
        }

        const db = new Database(GOOGLE_APPLICATION_CREDENTIALS);
        console.log("Accessing Database...");
        db.getApartments()
            .then((previousApartments) => {
              console.log("Retrieved apartments from DB");
              if (VERBOSE) {
                console.log(pretty(previousApartments));
              }
              // eslint-disable-next-line max-len
              const filteredDesiredApartments = previousApartments.filter((previousApartment) => {
                return desiredApartments.some((desiredApartment) => {
                  return equal(previousApartment, desiredApartment);
                });
              });
              console.log("Filtered apartments");
              if (VERBOSE) {
                console.log(pretty(filteredDesiredApartments));
              }

              console.log("Storing to the Database...");
              db.saveApartments(desiredApartments)
                  .then((success) => {
                    console.log("Saved apartments to the DB");
                  }).catch((error) => {
                    console.error(error);
                  });

              if (filteredDesiredApartments.length === 0) {
                console.log("Skipping sending email");
              } else {
                console.log("Sending email...");
                const mailer = new Mailer(SENDER_EMAIL, SENDER_PASSWORD);
                mailer.sendEmail(filteredDesiredApartments, RECEIVER_EMAILS)
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
              }
            }).catch((error) => {
              console.error(error);
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
