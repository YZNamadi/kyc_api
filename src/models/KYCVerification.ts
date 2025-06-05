import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

// KYC Verification status
export enum KYCStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// KYC Verification type
export enum KYCType {
  INDIVIDUAL = 'individual',
  CORPORATE = 'corporate'
}

// KYC Verification attributes interface
export interface KYCVerificationAttributes {
  id: string;
  userId: string;
  type: KYCType;
  status: KYCStatus;
  documentType: string;
  documentNumber: string;
  documentExpiryDate: Date;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  verificationData: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    phoneNumber: string;
    email: string;
  };
  riskScore: number;
  riskFactors: string[];
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// KYC Verification creation attributes interface
interface KYCVerificationCreationAttributes extends Optional<KYCVerificationAttributes, 'id' | 'verifiedBy' | 'verifiedAt' | 'createdAt' | 'updatedAt'> {}

class KYCVerification extends Model<KYCVerificationAttributes, KYCVerificationCreationAttributes> implements KYCVerificationAttributes {
  public id!: string;
  public userId!: string;
  public type!: KYCType;
  public status!: KYCStatus;
  public documentType!: string;
  public documentNumber!: string;
  public documentExpiryDate!: Date;
  public documentFrontUrl!: string;
  public documentBackUrl!: string;
  public selfieUrl!: string;
  public verificationData!: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    phoneNumber: string;
    email: string;
  };
  public riskScore!: number;
  public riskFactors!: string[];
  public verificationNotes!: string;
  public verifiedBy!: string;
  public verifiedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KYCVerification.init(
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
    type: {
      type: DataTypes.ENUM(...Object.values(KYCType)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(KYCStatus)),
      allowNull: false,
      defaultValue: KYCStatus.PENDING,
    },
    documentType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documentNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    documentExpiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    documentFrontUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documentBackUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    selfieUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verificationData: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    riskScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    riskFactors: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    verificationNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'kyc_verifications',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['documentNumber'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default KYCVerification; 