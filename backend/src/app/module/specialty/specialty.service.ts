import { Prisma, Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IqueryParams } from "../../interface/query.interface";
import { specialtyFilterableFields, specialtyIncludeConfig, specialtySearchableFields } from "./specialty.constant";

const createSpecialty = async (payload: Specialty): Promise<Specialty> => {
    
    const specialty = await prisma.specialty.create({
        data: payload,
    });

    return specialty;
}

const getAllSpecialties = async (query: IqueryParams) => {
    const queryBuilder = new QueryBuilder<Specialty, Prisma.SpecialtyWhereInput, Prisma.SpecialtyInclude>(
        prisma.specialty,
        query,
        {
            searchableFields: specialtySearchableFields,
            filterableFields: specialtyFilterableFields,
        }
    );

    const result = await queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
        })
        .dynamicInclude(specialtyIncludeConfig)
        .paginate()
        .sort()
        .fields()
        .execute();

    return result;
}

const deleteSpecialty = async (id: string): Promise<Specialty> => {
    const specialty = await prisma.specialty.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        }
    });
    return specialty;
}

const updateSpecialty = async (id: string, payload: Partial<Specialty>): Promise<Specialty> => {
    const specialty = await prisma.specialty.update({
        where: { id },
        data: payload,
    });
    return specialty;
}

export const SpecialtyService = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
    updateSpecialty,
}