import { Request, Response, NextFunction } from 'express';
import { KYCService } from '../services/kycService';
import { KYCStatus } from '../models/KYCVerification';

export class KYCController {
  /**
   * @swagger
   * /api/v1/kyc/submit:
   *   post:
   *     summary: Submit KYC data for verification
   *     tags: [KYC]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - firstName
   *               - lastName
   *               - dateOfBirth
   *               - nationality
   *               - address
   *               - phoneNumber
   *               - email
   *               - documentType
   *               - documentNumber
   *               - documentExpiryDate
   *               - documentFrontUrl
   *               - documentBackUrl
   *               - selfieUrl
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               dateOfBirth:
   *                 type: string
   *                 format: date
   *               nationality:
   *                 type: string
   *               address:
   *                 type: object
   *                 required:
   *                   - street
   *                   - city
   *                   - state
   *                   - country
   *                   - postalCode
   *                 properties:
   *                   street:
   *                     type: string
   *                   city:
   *                     type: string
   *                   state:
   *                     type: string
   *                   country:
   *                     type: string
   *                   postalCode:
   *                     type: string
   *               phoneNumber:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               documentType:
   *                 type: string
   *               documentNumber:
   *                 type: string
   *               documentExpiryDate:
   *                 type: string
   *                 format: date
   *               documentFrontUrl:
   *                 type: string
   *                 format: uri
   *               documentBackUrl:
   *                 type: string
   *                 format: uri
   *               selfieUrl:
   *                 type: string
   *                 format: uri
   *     responses:
   *       200:
   *         description: KYC verification completed successfully
   *       400:
   *         description: Invalid input data
   *       503:
   *         description: External verification service unavailable
   */
  public static async submitKYC(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const kycData = { ...req.body, userId };
      const kycVerification = await KYCService.submitKYC(kycData);
      res.status(201).json({
        status: 'success',
        verification: kycVerification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/kyc/status/{id}:
   *   get:
   *     summary: Get KYC verification status
   *     tags: [KYC]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: KYC verification ID
   *     responses:
   *       200:
   *         description: KYC verification status retrieved successfully
   *       404:
   *         description: KYC verification not found
   */
  public static async getKYCStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const kycVerification = await KYCService.getKYCStatus(req.params.id);
      res.status(200).json({
        status: 'success',
        verification: kycVerification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get KYC verification details by ID
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   * @returns Promise<Response | void>
   */
  public static async getKYC(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Get KYC verification
      const kycVerification = await KYCService.getKYCStatus(id);
      
      // If verification not found
      if (!kycVerification) {
        return res.status(404).json({
          status: 'error',
          message: 'KYC verification not found'
        });
      }

      // Check if the user is authorized to view this verification
      if (kycVerification.userId !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to view this KYC verification'
        });
      }

      // Return successful response
      return res.status(200).json({
        status: 'success',
        verification: kycVerification
      });
    } catch (error) {
      // Pass error to error handling middleware
      return next(error);
    }
  }

  // List current user's KYC verifications
  public static async listUserKYC(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { verifications, total, pages } = await KYCService.getUserVerifications(userId, page, limit);
      res.json({ verifications, total, pages });
    } catch (error) {
      next(error);
    }
  }

  // Admin: list/search all KYC verifications
  public static async listAllKYC(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, type, startDate, endDate } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters: any = {};
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      const { verifications, total, pages } = await KYCService.getAllVerifications(filters, page, limit);
      res.json({ verifications, total, pages });
    } catch (error) {
      next(error);
    }
  }

  // Admin: update KYC verification status
  public static async updateKYCStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const verifiedBy = req.user!.id;
      const verification = await KYCService.updateVerificationStatus(id, status as KYCStatus, verifiedBy, notes);
      res.json({ message: 'KYC status updated', verification });
    } catch (error) {
      next(error);
    }
  }
} 