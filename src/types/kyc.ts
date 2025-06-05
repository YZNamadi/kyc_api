export interface KYCData {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
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
  documentType: string;
  documentNumber: string;
  documentExpiryDate: Date;
  documentFrontUrl: string;
  documentBackUrl: string;
  selfieUrl: string;
}

export interface VerificationResult {
  fullNameMatch: boolean;
  dobMatch: boolean;
  ninMatch: boolean;
  bvnMatch: boolean;
  emailMatch: boolean;
}

export interface RiskScore {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  details: {
    fullNameMatch: number;
    dobMatch: number;
    ninMatch: number;
    bvnMatch: number;
    emailMatch: number;
  };
}

export interface KYCVerification {
  id: string;
  kycData: KYCData;
  verificationResult: VerificationResult;
  riskScore: RiskScore;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
} 