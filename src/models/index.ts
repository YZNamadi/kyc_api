import User from './User';
import KYCVerification from './KYCVerification';
import Document from './Document';
import RiskAssessment from './RiskAssessment';

// Define model relationships
User.hasMany(KYCVerification, { foreignKey: 'userId', as: 'kycVerifications' });
User.hasMany(Document, { foreignKey: 'userId', as: 'documents' });
User.hasMany(RiskAssessment, { foreignKey: 'userId', as: 'riskAssessments' });

KYCVerification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
KYCVerification.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });
KYCVerification.hasMany(Document, { foreignKey: 'kycVerificationId', as: 'documents' });
KYCVerification.hasMany(RiskAssessment, { foreignKey: 'kycVerificationId', as: 'riskAssessments' });

Document.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Document.belongsTo(KYCVerification, { foreignKey: 'kycVerificationId', as: 'kycVerification' });
Document.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

RiskAssessment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
RiskAssessment.belongsTo(KYCVerification, { foreignKey: 'kycVerificationId', as: 'kycVerification' });
RiskAssessment.belongsTo(User, { foreignKey: 'assessedBy', as: 'assessor' });

// Export models
export {
  User,
  KYCVerification,
  Document,
  RiskAssessment
};

// Export types and enums
export * from './User';
export * from './KYCVerification';
export * from './Document';
export * from './RiskAssessment'; 