import Hapi from '@hapi/hapi';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const SigninRoutePlugin: Hapi.Plugin<null> = {
    name: 'signinRoute',
    register: async (server: Hapi.Server) => {
        server.app.prisma = prisma;

        server.route([
            {
                method: 'POST',
                path: '/api/v1/signin',
                handler: signinHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: Joi.object({
                            email: Joi.string().email().required(),
                        }),
                    },
                },
            },
        ]);
    },
};

const signinHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { email } = request.payload as { email: string };

    try {
        // Check if user exists
        const user = await prisma.user.findFirst({
            where: { email },
            select: {
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

        if (!user) {
            return h.response({
                version: '1.0.0',
                error: 'Invalid credentials',
            }).code(401);
        }

        // If user exists, return user data
        return h.response({
            version: '1.0.0',
            data: {
                user,
                message: 'Sign in successful'
            }
        }).code(200);

    } catch (error: any) {
        console.error('Signin error:', error);
        return h.response({
            version: '1.0.0',
            error: 'An error occurred during sign in'
        }).code(500);
    }
};

export default SigninRoutePlugin;