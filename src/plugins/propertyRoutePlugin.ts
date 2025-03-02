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
            {
                method: 'POST',
                path: '/api/v1/properties/{id}/images',
                handler: uploadPropertyImagesHandler,
                options: {
                    auth: false,
                    payload: {
                        output: 'stream',
                        parse: true,
                        multipart: true,
                        maxBytes: 10 * 1024 * 1024, // Limit file size to 10MB
                    },
                },
            },
        ]);
    },
};

export const createPropertyHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { name, description, price, location, category, owner, agent, buildingInfo } = request.payload as any;

    try {
        const property = await prisma.property.create({
            data: {
                name,
                description,
                price,
                location,
                category, // Directly assign the category object
                owner,    // Directly assign the owner object
                agent,    // Directly assign the agent object
                buildingInfo: { // Directly assign the buildingInfo object
                    facilities: buildingInfo.facilities,
                    numberOfFloors: buildingInfo.numberOfFloors,
                    parkingSpaces: buildingInfo.parkingSpaces,
                },
            },
        });

        return h.response({ version: '1.0.0', data: property }).code(201);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const updatePropertyHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { id } = request.params;
    const { name, description, price, location, category, owner, agent, buildingInfo } = request.payload as any;

    try {
        const existingProperty = await prisma.property.findUnique({ where: { id } });
        if (!existingProperty) return h.response({ version: '1.0.0', error: 'Property not found' }).code(404);

        const updatedProperty = await prisma.property.update({
            where: { id },
            data: {
                name,
                description,
                price,
                location,
                category, // Directly assign the category object
                owner,    // Directly assign the owner object
                agent,    // Directly assign the agent object
                buildingInfo: { // Directly assign the buildingInfo object
                    facilities: buildingInfo.facilities,
                    numberOfFloors: buildingInfo.numberOfFloors,
                    parkingSpaces: buildingInfo.parkingSpaces,
                },
            },
        });

        return h.response({ version: '1.0.0', data: updatedProperty }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

export const fetchPropertiesHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    try {
        const properties = await prisma.property.findMany({
            include: {
                // Only include related models (e.g., `reviews` and `images`)
                reviews: true,
                images: true,
            },
        });

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
            include: {
                // Only include related models (e.g., `reviews` and `images`)
                reviews: true,
                images: true,
            },
        });

        if (!property) return h.response({ version: '1.0.0', error: 'Property not found' }).code(404);

        return h.response({ version: '1.0.0', data: property }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const deletePropertyHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { id } = request.params;

    try {
        const existingProperty = await prisma.property.findUnique({ where: { id } });
        if (!existingProperty) return h.response({ version: '1.0.0', error: 'Property not found' }).code(404);

        await prisma.property.delete({ where: { id } });

        return h.response({ version: '1.0.0', message: 'Property deleted successfully' }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

const uploadPropertyImagesHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { id } = request.params;
    const { payload } = request;

    try {
        if (!payload) return h.response({ error: 'No files uploaded' }).code(400);

        const images = await Promise.all(
            (Array.isArray(payload) ? payload : [payload]).map(async (file: any) => {
                const image = await prisma.image.create({ // Use `image` instead of `images`
                    data: {
                        url: file.path, // Replace with actual file storage URL
                        isDefault: false,
                        property: { connect: { id } },
                    },
                });
                return image;
            })
        );

        return h.response({ version: '1.0.0', data: images }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

export default PropertyRoutePlugin;
