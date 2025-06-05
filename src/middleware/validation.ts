import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/errorHandler';
import { UserRole } from '../models/User';

// Validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      return next(new AppError(errorMessage, 400));
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  // User schemas
  user: {
    create: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      role: Joi.string().valid(...Object.values(UserRole)).default(UserRole.USER),
    }),
    update: Joi.object({
      firstName: Joi.string(),
      lastName: Joi.string(),
      password: Joi.string().min(8),
    }),
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  },

  // KYC Verification schemas
  kycVerification: {
    create: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      dateOfBirth: Joi.date().max('now').required(),
      nationality: Joi.string().required(),
      address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        postalCode: Joi.string().required(),
      }).required(),
      phoneNumber: Joi.string().required(),
      email: Joi.string().email().required(),
      documentType: Joi.string().required(),
      documentNumber: Joi.string().required(),
      documentExpiryDate: Joi.date().min('now').required(),
      documentFrontUrl: Joi.string().uri().required(),
      documentBackUrl: Joi.string().uri().required(),
      selfieUrl: Joi.string().uri().required(),
    }),
    update: Joi.object({
      status: Joi.string().valid('pending', 'in_progress', 'approved', 'rejected', 'expired'),
      verificationNotes: Joi.string(),
    }),
  },

  // Document schemas
  document: {
    create: Joi.object({
      kycVerificationId: Joi.string().uuid().required(),
      documentNumber: Joi.string().required(),
    }),
    update: Joi.object({
      status: Joi.string().valid('pending', 'verified', 'rejected', 'expired'),
      verificationNotes: Joi.string(),
    }),
  },

  // Risk Assessment schemas
  riskAssessment: {
    create: Joi.object({
      overallRiskScore: Joi.number().min(0).max(100).required(),
      riskLevel: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
      riskFactors: Joi.array().items(
        Joi.object({
          type: Joi.string().valid(
            'identity',
            'document',
            'behavioral',
            'transactional',
            'geographical',
            'political',
            'other'
          ).required(),
          description: Joi.string().required(),
          score: Joi.number().min(0).max(100).required(),
          details: Joi.object().required(),
        })
      ).required(),
      assessmentDate: Joi.date().required(),
      expiryDate: Joi.date().min('now').required(),
      assessmentNotes: Joi.string(),
    }),
    update: Joi.object({
      overallRiskScore: Joi.number().min(0).max(100),
      riskLevel: Joi.string().valid('low', 'medium', 'high', 'critical'),
      riskFactors: Joi.array().items(
        Joi.object({
          type: Joi.string().valid(
            'identity',
            'document',
            'behavioral',
            'transactional',
            'geographical',
            'political',
            'other'
          ),
          description: Joi.string(),
          score: Joi.number().min(0).max(100),
          details: Joi.object(),
        })
      ),
      assessmentNotes: Joi.string(),
    }),
  },
};
