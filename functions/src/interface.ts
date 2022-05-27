export interface Apartment {
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
