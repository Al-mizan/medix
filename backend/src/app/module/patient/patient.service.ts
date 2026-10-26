import { Patient, Prisma } from "../../../generated/prisma/client";
import { UserStatus } from "../../../generated/prisma/enums";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import { IqueryParams } from "../../interface/query.interface";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { patientFilterableFields, patientIncludeConfig, patientSearchableFields } from "./patient.constant";
import { IUpdatePatientHealthDataPayload, IUpdatePatientProfilePayload } from "./patient.interface";
import { convertToDateTime } from "./patient.utils";

const updateMyProfile = async (user: IRequestUser, payload: IUpdatePatientProfilePayload) => {
    // throw new Error("This is an intentional error to test Sentry integration in the backend.");
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        },
        include: {
            patientHealthData: true,
            medicalReports: true,
        }
    });

    await prisma.$transaction(async (tx) => {
        if (payload.patientInfo) {
            await tx.patient.update({
                where: {
                    id: patientData.id
                },
                data: {
                    ...payload.patientInfo
                }
            });

            if (payload.patientInfo.name || payload.patientInfo.profilePhoto) {
                const userData = {
                    name: payload.patientInfo.name ? payload.patientInfo.name : patientData.name,
                    image: payload.patientInfo.profilePhoto ? payload.patientInfo.profilePhoto : patientData.profilePhoto,
                }
                await tx.user.update({
                    where: {
                        id: patientData.userId
                    },
                    data: {
                        ...userData
                    }
                });
            };


        }

        if (payload.patientHealthData) {
            const healthDataToSave: IUpdatePatientHealthDataPayload = {
                ...payload.patientHealthData,
            };

            if (payload.patientHealthData.dateOfBirth) {
                healthDataToSave.dateOfBirth = convertToDateTime(
                    typeof healthDataToSave.dateOfBirth === "string" ? healthDataToSave.dateOfBirth : undefined
                ) as Date;
            }

            await tx.patientHealthData.upsert({
                where: {
                    patientId: patientData.id
                },
                update: healthDataToSave,
                create: {
                    patientId: patientData.id,
                    ...healthDataToSave
                }
            })
        }

        if (payload.medicalReports && Array.isArray(payload.medicalReports) && payload.medicalReports.length > 0) {
            for (const report of payload.medicalReports) {
                if (report.shouldDelete && report.reportId) {
                    const deletedReport = await tx.medicalReport.delete({
                        where: {
                            id: report.reportId,
                        }
                    });

                    if (deletedReport.reportLink) {
                        await deleteFileFromCloudinary(deletedReport.reportLink);
                    }
                } else if (report.reportName && report.reportLink) {
                    await tx.medicalReport.create({
                        data: {
                            patientId: patientData.id,
                            reportName: report.reportName,
                            reportLink: report.reportLink,
                        }
                    });
                }
            }
        }
    });

    const result = await prisma.patient.findUnique({
        where: {
            id: patientData.id
        },
        include: {
            user: true,
            patientHealthData: true,
            medicalReports: true,
        }
    });

    return result;
};

const getMyProfile = async (user: IRequestUser) => {
    const patient = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
        include: {
            user: true,
            patientHealthData: true,
            medicalReports: true,
        },
    });
    return patient;
};

const getAllPatients = async (query: IqueryParams) => {
    const queryBuilder = new QueryBuilder<Patient, Prisma.PatientWhereInput, Prisma.PatientInclude>(
        prisma.patient,
        query,
        {
            searchableFields: patientSearchableFields,
            filterableFields: patientFilterableFields,
        }
    );

    const result = await queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
        })
        .include({
            user: true,
            patientHealthData: true,
            medicalReports: true,
        })
        .dynamicInclude(patientIncludeConfig)
        .paginate()
        .sort()
        .fields()
        .execute();

    return result;
};

const getPatientById = async (id: string) => {
    const patient = await prisma.patient.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            user: true,
            patientHealthData: true,
            medicalReports: true,
            appointments: {
                include: {
                    doctor: true,
                    schedule: true,
                }
            },
        },
    });
    return patient;
};

const deletePatient = async (id: string) => {
    const patient = await prisma.patient.findUniqueOrThrow({
        where: { id },
    });

    const result = await prisma.$transaction(async (tx) => {
        const deletedPatient = await tx.patient.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        await tx.user.update({
            where: { id: patient.userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED,
            },
        });

        await tx.session.deleteMany({
            where: { userId: patient.userId },
        });

        return deletedPatient;
    });

    return result;
};

interface IAdminUpdatePatientPayload {
    name?: string;
    contactNumber?: string;
    address?: string;
    status?: UserStatus;
}

const adminUpdatePatient = async (id: string, payload: IAdminUpdatePatientPayload) => {
    const patient = await prisma.patient.findUniqueOrThrow({
        where: { id, isDeleted: false },
    });

    const result = await prisma.$transaction(async (tx) => {
        const patientUpdateData: Prisma.PatientUpdateInput = {};
        if (payload.name !== undefined) patientUpdateData.name = payload.name;
        if (payload.contactNumber !== undefined) patientUpdateData.contactNumber = payload.contactNumber;
        if (payload.address !== undefined) patientUpdateData.address = payload.address;

        const userUpdateData: Prisma.UserUpdateInput = {};
        if (payload.name !== undefined) userUpdateData.name = payload.name;
        if (payload.status !== undefined) userUpdateData.status = payload.status;

        if (Object.keys(userUpdateData).length > 0) {
            await tx.user.update({
                where: { id: patient.userId },
                data: userUpdateData,
            });

            if (payload.status === UserStatus.BLOCKED) {
                await tx.session.deleteMany({
                    where: { userId: patient.userId },
                });
            }
        }

        const updatedPatient = await tx.patient.update({
            where: { id },
            data: patientUpdateData,
            include: {
                user: true,
                patientHealthData: true,
                medicalReports: true,
            },
        });

        return updatedPatient;
    });

    return result;
};

export const PatientService = {
    updateMyProfile,
    getMyProfile,
    getAllPatients,
    getPatientById,
    deletePatient,
    adminUpdatePatient,
};