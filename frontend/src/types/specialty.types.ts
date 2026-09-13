export interface ISpecialty {
    id: string;
    title: string;
    description?: string | null;
    icon?: string;
    isDeleted?: boolean;
    doctorSpecialties?: Array<{
        doctorId: string;
        specialtyId: string;
        doctor?: {
            id: string;
            name: string;
        };
    }>;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateSpecialtyPayload {
    title: string;
    description?: string;
}

export interface IUpdateSpecialtyPayload {
    title?: string;
    description?: string;
    icon?: string;
}
