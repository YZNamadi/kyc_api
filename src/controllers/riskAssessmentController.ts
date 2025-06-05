import { Request, Response } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import RiskAssessment, { RiskLevel, RiskFactorType } from '../models/RiskAssessment';
import { AppError } from '../utils/errorHandler';
import { Op } from 'sequelize';

// Create a new risk assessment
export const createAssessment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { 
    kycVerificationId,
    overallRiskScore,
    riskLevel,
    riskFactors,
    assessmentDate,
    expiryDate,
    assessmentNotes 
  } = req.body;

  // Validate risk level
  if (!Object.values(RiskLevel).includes(riskLevel)) {
    throw new AppError('Invalid risk level', 400);
  }

  // Validate risk factors
  if (!Array.isArray(riskFactors) || riskFactors.length === 0) {
    throw new AppError('At least one risk factor is required', 400);
  }

  riskFactors.forEach((factor: any) => {
    if (!factor.type || !factor.description || !factor.score || !factor.details) {
      throw new AppError('Invalid risk factor structure', 400);
    }
    if (!Object.values(RiskFactorType).includes(factor.type)) {
      throw new AppError(`Invalid risk factor type: ${factor.type}`, 400);
    }
  });

  const assessment = await RiskAssessment.create({
    userId,
    kycVerificationId,
    overallRiskScore,
    riskLevel,
    riskFactors,
    assessmentDate: assessmentDate || new Date(),
    expiryDate,
    assessmentNotes
  });

  res.status(201).json({ assessment });
});

// Get risk assessment by ID
export const getAssessment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const assessment = await RiskAssessment.findByPk(id);
  if (!assessment) throw new AppError('Risk assessment not found', 404);
  res.json({ assessment });
});

// List risk assessments for a user
export const listUserAssessments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  const { count, rows } = await RiskAssessment.findAndCountAll({
    where: { userId },
    limit,
    offset,
    order: [['assessmentDate', 'DESC']],
  });
  res.json({ assessments: rows, total: count, pages: Math.ceil(count / limit) });
});

// Admin: list/search all risk assessments
export const listAllAssessments = asyncHandler(async (req: Request, res: Response) => {
  const { riskLevel, startDate, endDate } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  const where: any = {};
  if (riskLevel) where.riskLevel = riskLevel;
  if (startDate || endDate) {
    where.assessmentDate = {};
    if (startDate) where.assessmentDate[Op.gte] = new Date(startDate as string);
    if (endDate) where.assessmentDate[Op.lte] = new Date(endDate as string);
  }
  const { count, rows } = await RiskAssessment.findAndCountAll({
    where,
    limit,
    offset,
    order: [['assessmentDate', 'DESC']],
  });
  res.json({ assessments: rows, total: count, pages: Math.ceil(count / limit) });
}); 