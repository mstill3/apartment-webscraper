import {Firestore} from "@google-cloud/firestore";


// TODO: complete me
const db = async () => {
  const db = new Firestore({
    projectId: "apartment-webscraper",
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
  });

  const snapshot = await db.collection("users").get();
  snapshot.forEach((doc) => {
    console.log(doc.id + "=>" + doc.data());
  });
};

export default db;
