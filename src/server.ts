'use strict';

import Hapi, { Server } from '@hapi/hapi';
import * as dotenv from 'dotenv';
import prismaPlugin from './plugins/prisma';
import UserRoutePlugin from './plugins/userRoutePlugin';
import PropertyRoutePlugin from './plugins/propertyRoutePlugin';
import Joi from 'joi';

dotenv.config();

let server: Server;

const init = async () => {
    server = Hapi.server({
        port: process.env.PORT || 50000,
        host: '0.0.0.0',
        routes: {
            validate: {
                options: {
                    abortEarly: false, // Optional: Allow multiple validation errors
                },
            },
        },
    });
    server.validator(Joi);

    await server.register(require('@hapi/inert'));

    //custom plugins
    await server.register([prismaPlugin, UserRoutePlugin, PropertyRoutePlugin]);

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true,
                index: true,
            },
        },
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
