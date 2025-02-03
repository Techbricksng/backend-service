import Hapi from '@hapi/hapi';
import * as dotenv from 'dotenv';
import { PrismaClient, Role } from '@prisma/client'; // Import Role from Prisma client
import { userValidationSchema } from '../validations/userValidation';
import { paginationValidationSchema } from '../validations/paginationValidation';


dotenv.config();

const prisma = new PrismaClient();

const UserRoutePlugin: Hapi.Plugin<null> = {
    name: 'userRoute',
    register: async (server: Hapi.Server) => {
        server.app.prisma = prisma;

        server.route([
            {
                method: 'POST',
                path: '/api/v1/users',
                handler: createUserHandler,
                options: {
                    auth: false,
                    validate: { payload: userValidationSchema },
                },
            },
            {
                method: 'GET',
                path: '/api/v1/users',
                handler: fetchUsersHandler,
                options: { auth: false },
            },
            {
                method: 'GET',
                path: '/api/v1/users/{id}',
                handler: getUserByIdHandler,
                options: { auth: false },
            },
            {
                method: 'PUT',
                path: '/api/v1/users/{id}',
                handler: updateUserHandler,
                options: {
                    auth: false,
                    validate: { payload: userValidationSchema },
                },
            },
            {
                method: 'DELETE',
                path: '/api/v1/users/{id}',
                handler: deleteUserHandler,
                options: { auth: false },
            },
            {
                method: 'GET',
                path: '/api/v1/users/search',
                handler: searchUsersHandler,
                options: { auth: false },
            },
            {
                method: 'GET',
                path: '/api/v1/users/list',
                handler: listUsersHandler,
                options: {
                    auth: false,
                    validate: { query: paginationValidationSchema },
                },
            },
        ]);
    },
};

const createUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { firstName, lastName, email, photoUrl, role } = request.payload as { firstName: string; lastName: string; email: string; photoUrl: string; role: Role };
    
    try {
        const user = await prisma.user.create({
            data: { firstName, lastName, email, photoUrl, role }
        });
        return h.response({ version: '1.0.0', data: user }).code(201);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const fetchUsersHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    try {
        const users = await prisma.user.findMany();
        return h.response({ version: '1.0.0', data: users }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const getUserByIdHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { id } = request.params;
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return h.response({ version: '1.0.0', error: 'User not found' }).code(404);
        return h.response({ version: '1.0.0', data: user }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const updateUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { id } = request.params;
    const { firstName, lastName, email, photoUrl, role } = request.payload as { firstName?: string; lastName?: string; email?: string; photoUrl?: string; role?: Role };
    try {
        const updatedUser = await prisma.user.update({ where: { id }, data: { firstName, lastName, email, photoUrl, role } });
        return h.response({ version: '1.0.0', data: updatedUser }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const deleteUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { id } = request.params;
    try {
        await prisma.user.delete({ where: { id } });
        return h.response({ version: '1.0.0', message: 'User deleted successfully' }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const searchUsersHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { firstName, lastName, email, role } = request.query as { firstName?: string; lastName?: string; email?: string; role?: Role };
    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    firstName ? { firstName: { contains: firstName, mode: 'insensitive' } } : {},
                    lastName ? { lastName: { contains: lastName, mode: 'insensitive' } } : {},
                    email ? { email: { contains: email, mode: 'insensitive' } } : {},
                ],
                ...(role ? { role } : {})
            }
        });
        return h.response({ version: '1.0.0', data: users }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const listUsersHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const prisma = request.server.app.prisma as PrismaClient;
    const { firstName, lastName, email, role, sortBy, sortOrder, page, limit } = request.query as {
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: Role;
        sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt';
        sortOrder?: 'asc' | 'desc';
        page?: number;
        limit?: number;
    };
    try {
        const pageNum = Number(page) || 1;
        const pageSize = Number(limit) || 10;
        const skip = (pageNum - 1) * pageSize;
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    firstName ? { firstName: { contains: firstName, mode: 'insensitive' } } : {},
                    lastName ? { lastName: { contains: lastName, mode: 'insensitive' } } : {},
                    email ? { email: { contains: email, mode: 'insensitive' } } : {},
                    role ? { role } : {},
                ],
            },
            orderBy: sortBy
                ? { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' }
                : { createdAt: 'desc' },
            skip,
            take: pageSize,
        });
        const totalUsers = await prisma.user.count({
            where: {
                AND: [
                    firstName ? { firstName: { contains: firstName, mode: 'insensitive' } } : {},
                    lastName ? { lastName: { contains: lastName, mode: 'insensitive' } } : {},
                    email ? { email: { contains: email, mode: 'insensitive' } } : {},
                    role ? { role } : {},
                ],
            },
        });
        return h.response({
            version: '1.0.0',
            data: users,
            pagination: {
                totalUsers,
                totalPages: Math.ceil(totalUsers / pageSize),
                currentPage: pageNum,
                pageSize,
            },
        }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

export default UserRoutePlugin;
