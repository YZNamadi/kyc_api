import User from './User';
import KYCVerification from './KYCVerification';
import Document from './Document';
import RiskAssessment from './RiskAssessment';
import sequelize from '../config/database';

// Initialize models
const models = {
  User,
  KYCVerification,
  Document,
  RiskAssessment
};

// Initialize associations
Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

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

// Export sequelize instance
export { sequelize }; 