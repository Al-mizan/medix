import { UserStatus } from "./doctor.types";

export interface IAdminUser {
    id: string;
    email: string;
    role: "ADMIN" | "SUPER_ADMIN";
    status: UserStatus;
    needPasswordChange?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface IAdmin {
    id: string;
    userId: string;
    name: string;
    email: string;
    profilePhoto?: string | null;
    contactNumber?: string | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    user: IAdminUser;
}

export interface ICreateAdminPayload {
    password: string;
    admin: {
        name: string;
        email: string;
        contactNumber?: string;
        profilePhoto?: string;
    };
    role: "ADMIN" | "SUPER_ADMIN";
}

export interface IUpdateAdminPayload {
    admin: {
        name?: string;
        contactNumber?: string;
        profilePhoto?: string;
    };
}

export interface IChangeUserStatusPayload {
    userId: string;
    userStatus: UserStatus;
}

export interface IChangeUserRolePayload {
    userId: string;
    role: "ADMIN" | "SUPER_ADMIN";
}
