import {Firestore} from "@google-cloud/firestore";
import {Apartment} from "./interface";


const Database = class {
    private readonly firestore: Firestore;

    /**
     * Constructor for a Database
     * @param {string} authCredentials The path to the local google key file
     */
    constructor(authCredentials: string) {
      this.firestore = new Firestore({
        projectId: "apartment-webscraper",
        keyFilename: authCredentials,
      });
      this.firestore.settings({ignoreUndefinedProperties: true});
    }

    /**
     * Returns current apartments stored in the Database
     * @return {Apartment[]} apartments stored in the Database
     */
    async getApartments() {
      const snapshot = await this.firestore.collection("apartments").get();
      const apartments: Apartment[] = [];
      snapshot.forEach((doc) => {
        // console.log(doc.id + "=>" + doc.data());
        apartments.push({
          availabilityMessage: doc.data()["availabilityMessage"] || undefined,
          available: doc.data()["available"] || undefined,
          availableDate: doc.data()["availableDate"] || undefined,
          baths: doc.data()["baths"] || undefined,
          beds: doc.data()["beds"] || undefined,
          floor: doc.data()["floor"] || undefined,
          rent: doc.data()["rent"] || undefined,
          sqft: doc.data()["sqft"] || undefined,
          term: doc.data()["term"] || undefined,
          unit: doc.data()["unit"] || undefined,
          name: doc.data()["name"] || undefined,
        });
      });
      return apartments;
    }

    /**
     * Stores apartments in the Database
     * @param {Apartment[]} apartments to be stored in the Database
     */
    async saveApartments(apartments: Apartment[]) {
      return apartments.forEach(async (apartment) => {
        const docRef = this.firestore.collection("apartments")
            .doc(apartment.name);
        return await docRef.set(apartment);
      });
    }
};

export default Database;
