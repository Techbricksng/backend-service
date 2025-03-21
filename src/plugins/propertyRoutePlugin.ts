import Hapi from '@hapi/hapi';
import Joi from 'joi';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { propertyValidationSchema } from '../validations/propertyValidation';
import jwt from 'jsonwebtoken';

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
                    auth: 'jwt', // Protect this endpoint with JWT
                    validate: { payload: propertyValidationSchema },
                },
            },
            {
                method: 'GET',
                path: '/api/v1/properties',
                handler: fetchPropertiesHandler,
                options: { auth: 'jwt' }, // Protect this endpoint with JWT
            },
            {
                method: 'GET',
                path: '/api/v1/properties/{id}',
                handler: getPropertyByIdHandler,
                options: { auth: 'jwt', validate: { params: { id: Joi.string() } } },
            },
            {
                method: 'PUT',
                path: '/api/v1/properties/{id}',
                handler: updatePropertyHandler,
                options: {
                    auth: 'jwt',
                    validate: { params: { id: Joi.string() }, payload: propertyValidationSchema },
                },
            },
            {
                method: 'DELETE',
                path: '/api/v1/properties/{id}',
                handler: deletePropertyHandler,
                options: { auth: 'jwt', validate: { params: { id: Joi.string() } } },
            },
        ]);
    },
};

// Create Property Endpoint
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
                category,
                owner,
                agent,
                buildingInfo,
            },
        });

        return h.response({ version: '1.0.0', data: property }).code(201);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

// Get Many Properties with Filter and Sort
export const fetchPropertiesHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { location, minPrice, maxPrice, sortBy, order } = request.query;

    try {
        const filter: any = {};
        if (location) filter.location = location;
        if (minPrice) filter.price = { ...filter.price, gte: minPrice };
        if (maxPrice) filter.price = { ...filter.price, lte: maxPrice };

        const sort: any = {};
        if (sortBy && order) sort[sortBy] = order;

        const properties = await prisma.property.findMany({
            where: filter,
            orderBy: sort,
            include: {
                reviews: true,
                images: true,
            },
        });

        return h.response({ version: '1.0.0', data: properties }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

// Get One Property by ID
const getPropertyByIdHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { id } = request.params;

    try {
        const property = await prisma.property.findUnique({
            where: { id },
            include: {
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

// Update Property Endpoint
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
                category,
                owner,
                agent,
                buildingInfo,
            },
        });

        return h.response({ version: '1.0.0', data: updatedProperty }).code(200);
    } catch (error: any) {
        return h.response({ version: '1.0.0', error: error.message }).code(500);
    }
};

// Delete Property Endpoint
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

export default PropertyRoutePlugin;