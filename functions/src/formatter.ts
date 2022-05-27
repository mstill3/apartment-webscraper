/* eslint-disable max-len */
import {Apartment} from "./interface";


const commaNumberFormat = new Intl.NumberFormat("en-US");

export const pretty = (object: any) =>
  JSON.stringify(object, null, 4);

export const stringify = (apartment: Apartment) => `
Unit:\t\t\t\t${apartment.unit}
Square Feet:\t\t${commaNumberFormat.format(apartment.sqft)}
${apartment.rent ? (`Rent:\t\t\t$${commaNumberFormat.format(apartment.rent || 0)}`) : ""}
Number of beds:\t${apartment.beds}
Number of baths:\t${apartment.baths}
${apartment.availableDate ? (`Available Date:\t\t\t${apartment.availableDate}`) : ""}
${apartment.term ? (`Term:\t\t\t${apartment.term}`) : ""}
${apartment.floor && apartment.floor !== "" ? (`Floor:\t\t${apartment.floor}`) : ""}`;

export const stringifyHTML = (apartment: Apartment) => `
    <b>Unit</b>: ${apartment.unit}<br/>
    <b>Square Feet</b>: ${commaNumberFormat.format(apartment.sqft)}<br/>
    ${apartment.rent ? (`<b>Rent</b>: ${commaNumberFormat.format(apartment.rent)}<br/>`) : ""}
    <b>Number of beds</b>: ${apartment.beds}<br/>
    <b>Number of baths</b>: ${apartment.baths}<br/>
    ${apartment.availableDate ? (`<b>Available Date</b>: ${apartment.availableDate}<br/>`) : ""}
    ${apartment.term ? (`<b>Term</b>: ${apartment.term}<br/>`) : ""}
    ${apartment.floor && apartment.floor !== "" ? (`<b>Floor</b>: ${apartment.floor}<br/>`) : ""}`;
