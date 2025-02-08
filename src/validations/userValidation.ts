import Joi from 'joi';
import { IUserRole } from '../types/user';

export const userValidationSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    photoUrl: Joi.string().uri().optional(),
    role: Joi.string()
        .valid(...Object.values(IUserRole))
        .required(),
});

export const usersArraySchema = Joi.array().items(userValidationSchema).min(1);
