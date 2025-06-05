import { Express } from 'express';
import kycRoutes from './kycRoutes';

export const setupRoutes = (app: Express) => {
  app.use('/api/v1/kyc', kycRoutes);
}; 