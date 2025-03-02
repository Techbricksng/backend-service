

export interface IProperty {
    id: string;
    name: string;
    description: string | null; // Change to `string | null`
    price: IPrice;
    location: string;
    category: ICategory;
    owner: IOwner;
    agent: IAgent;
    buildingInfo: IBuildingInfo;
    reviews: IReview[];
    images: IImage[];
    imageIds: string[]; // Ensure this field is included
    createdAt: Date;
    updatedAt: Date;
}

export interface IImage {
    id: string;
    url: string;
    isDefault: boolean;
    propertyId: string; // Reference to the Property this image belongs to
    property?: IProperty; // Optional, to reflect the bidirectional relationship
}

export interface ICategory {
    name: string;
    description?: string | null;
}

export interface IOwner {
    userId: string;
    name: string;
    contactInfo?: Record<string, any>;
}

export interface IAgent {
    userId: string;
    name: string;
    contactInfo?: Record<string, any>;
}

export interface IPrice {
    houseRent: number;
    electricityFee: number;
    damageFee: number;
    otherFee: number;
    total: number;
}

export interface IBuildingInfo {
    facilities: string[];
    numberOfFloors: number;
    parkingSpaces: number;
}

export interface IReview {
    id: string;
    userId: string;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}
