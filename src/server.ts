'use strict';

import Hapi, { Server } from '@hapi/hapi';
import * as dotenv from 'dotenv';
import prismaPlugin from './plugins/prisma';
import UserRoutePlugin from './plugins/userRoutePlugin';
import PropertyRoutePlugin from './plugins/propertyRoutePlugin';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import hapiAuthJwt from 'hapi-auth-jwt2';

import { PrismaClient } from '@prisma/client';

dotenv.config();

let server: Server;
const prisma = new PrismaClient();

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 50000,
        host: '0.0.0.0',
        routes: {
            validate: {
                options: {
                    abortEarly: false,
                },
            },
        },
    });

    // Register JWT plugin
    await server.register(hapiAuthJwt);

    // Define JWT strategy
    server.auth.strategy('jwt', 'jwt', {
        key: process.env.JWT_SECRET!,
        validate: async (decoded: any, request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            const prisma = request.server.app.prisma as PrismaClient;
            const user = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (!user) {
                return { isValid: false };
            }
            return { isValid: true, credentials: user };
        },
        verifyOptions: { algorithms: ['HS256'] },
    });

    // Set default authentication strategy
    server.auth.default('jwt');

    // Register other plugins and start the server
    await server.register([prismaPlugin, UserRoutePlugin, PropertyRoutePlugin]);
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();