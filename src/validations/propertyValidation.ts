import Joi from 'joi';
import { ICategory, IOwner, IAgent } from '../types/property';

export const propertyValidationSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    price: Joi.number().positive().required(),
    location: Joi.string().required(),
    category: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().optional(),
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
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
});