export enum MONTHS {
    JANUARY,
    FEBRUARY,
    MARCH,
    APRIL,
    MAY,
    JUNE,
    JULY,
    AUGUST,
    SEPTEMBER,
    OCTOBER,
    NOVEMBER,
    DECEMBER
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const monthToNum = (monthName: string) => MONTH_NAMES.indexOf(monthName);

export const month = (availableDate: string) => monthToNum(
    availableDate.trimStart().trimEnd().split(" ")[0]
);
export const day = (availableDate: string) => parseInt(
    availableDate.trimStart().trimEnd().split(" ")[1]
);
