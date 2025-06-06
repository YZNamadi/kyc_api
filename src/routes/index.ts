import { Express } from 'express';
import userRoutes from './userRoutes';
import kycRoutes from './kycRoutes';
import documentRoutes from './documentRoutes';
import riskAssessmentRoutes from './riskAssessmentRoutes';
import adminRoutes from './adminRoutes';
import healthRouter from './health';

export const setupRoutes = (app: Express) => {
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/kyc', kycRoutes);
  app.use('/api/v1/documents', documentRoutes);
  app.use('/api/v1/risk-assessments', riskAssessmentRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/health', healthRouter);
}; 