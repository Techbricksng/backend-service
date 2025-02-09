
import Joi from 'joi';
import { IUserRole } from '../types/user';

export const signInValidationSchema = Joi.object({
    email: Joi.string().email().required().message('Please provide a valid email address'),
    password: Joi.string().min(6).required().message('Password must be at least 6 characters'),
});
