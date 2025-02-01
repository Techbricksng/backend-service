
export interface IUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: IUserRole;
    photoUrl: string;
    address: IUserAddress[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserAddress {
    id: string;
    street: string;
    building: string;
    postCode: string;
    country: IUserRole;
    city: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum IUserRole {
    ADMIN,
    TENANTS,
    ACCOUNT,
    SALES,
    MANAGER
}