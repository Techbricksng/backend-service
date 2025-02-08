export interface IUser {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: IUserRole;
    photoUrl?: string;
    address?: IUserAddress[];
    otpSecret: string;
    createdAt?: Date;
    updatedAt?: Date;
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
    CUSTOMER,
    ACCOUNT,
    SALES,
    MANAGER,
}
