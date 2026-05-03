import { errorResponse } from '@/lib/apiResponse';

/**
 * Validation middleware HOF.
 * Takes a schema object and validates request body before handler runs.
 *
 * Schema format:
 * {
 *   fieldName: { required: true, min: 3, max: 150, email: true, in: ['a','b'] }
 * }
 */
export function withValidation(handler, schema) {
  return async (request, context) => {
    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      const label = rules.label || field;

      if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors[field] = `${label} is required`;
        continue;
      }

      if (value && typeof value === 'string') {
        if (rules.min && value.trim().length < rules.min) {
          errors[field] = `${label} must be at least ${rules.min} characters`;
        }
        if (rules.max && value.trim().length > rules.max) {
          errors[field] = `${label} must be at most ${rules.max} characters`;
        }
        if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[field] = `${label} must be a valid email`;
        }
        if (rules.in && !rules.in.includes(value)) {
          errors[field] = `${label} must be one of: ${rules.in.join(', ')}`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return errorResponse('Validation failed', 422, errors);
    }

    // Attach parsed + sanitized body
    request.validatedBody = {};
    for (const [field] of Object.entries(schema)) {
      if (body[field] !== undefined) {
        request.validatedBody[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
      }
    }

    return handler(request, context);
  };
}
