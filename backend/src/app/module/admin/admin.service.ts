import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { Admin, Prisma } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IChangeUserRolePayload, IChangeUserStatusPayload, IUpdateAdminPayload } from "./admin.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IqueryParams } from "../../interface/query.interface";
import { adminFilterableFields, adminIncludeConfig, adminSearchableFields } from "./admin.constant";

const getAllAdmins = async (query: IqueryParams) => {
    const queryBuilder = new QueryBuilder<Admin, Prisma.AdminWhereInput, Prisma.AdminInclude>(
        prisma.admin,
        query,
        {
            searchableFields: adminSearchableFields,
            filterableFields: adminFilterableFields,
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
        })
        .dynamicInclude(adminIncludeConfig)
        .paginate()
        .sort()
        .fields()
        .execute();

    return result;
}

const getAdminById = async (id: string) => {
    const admin = await prisma.admin.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
        }
    })
    return admin;
}

const updateAdmin = async (id: string, payload: IUpdateAdminPayload, user: IRequestUser) => {
    const isAdminExist = await prisma.admin.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
        },
    });

    if (!isAdminExist) {
        throw new AppError(status.NOT_FOUND, "Admin Or Super Admin not found");
    }

    if (user.role === Role.ADMIN && isAdminExist.user.role === Role.SUPER_ADMIN) {
        throw new AppError(status.FORBIDDEN, "Admin user cannot update super admin user");
    }

    const { admin } = payload;

    const updatedAdmin = await prisma.admin.update({
        where: {
            id,
        },
        data: {
            ...admin,
        }
    });

    return updatedAdmin;
}

//soft delete admin user by setting isDeleted to true and also delete the user session and account
const deleteAdmin = async (id: string, user: IRequestUser) => {
    const isAdminExist = await prisma.admin.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
        },
    });

    if (!isAdminExist) {
        throw new AppError(status.NOT_FOUND, "Admin Or Super Admin not found");
    }

    if (isAdminExist.userId === user.userId) {
        throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
    }

    if (user.role === Role.ADMIN && isAdminExist.user.role === Role.SUPER_ADMIN) {
        throw new AppError(status.FORBIDDEN, "Admin user cannot delete super admin user");
    }

    const result = await prisma.$transaction(async (tx) => {
        await tx.admin.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        })

        await tx.user.update({
            where: { id: isAdminExist.userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED // Optional: you may also want to block the user
            },
        })

        await tx.session.deleteMany({
            where: { userId: isAdminExist.userId }
        })

        await tx.account.deleteMany({
            where: { userId: isAdminExist.userId }
        })

        const admin = await getAdminById(id);

        return admin;
    }
    )

    return result;
}

const changeUserStatus = async (user: IRequestUser, payload: IChangeUserStatusPayload) => {
    // 1. Super admin can change the status of any user (admin, doctor, patient). Except himself. He cannot change his own status.

    // 2. Admin can change the status of doctor and patient. Except himself. He cannot change his own status. He cannot change the status of super admin and other admin user.

    const isAdminExists = await prisma.admin.findUniqueOrThrow({
        where: {
            email: user.email
        },
        include: {
            user: true,
        }
    });

    const { userId, userStatus } = payload;


    const userToChangeStatus = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        }
    })

    const selfStatusChange = isAdminExists.userId === userId;

    if (selfStatusChange) {
        throw new AppError(status.BAD_REQUEST, "You cannot change your own status");
    };

    if (isAdminExists.user.role === Role.ADMIN && userToChangeStatus.role === Role.SUPER_ADMIN) {
        throw new AppError(status.BAD_REQUEST, "You cannot change the status of super admin. Only super admin can change the status of another super admin");
    }

    if (isAdminExists.user.role === Role.ADMIN && userToChangeStatus.role === Role.ADMIN) {
        throw new AppError(status.BAD_REQUEST, "You cannot change the status of another admin. Only super admin can change the status of another admin");
    }

    if (userStatus === UserStatus.DELETED) {
        throw new AppError(status.BAD_REQUEST, "You cannot set user status to deleted. To delete a user, you have to use role specific delete api. For example, to delete an doctor user, you have to use delete doctor api which will set the user status to deleted and also set isDeleted to true and also delete the user session and account");
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        }, data: {
            status: userStatus,
        }
    })

    return updatedUser;
}

const changeUserRole = async (user: IRequestUser, payload: IChangeUserRolePayload) => {
    // 1. Super admin can change the role of only other super admin and admin user. He cannot change his own role.

    // 2. Admin cannot change role of any user

    // 3. Role of Patient and Doctor user cannot be changed by anyone. If needed, they have to be deleted and recreated with new role.

    const isSuperAdminExists = await prisma.admin.findFirstOrThrow({
        where: {
            email: user.email,
            user: {
                role: Role.SUPER_ADMIN
            }
        },
        include: {
            user: true,
        }
    });

    const { userId, role } = payload;

    const userToChangeRole = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        }
    })

    const selfRoleChange = isSuperAdminExists.userId === userId;

    if (selfRoleChange) {
        throw new AppError(status.BAD_REQUEST, "You cannot change your own role");
    }

    if (userToChangeRole.role === Role.DOCTOR || userToChangeRole.role === Role.PATIENT) {
        throw new AppError(status.BAD_REQUEST, "You cannot change the role of doctor or patient user. If you want to change the role of doctor or patient user, you have to delete the user and recreate with new role");
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            role,
        }
    })

    return updatedUser;

}

export const AdminService = {
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    changeUserStatus,
    changeUserRole,
}