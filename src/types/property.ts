export interface IProperty {
    id: string;
    name: string;
    description?: string;
    price: number;
    location: string;
    category: ICategory;
    owner: IOwner;
    agent: IAgent;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICategory {
    name: string;
    description?: string;
}

export interface IOwner {
    userId: string; // Reference to User.id
    name: string;
    contactInfo?: Record<string, any>;
}

export interface IAgent {
    userId: string; // Reference to User.id
    name: string;
    contactInfo?: Record<string, any>;
}
