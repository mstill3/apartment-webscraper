import {Apartment} from "./interface";


export const equal = (a1: Apartment, a2: Apartment) =>
  a1.name === a2.name &&
    a1.available === a2.available &&
    a1.beds === a2.beds &&
    a1.baths === a2.baths &&
    a1.term === a2.term &&
    a1.floor === a2.floor &&
    a1.availableDate === a2.availableDate &&
    a1.rent === a2.rent &&
    a1.sqft === a2.sqft &&
    a1.availabilityMessage === a2.availabilityMessage &&
    a1.unit === a2.unit;
