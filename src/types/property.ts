export interface IProperty {
    id: string;
    name: string;
    description: string | null;
    price: IPrice;
    location: string;
    category: ICategory;
    owner: IOwner;
    agent: IAgent;
    buildingInfo: IBuildingInfo;
    reviews: IReview[]; // Default empty array
    images: IImage[]; // Default empty array
    createdAt: Date;
    updatedAt: Date;
}

export interface IImage {
    id: string;
    url: string;
    isDefault: boolean;
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
    comment?: string | null;
    createdAt: Date;
    updatedAt: Date;
}