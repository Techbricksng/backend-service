import Joi from 'joi';

export const paginationValidationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('firstName', 'lastName', 'email', 'createdAt').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
});
