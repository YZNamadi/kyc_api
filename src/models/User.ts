import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

// User roles
export enum UserRole {
  ADMIN = 'admin',
  VERIFIER = 'verifier',
  USER = 'user'
}

// User status
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked'
}

// User attributes interface
export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// User creation attributes interface
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'lastLoginAt' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public role!: UserRole;
  public status!: UserStatus;
  public lastLoginAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Add associate method
  public static associate(models: any) {
    User.hasMany(models.KYCVerification, { foreignKey: 'userId', as: 'kycVerifications' });
    User.hasMany(models.Document, { foreignKey: 'userId', as: 'documents' });
    User.hasMany(models.RiskAssessment, { foreignKey: 'userId', as: 'riskAssessments' });
    User.hasMany(models.KYCVerification, { foreignKey: 'verifiedBy', as: 'verifiedKYC' });
    User.hasMany(models.Document, { foreignKey: 'verifiedBy', as: 'verifiedDocuments' });
    User.hasMany(models.RiskAssessment, { foreignKey: 'assessedBy', as: 'assessedRisks' });
  }

  // Method to compare password
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100], // Password must be between 8 and 100 characters
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50], // First name must be between 2 and 50 characters
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50], // Last name must be between 2 and 50 characters
      },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.USER,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      allowNull: false,
      defaultValue: UserStatus.ACTIVE,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['status'],
      },
    ],
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User; 