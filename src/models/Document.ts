import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import KYCVerification from './KYCVerification';

// Document type
export enum DocumentType {
  ID_CARD = 'id_card',
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  SELFIE = 'selfie',
  OTHER = 'other'
}

// Document status
export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// Document attributes interface
export interface DocumentAttributes {
  id: string;
  userId: string;
  kycVerificationId: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  metadata: {
    originalName: string;
    uploadDate: Date;
    expiryDate?: Date;
    documentNumber?: string;
    issuingCountry?: string;
    issuingAuthority?: string;
  };
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Document creation attributes interface
interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id' | 'verifiedBy' | 'verifiedAt' | 'createdAt' | 'updatedAt'> {}

class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public id!: string;
  public userId!: string;
  public kycVerificationId!: string;
  public type!: DocumentType;
  public status!: DocumentStatus;
  public fileName!: string;
  public fileUrl!: string;
  public fileSize!: number;
  public mimeType!: string;
  public metadata!: {
    originalName: string;
    uploadDate: Date;
    expiryDate?: Date;
    documentNumber?: string;
    issuingCountry?: string;
    issuingAuthority?: string;
  };
  public verificationNotes!: string;
  public verifiedBy!: string;
  public verifiedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Document.init(
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
    type: {
      type: DataTypes.ENUM(...Object.values(DocumentType)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DocumentStatus)),
      allowNull: false,
      defaultValue: DocumentStatus.PENDING,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
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
    tableName: 'documents',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['kycVerificationId'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Document; 