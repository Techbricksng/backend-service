import Hapi from '@hapi/hapi';
import Joi from 'joi';
import OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'; // Import Role from Prisma client
import { usersArraySchema, userValidationSchema } from '../validations/userValidation';
import { paginationValidationSchema } from '../validations/paginationValidation';
import { IUser } from '../types/user';
// @ts-ignore
import { Role } from '@prisma/client';

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
                    /* validate: { payload: userValidationSchema },*/
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
                options: { auth: false, validate: { params: { id: Joi.string() } } },
            },
            {
                method: 'PUT',
                path: '/api/v1/users/{id}',
                handler: updateUserHandler,
                options: {
                    auth: false,
                    validate: { payload: userValidationSchema, params: { id: Joi.string() } },
                },
            },
            {
                method: 'DELETE',
                path: '/api/v1/users/{id}',
                handler: deleteUserHandler,
                options: { auth: false, validate: { params: { id: Joi.string() } } },
            },
            {
                method: 'POST',
                path: '/api/v1/users/list',
                handler: listUsersHandler,
                options: {
                    auth: false,
                    validate: { query: paginationValidationSchema, payload: usersArraySchema },
                },
            },
            {
                method: 'POST',
                path: '/api/v1/users/register',
                handler: registerUsersHandler,
                options: { auth: false },
            },
            {
                method: 'POST',
                path: '/api/v1/users/verify',
                handler: verifyUsersHandler,
                options: { auth: false },
            },
        ]);
    },
};

const createUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    //TODO: Do we need this endpoint
    const { prisma } = request.server.app;
    const { firstName, lastName, email, photoUrl, role } = request.payload as {
        firstName: string;
        lastName: string;
        email: string;
        photoUrl: string;
        role: string;
    };

    try {
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                photoUrl,
                role: role.toUpperCase() as Role,
                otpSecret: 'placeHolderSecret',
                address: [],
            },
            select: {
                // Explicitly select fields (excludes otpSecret)
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                photoUrl: true,
                address: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return h.response({ version: '1.0.0', data: user }).code(201);
    } catch (error: any) {
        console.log(error);
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const fetchUsersHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    try {
        const users = await prisma.user.findMany({
            select: {
                // Explicitly select fields (excludes otpSecret)
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                photoUrl: true,
                address: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return h.response({ version: '1.0.0', data: users }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const getUserByIdHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { id } = request.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                // Explicitly select fields (excludes otpSecret)
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                photoUrl: true,
                address: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) return h.response({ version: '1.0.0', error: 'User not found' }).code(404);
        return h.response({ version: '1.0.0', data: user }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const updateUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { id } = request.params;
    const { firstName, lastName, email, photoUrl, role } = request.payload as {
        firstName?: string;
        lastName?: string;
        email?: string;
        photoUrl?: string;
        role?: string;
    };
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { firstName, lastName, email, photoUrl, role: role ? (role.toUpperCase() as Role) : undefined },
            select: {
                // Explicitly select fields (excludes otpSecret)
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                photoUrl: true,
                address: true,
                createdAt: true,
                updatedAt: true,
            },
        });
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

const listUsersHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const prisma = request.server.app.prisma as PrismaClient;
    const { firstName, lastName, email, role, sortBy, sortOrder, page, limit } = request.query as {
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: string;
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
                    role ? { role: role.toUpperCase() as Role } : {},
                ],
            },
            orderBy: sortBy ? { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' } : { createdAt: 'desc' },
            skip,
            take: pageSize,
            omit: { otpSecret: true },
        });
        const totalUsers = await prisma.user.count({
            where: {
                AND: [
                    firstName ? { firstName: { contains: firstName, mode: 'insensitive' } } : {},
                    lastName ? { lastName: { contains: lastName, mode: 'insensitive' } } : {},
                    email ? { email: { contains: email, mode: 'insensitive' } } : {},
                    role ? { role: role.toUpperCase() as Role } : {},
                ],
            },
        });
        return h
            .response({
                version: '1.0.0',
                data: users,
                pagination: {
                    dataCount: users.length,
                    totalPages: Math.ceil(totalUsers / pageSize),
                    currentPage: pageNum,
                    pageSize,
                },
            })
            .code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const registerUsersHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { email } = request.payload as { email?: string };
    try {
        const userExists = await prisma.user.findMany({ where: { email } });
        if (userExists.length > 0) throw new Error('User already exists');
        // Generate TOTP secret
        const totp = new OTPAuth.TOTP({
            issuer: 'HouseBankApp',
            label: email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
        });
        const secret = totp.secret.base32;
        await prisma.user.create({
            data: { email: email!, otpSecret: secret },
            select: {
                // Explicitly select fields (excludes otpSecret)
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                photoUrl: true,
                address: true,
                createdAt: true,
                updatedAt: true,
            },
        }); //TODO: Encrypt secret may be we use Bycrypt here
        // Generate QR Code
        const otpAuthURL = totp.toString();
        const qrCode = QRCode.toDataURL(otpAuthURL);
        return h.response({ version: '1.0.0', data: qrCode }).code(201);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const verifyUsersHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { email, otp } = request.query as { email?: string; otp: string };
    try {
        const userExists = await prisma.user.findMany({ where: { email } });
        if (userExists.length === 0) throw new Error('User does not exist!');
        const user = userExists[0] as unknown as IUser;
        if (!user.otpSecret) throw new Error('OTP Secret not found. Please enable two-factor authentication first.');
        const totp = new OTPAuth.TOTP({ secret: user['otpSecret'] }); //TODO: Bycrpt or any encryption
        const isValid = totp.validate({ token: otp, window: 1 });
        if (isValid !== null) return h.response({ message: 'Login successful' }).code(200);
        else throw new Error('Invalid OTP token');
        //return h.response({ version: '1.0.0', data: users }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

export default UserRoutePlugin;
