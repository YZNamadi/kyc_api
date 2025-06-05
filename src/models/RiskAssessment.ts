import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import KYCVerification from './KYCVerification';

// Risk level enum
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Risk factor type enum
export enum RiskFactorType {
  IDENTITY = 'identity',
  DOCUMENT = 'document',
  BEHAVIORAL = 'behavioral',
  TRANSACTIONAL = 'transactional',
  GEOGRAPHICAL = 'geographical',
  POLITICAL = 'political',
  OTHER = 'other'
}

// Risk assessment attributes interface
export interface RiskAssessmentAttributes {
  id: string;
  userId: string;
  kycVerificationId: string;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  riskFactors: Array<{
    type: RiskFactorType;
    description: string;
    score: number;
    details: Record<string, any>;
  }>;
  assessmentDate: Date;
  expiryDate: Date;
  assessmentNotes?: string;
  assessedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Risk assessment creation attributes interface
interface RiskAssessmentCreationAttributes extends Optional<RiskAssessmentAttributes, 'id' | 'assessedBy' | 'createdAt' | 'updatedAt'> {}

class RiskAssessment extends Model<RiskAssessmentAttributes, RiskAssessmentCreationAttributes> implements RiskAssessmentAttributes {
  public id!: string;
  public userId!: string;
  public kycVerificationId!: string;
  public overallRiskScore!: number;
  public riskLevel!: RiskLevel;
  public riskFactors!: Array<{
    type: RiskFactorType;
    description: string;
    score: number;
    details: Record<string, any>;
  }>;
  public assessmentDate!: Date;
  public expiryDate!: Date;
  public assessmentNotes!: string;
  public assessedBy!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Add associate method
  public static associate(models: any) {
    RiskAssessment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    RiskAssessment.belongsTo(models.User, { foreignKey: 'assessedBy', as: 'assessor' });
    RiskAssessment.belongsTo(models.KYCVerification, { foreignKey: 'kycVerificationId', as: 'kycVerification' });
  }
}

RiskAssessment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    kycVerificationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: KYCVerification,
        key: 'id',
      },
    },
    overallRiskScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    riskLevel: {
      type: DataTypes.ENUM(...Object.values(RiskLevel)),
      allowNull: false,
    },
    riskFactors: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidRiskFactors(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('Risk factors must be an array');
          }
          value.forEach((factor: any) => {
            if (!factor.type || !factor.description || !factor.score || !factor.details) {
              throw new Error('Invalid risk factor structure');
            }
          });
        },
      },
    },
    assessmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    assessmentNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assessedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'risk_assessments',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['kycVerificationId'],
      },
      {
        fields: ['riskLevel'],
      },
      {
        fields: ['assessmentDate'],
      },
      {
        fields: ['expiryDate'],
      },
    ],
  }
);

export default RiskAssessment; 