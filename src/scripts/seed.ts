import sequelize from '../config/database';
import User from '../models/User';
import KYCVerification from '../models/KYCVerification';
import Document from '../models/Document';
import RiskAssessment from '../models/RiskAssessment';
import { UserRole, UserStatus } from '../models/User';
import { KYCStatus, KYCType } from '../models/KYCVerification';
import { DocumentType, DocumentStatus } from '../models/Document';
import { RiskLevel, RiskFactorType } from '../models/RiskAssessment';
import { logger } from '../utils/logger';

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    logger.info('Database synced');

    // Create admin user
    await User.create({
      email: 'admin@example.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });
    logger.info('Admin user created');

    // Create verifier user
    const verifier = await User.create({
      email: 'verifier@example.com',
      password: 'Verifier123!',
      firstName: 'Verifier',
      lastName: 'User',
      role: UserRole.VERIFIER,
      status: UserStatus.ACTIVE,
    });
    logger.info('Verifier user created');

    // Create regular user
    const user = await User.create({
      email: 'user@example.com',
      password: 'User123!',
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });
    logger.info('Regular user created');

    // Create KYC verification
    const kycVerification = await KYCVerification.create({
      userId: user.id,
      type: KYCType.INDIVIDUAL,
      status: KYCStatus.PENDING,
      documentType: 'ID_CARD',
      documentNumber: 'ID123456',
      documentExpiryDate: new Date('2025-12-31'),
      documentFrontUrl: 'https://example.com/documents/front.jpg',
      documentBackUrl: 'https://example.com/documents/back.jpg',
      selfieUrl: 'https://example.com/documents/selfie.jpg',
      verificationData: {
        firstName: 'Regular',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        nationality: 'Nigerian',
        address: {
          street: '123 Main St',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          postalCode: '100001'
        },
        phoneNumber: '+2348012345678',
        email: 'user@example.com'
      },
      riskScore: 75,
      riskFactors: ['LOW_RISK'],
      verificationNotes: 'Initial verification',
      verifiedBy: verifier.id,
      verifiedAt: new Date(),
    });
    logger.info('KYC verification created');

    // Create documents
    await Document.bulkCreate([
      {
        userId: user.id,
        kycVerificationId: kycVerification.id,
        type: DocumentType.ID_CARD,
        status: DocumentStatus.PENDING,
        fileName: 'id_front.jpg',
        fileUrl: 'https://example.com/documents/id_front.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        metadata: {
          originalName: 'id_front.jpg',
          uploadDate: new Date(),
          documentNumber: 'ID123456',
        },
      },
      {
        userId: user.id,
        kycVerificationId: kycVerification.id,
        type: DocumentType.ID_CARD,
        status: DocumentStatus.PENDING,
        fileName: 'id_back.jpg',
        fileUrl: 'https://example.com/documents/id_back.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        metadata: {
          originalName: 'id_back.jpg',
          uploadDate: new Date(),
          documentNumber: 'ID123456',
        },
      },
      {
        userId: user.id,
        kycVerificationId: kycVerification.id,
        type: DocumentType.SELFIE,
        status: DocumentStatus.PENDING,
        fileName: 'selfie.jpg',
        fileUrl: 'https://example.com/documents/selfie.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        metadata: {
          originalName: 'selfie.jpg',
          uploadDate: new Date(),
        },
      },
    ]);
    logger.info('Documents created');

    // Create risk assessment
    await RiskAssessment.create({
      userId: user.id,
      kycVerificationId: kycVerification.id,
      overallRiskScore: 75,
      riskLevel: RiskLevel.LOW,
      riskFactors: [{
        type: RiskFactorType.DOCUMENT,
        description: 'Document quality assessment',
        score: 75,
        details: { quality: 'high', resolution: 'good', clarity: 'excellent' }
      }],
      assessmentDate: new Date(),
      expiryDate: new Date('2024-12-31'),
      assessmentNotes: 'Initial risk assessment',
      assessedBy: verifier.id,
    });
    logger.info('Risk assessment created');

    logger.info('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed(); 