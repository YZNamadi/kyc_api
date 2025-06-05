import { KYCData } from '../types/kyc';
import { VerificationResult, RiskScore } from '../types/kyc';
import { riskScoringConfig } from '../config/riskScoring';
import { KYCVerification, KYCStatus, KYCType, Document, DocumentType, DocumentStatus, RiskAssessment, User } from '../models';
import { AppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

export class KYCService {
  private static async verifyWithExternalAPI(kycData: KYCData): Promise<VerificationResult> {
    try {
      // Simulate external API call with random delays and occasional failures
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));

      // Simulate API failure (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('External API temporarily unavailable');
      }

      // Mock verification logic
      return {
        fullNameMatch: this.calculateNameSimilarity(`${kycData.firstName} ${kycData.lastName}`, 'John Doe'),
        dobMatch: kycData.dateOfBirth === '1990-01-01',
        ninMatch: kycData.documentNumber === '12345678901',
        bvnMatch: kycData.documentNumber === '12345678901',
        emailMatch: kycData.email === 'john.doe@example.com',
      };
    } catch (error) {
      logger.error('External API verification failed:', error);
      throw new AppError('External verification service temporarily unavailable', 503);
    }
  }

  private static calculateNameSimilarity(name1: string, name2: string): boolean {
    // Simple name similarity check (can be enhanced with more sophisticated algorithms)
    const normalize = (name: string) => name.toLowerCase().replace(/\s+/g, '');
    const similarity = this.levenshteinDistance(normalize(name1), normalize(name2));
    return similarity >= 0.8; // 80% similarity threshold
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1, // substitution
            dp[i - 1][j] + 1, // deletion
            dp[i][j - 1] + 1 // insertion
          );
        }
      }
    }

    const maxLength = Math.max(m, n);
    return 1 - dp[m][n] / maxLength;
  }

  private static calculateRiskScore(verificationResult: VerificationResult): RiskScore {
    const details = {
      fullNameMatch: verificationResult.fullNameMatch ? riskScoringConfig.rules.fullNameMatch.weight : 0,
      dobMatch: verificationResult.dobMatch ? riskScoringConfig.rules.dobMatch.weight : 0,
      ninMatch: verificationResult.ninMatch ? riskScoringConfig.rules.ninMatch.weight : 0,
      bvnMatch: verificationResult.bvnMatch ? riskScoringConfig.rules.bvnMatch.weight : 0,
      emailMatch: verificationResult.emailMatch ? riskScoringConfig.rules.emailMatch.weight : 0,
    };

    const totalScore = Object.values(details).reduce((sum, score) => sum + score, 0);
    const maxPossibleScore = Object.values(riskScoringConfig.rules).reduce(
      (sum, rule) => sum + rule.weight,
      0
    );

    let level: 'LOW' | 'MEDIUM' | 'HIGH';
    if (totalScore >= riskScoringConfig.thresholds.LOW) {
      level = 'LOW';
    } else if (totalScore >= riskScoringConfig.thresholds.MEDIUM) {
      level = 'MEDIUM';
    } else {
      level = 'HIGH';
    }

    return {
      score: Math.round((totalScore / maxPossibleScore) * 100),
      level,
      details,
    };
  }

  public static async submitKYC(kycData: KYCData): Promise<KYCVerification> {
    try {
      // Check for existing document number
      const existingVerification = await KYCVerification.findOne({
        where: { documentNumber: kycData.documentNumber }
      });

      if (existingVerification) {
        throw new AppError('Document number already exists', 400);
      }

      const verificationResult = await this.verifyWithExternalAPI(kycData);
      const riskScore = this.calculateRiskScore(verificationResult);

      const kycVerification = await KYCVerification.create({
        userId: kycData.userId,
        type: KYCType.INDIVIDUAL,
        status: KYCStatus.PENDING,
        documentType: kycData.documentType,
        documentNumber: kycData.documentNumber,
        documentExpiryDate: kycData.documentExpiryDate,
        documentFrontUrl: kycData.documentFrontUrl,
        documentBackUrl: kycData.documentBackUrl,
        selfieUrl: kycData.selfieUrl,
        verificationData: {
          firstName: kycData.firstName,
          lastName: kycData.lastName,
          dateOfBirth: new Date(kycData.dateOfBirth),
          nationality: kycData.nationality,
          address: kycData.address,
          phoneNumber: kycData.phoneNumber,
          email: kycData.email,
        },
        riskScore: riskScore.score,
        riskFactors: Object.entries(riskScore.details)
          .filter(([_, score]) => score === 0)
          .map(([factor]) => factor),
        verificationNotes: '',
      });

      return kycVerification;
    } catch (error) {
      logger.error('KYC submission failed:', error);
      throw error;
    }
  }

  public static async getKYCStatus(id: string): Promise<KYCVerification> {
    const kycVerification = await KYCVerification.findByPk(id);
    if (!kycVerification) {
      throw new AppError('KYC verification not found', 404);
    }
    return kycVerification;
  }

  // Create a new KYC verification request
  static async createVerification(
    userId: string,
    verificationData: {
      type: KYCType;
      documentType: string;
      documentNumber: string;
      documentExpiryDate: Date;
      documentFrontUrl: string;
      documentBackUrl: string;
      selfieUrl: string;
    }
  ): Promise<KYCVerification> {
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check for existing pending verification
    const existingVerification = await KYCVerification.findOne({
      where: {
        userId,
        status: KYCStatus.PENDING,
      },
    });

    if (existingVerification) {
      throw new AppError('User already has a pending verification', 400);
    }

    // Create verification record
    const verification = await KYCVerification.create({
      userId,
      type: verificationData.type,
      status: KYCStatus.PENDING,
      documentType: verificationData.documentType,
      documentNumber: verificationData.documentNumber,
      documentExpiryDate: verificationData.documentExpiryDate,
      documentFrontUrl: verificationData.documentFrontUrl,
      documentBackUrl: verificationData.documentBackUrl,
      selfieUrl: verificationData.selfieUrl,
      verificationData: {
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: new Date(),
        nationality: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
        },
        phoneNumber: '',
        email: user.email,
      },
      riskScore: 0,
      riskFactors: [],
      verificationNotes: '',
    });

    // Create document records
    await Document.bulkCreate([
      {
        userId,
        kycVerificationId: verification.id,
        type: DocumentType.ID_CARD,
        status: DocumentStatus.PENDING,
        fileName: 'document_front',
        fileUrl: verificationData.documentFrontUrl,
        fileSize: 0,
        mimeType: 'image/jpeg',
        metadata: {
          originalName: 'document_front',
          uploadDate: new Date(),
          documentNumber: verificationData.documentNumber,
        },
      },
      {
        userId,
        kycVerificationId: verification.id,
        type: DocumentType.ID_CARD,
        status: DocumentStatus.PENDING,
        fileName: 'document_back',
        fileUrl: verificationData.documentBackUrl,
        fileSize: 0,
        mimeType: 'image/jpeg',
        metadata: {
          originalName: 'document_back',
          uploadDate: new Date(),
          documentNumber: verificationData.documentNumber,
        },
      },
      {
        userId,
        kycVerificationId: verification.id,
        type: DocumentType.SELFIE,
        status: DocumentStatus.PENDING,
        fileName: 'selfie',
        fileUrl: verificationData.selfieUrl,
        fileSize: 0,
        mimeType: 'image/jpeg',
        metadata: {
          originalName: 'selfie',
          uploadDate: new Date(),
        },
      },
    ]);

    return verification;
  }

  // Get verification by ID
  static async getVerificationById(id: string): Promise<KYCVerification> {
    const verification = await KYCVerification.findByPk(id, {
      include: [
        { model: User, as: 'user' },
        { model: Document, as: 'documents' },
        { model: RiskAssessment, as: 'riskAssessments' },
      ],
    });

    if (!verification) {
      throw new AppError('Verification not found', 404);
    }

    return verification;
  }

  // Update verification status
  static async updateVerificationStatus(
    id: string,
    status: KYCStatus,
    verifiedBy: string,
    notes?: string
  ): Promise<KYCVerification> {
    const verification = await KYCVerification.findByPk(id);
    if (!verification) {
      throw new AppError('Verification not found', 404);
    }

    await verification.update({
      status,
      verifiedBy,
      verifiedAt: new Date(),
      verificationNotes: notes,
    });

    // Update document statuses
    await Document.update(
      {
        status: status === KYCStatus.APPROVED ? DocumentStatus.VERIFIED : DocumentStatus.REJECTED,
        verifiedBy,
        verifiedAt: new Date(),
      },
      {
        where: { kycVerificationId: id },
      }
    );

    return verification;
  }

  // Get user's verification history
  static async getUserVerifications(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    verifications: KYCVerification[];
    total: number;
    pages: number;
  }> {
    const offset = (page - 1) * limit;

    const { count, rows } = await KYCVerification.findAndCountAll({
      where: { userId },
      include: [
        { 
          model: Document, 
          as: 'documents',
          required: false 
        },
        { 
          model: RiskAssessment, 
          as: 'riskAssessments',
          required: false 
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      verifications: rows,
      total: count,
      pages: Math.ceil(count / limit),
    };
  }

  // Get all verifications with filters
  static async getAllVerifications(
    filters: any,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    verifications: KYCVerification[];
    total: number;
    pages: number;
  }> {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.startDate) where.createdAt = { [Op.gte]: filters.startDate };
    if (filters.endDate) where.createdAt = { ...where.createdAt, [Op.lte]: filters.endDate };

    const { count, rows } = await KYCVerification.findAndCountAll({
      where,
      include: [
        { 
          model: User, 
          as: 'user',
          required: false 
        },
        { 
          model: Document, 
          as: 'documents',
          required: false 
        },
        { 
          model: RiskAssessment, 
          as: 'riskAssessments',
          required: false 
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      verifications: rows,
      total: count,
      pages: Math.ceil(count / limit),
    };
  }

  // Check verification expiry
  static async checkVerificationExpiry(): Promise<void> {
    const expiredVerifications = await KYCVerification.findAll({
      where: {
        status: KYCStatus.APPROVED,
        documentExpiryDate: {
          [Op.lt]: new Date(),
        },
      },
    });

    for (const verification of expiredVerifications) {
      await this.updateVerificationStatus(
        verification.id,
        KYCStatus.EXPIRED,
        'system',
        'Verification expired due to document expiry'
      );
    }
  }
} 