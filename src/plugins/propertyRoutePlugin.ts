import Hapi from '@hapi/hapi';
import Joi from 'joi';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { propertyValidationSchema } from '../validations/propertyValidation';

dotenv.config();

const prisma = new PrismaClient();

const PropertyRoutePlugin: Hapi.Plugin<null> = {
    name: 'propertyRoute',
    register: async (server: Hapi.Server) => {
        server.app.prisma = prisma;

        server.route([
            {
                method: 'POST',
                path: '/api/v1/properties',
                handler: createPropertyHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: propertyValidationSchema,
                    },
                },
            },
            {
                method: 'GET',
                path: '/api/v1/properties',
                handler: fetchPropertiesHandler,
                options: { auth: false },
            },
            {
                method: 'GET',
                path: '/api/v1/properties/{id}',
                handler: getPropertyByIdHandler,
                options: {
                    auth: false,
                    validate: {
                        params: Joi.object({
                            id: Joi.string().required(),
                        }),
                    },
                },
            },
            {
                method: 'PUT',
                path: '/api/v1/properties/{id}',
                handler: updatePropertyHandler,
                options: {
                    auth: false,
                    validate: {
                        params: Joi.object({
                            id: Joi.string().required(),
                        }),
                        payload: propertyValidationSchema,
                    },
                },
            },
            {
                method: 'DELETE',
                path: '/api/v1/properties/{id}',
                handler: deletePropertyHandler,
                options: {
                    auth: false,
                    validate: {
                        params: Joi.object({
                            id: Joi.string().required(),
                        }),
                    },
                },
            },
        ]);
    },
};

const createPropertyHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { name, description, price, location, category, owner, agent } = request.payload as any;

    try {
        const property = await prisma.property.create({
            data: {
                name,
                description,
                price,
                location,
                category,
                owner,
                agent,
            },
        });
        return h.response({ version: '1.0.0', data: property }).code(201);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const fetchPropertiesHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    try {
        const properties = await prisma.property.findMany();
        return h.response({ version: '1.0.0', data: properties }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const getPropertyByIdHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { id } = request.params;
    try {
        const property = await prisma.property.findUnique({
            where: { id },
        });
        if (!property) return h.response({ version: '1.0.0', error: 'Property not found' }).code(404);
        return h.response({ version: '1.0.0', data: property }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const updatePropertyHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { id } = request.params;
    const { name, description, price, location, category, owner, agent } = request.payload as any;

    try {
        const updatedProperty = await prisma.property.update({
            where: { id },
            data: {
                name,
                description,
                price,
                location,
                category,
                owner,
                agent,
            },
        });
        return h.response({ version: '1.0.0', data: updatedProperty }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const deletePropertyHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { id } = request.params;
    try {
        await prisma.property.delete({ where: { id } });
        return h.response({ version: '1.0.0', message: 'Property deleted successfully' }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

export default PropertyRoutePlugin;