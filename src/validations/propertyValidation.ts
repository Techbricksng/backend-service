import Joi from 'joi';
import { ICategory, IOwner, IAgent, IBuildingInfo, IPrice } from '../types/property';

export const propertyValidationSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(null),
    price: Joi.object({
        houseRent: Joi.number().positive().required(),
        electricityFee: Joi.number().positive().required(),
        damageFee: Joi.number().positive().required(),
        otherFee: Joi.number().positive().required(),
        total: Joi.number().positive().required(),
    }).required(),
    location: Joi.string().required(),
    category: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().optional().allow(null),
    }).required(),
    owner: Joi.object({
        userId: Joi.string().required(),
        name: Joi.string().required(),
        contactInfo: Joi.object().optional(),
    }).required(),
    agent: Joi.object({
        userId: Joi.string().required(),
        name: Joi.string().required(),
        contactInfo: Joi.object().optional(),
    }).required(),
    buildingInfo: Joi.object({
        facilities: Joi.array().items(Joi.string()).required(),
        numberOfFloors: Joi.number().positive().required(),
        parkingSpaces: Joi.number().positive().required(),
    }).required(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
});