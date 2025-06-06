import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KYC Verification API',
      version: '1.0.0',
      description: 'API for KYC verification and risk assessment',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://kyc-api-pf6f.onrender.com/api/v1'
          : 'http://localhost:3000/api/v1',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        UserRegistration: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            firstName: { type: 'string' },
            lastName: { type: 'string' }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        KYCSubmission: {
          type: 'object',
          required: ['type', 'documentType', 'documentNumber', 'documentExpiryDate', 'documentFrontUrl', 'documentBackUrl', 'selfieUrl'],
          properties: {
            type: { type: 'string', enum: ['individual', 'corporate'] },
            documentType: { type: 'string' },
            documentNumber: { type: 'string' },
            documentExpiryDate: { type: 'string', format: 'date' },
            documentFrontUrl: { type: 'string' },
            documentBackUrl: { type: 'string' },
            selfieUrl: { type: 'string' }
          }
        },
        KYCResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            type: { type: 'string', enum: ['individual', 'corporate'] },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            documentType: { type: 'string' },
            documentNumber: { type: 'string' },
            documentExpiryDate: { type: 'string', format: 'date' },
            documentFrontUrl: { type: 'string' },
            documentBackUrl: { type: 'string' },
            selfieUrl: { type: 'string' },
            verificationNotes: { type: 'string' },
            verifiedBy: { type: 'string' },
            verifiedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        KYCStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['approved', 'rejected'] },
            verificationNotes: { type: 'string' }
          }
        },
        DocumentResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            documentType: { type: 'string', enum: ['passport', 'national_id', 'proof_of_address', 'selfie'] },
            status: { type: 'string', enum: ['pending', 'verified', 'rejected'] },
            fileUrl: { type: 'string' },
            description: { type: 'string' },
            verificationNotes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        DocumentStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['verified', 'rejected'] },
            verificationNotes: { type: 'string' }
          }
        },
        RiskAssessmentCreate: {
          type: 'object',
          required: ['type', 'data'],
          properties: {
            type: { type: 'string', enum: ['identity', 'address', 'employment', 'financial'] },
            data: {
              type: 'object',
              properties: {
                source: { type: 'string' },
                reference: { type: 'string' },
                additionalInfo: { type: 'object' }
              }
            }
          }
        },
        RiskAssessmentResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            type: { type: 'string', enum: ['identity', 'address', 'employment', 'financial'] },
            status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
            score: { type: 'number' },
            riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
            data: { type: 'object' },
            results: {
              type: 'object',
              properties: {
                checks: { type: 'array', items: { type: 'object' } },
                summary: { type: 'string' },
                recommendations: { type: 'array', items: { type: 'string' } }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            pages: { type: 'integer' }
          }
        }
      }
    }
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/**/*.ts')
  ]
};

const specs = swaggerJsdoc(options);

// Configure Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'KYC API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
    filter: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

export { specs, swaggerUi, swaggerUiOptions }; 