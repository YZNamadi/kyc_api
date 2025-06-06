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
            email: {
              type: 'string',
              format: 'email'
            },
            password: {
              type: 'string',
              minLength: 8
            },
            firstName: {
              type: 'string'
            },
            lastName: {
              type: 'string'
            }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email'
            },
            password: {
              type: 'string'
            }
          }
        },
        UserUpdate: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string'
            },
            lastName: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email'
            }
          }
        },
        PasswordUpdate: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: {
              type: 'string'
            },
            newPassword: {
              type: 'string',
              minLength: 8
            }
          }
        },
        UserStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended']
            }
          }
        },
        UserRoleUpdate: {
          type: 'object',
          required: ['role'],
          properties: {
            role: {
              type: 'string',
              enum: ['user', 'admin']
            }
          }
        },
        KYCSubmission: {
          type: 'object',
          required: ['personalInfo', 'addressInfo', 'identityInfo'],
          properties: {
            personalInfo: {
              type: 'object',
              required: ['firstName', 'lastName', 'dateOfBirth', 'nationality'],
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                dateOfBirth: { type: 'string', format: 'date' },
                nationality: { type: 'string' },
                phoneNumber: { type: 'string' }
              }
            },
            addressInfo: {
              type: 'object',
              required: ['street', 'city', 'country', 'postalCode'],
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                country: { type: 'string' },
                postalCode: { type: 'string' }
              }
            },
            identityInfo: {
              type: 'object',
              required: ['documentType', 'documentNumber', 'documentCountry'],
              properties: {
                documentType: { 
                  type: 'string',
                  enum: ['passport', 'national_id', 'drivers_license']
                },
                documentNumber: { type: 'string' },
                documentCountry: { type: 'string' },
                documentExpiryDate: { type: 'string', format: 'date' }
              }
            }
          }
        },
        KYCResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            status: { 
              type: 'string',
              enum: ['pending', 'approved', 'rejected']
            },
            personalInfo: {
              $ref: '#/components/schemas/KYCSubmission/properties/personalInfo'
            },
            addressInfo: {
              $ref: '#/components/schemas/KYCSubmission/properties/addressInfo'
            },
            identityInfo: {
              $ref: '#/components/schemas/KYCSubmission/properties/identityInfo'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        KYCStatus: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { 
              type: 'string',
              enum: ['pending', 'approved', 'rejected']
            },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        KYCStatusUpdate: {
          type: 'object',
          required: ['status', 'reason'],
          properties: {
            status: { 
              type: 'string',
              enum: ['approved', 'rejected']
            },
            reason: { type: 'string' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' }
          }
        },
        DocumentResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            documentType: { 
              type: 'string',
              enum: ['passport', 'national_id', 'proof_of_address', 'selfie']
            },
            status: { 
              type: 'string',
              enum: ['pending', 'verified', 'rejected']
            },
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
            status: { 
              type: 'string',
              enum: ['verified', 'rejected']
            },
            verificationNotes: { type: 'string' }
          }
        },
        RiskAssessmentCreate: {
          type: 'object',
          required: ['type', 'data'],
          properties: {
            type: {
              type: 'string',
              enum: ['identity', 'address', 'employment', 'financial']
            },
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
            type: {
              type: 'string',
              enum: ['identity', 'address', 'employment', 'financial']
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed']
            },
            score: { type: 'number' },
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high']
            },
            data: {
              type: 'object',
              properties: {
                source: { type: 'string' },
                reference: { type: 'string' },
                additionalInfo: { type: 'object' }
              }
            },
            results: {
              type: 'object',
              properties: {
                checks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      status: { type: 'string' },
                      details: { type: 'object' }
                    }
                  }
                },
                summary: { type: 'string' },
                recommendations: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { 
              type: 'string',
              enum: ['user', 'admin']
            },
            status: { 
              type: 'string',
              enum: ['active', 'inactive', 'suspended']
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts')
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
    showCommonExtensions: true
  }
};

export { specs, swaggerUi, swaggerUiOptions }; 