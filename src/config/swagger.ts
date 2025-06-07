import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KYC API Documentation',
      version,
      description: 'API documentation for the KYC verification system',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://kyc-api-pf6f.onrender.com',
        description: 'Deployment server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        UserRegistration: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
            password: {
              type: 'string',
              minLength: 8,
            },
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user',
            },
          },
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
            password: {
              type: 'string',
            },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        KYCSubmission: {
          type: 'object',
          required: [
            'firstName',
            'lastName',
            'dateOfBirth',
            'nationality',
            'address',
            'phoneNumber',
            'email',
            'documentType',
            'documentNumber',
            'documentExpiryDate',
            'documentFrontUrl',
            'documentBackUrl',
            'selfieUrl',
          ],
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
            },
            nationality: {
              type: 'string',
            },
            address: {
              type: 'object',
              required: ['street', 'city', 'state', 'country', 'postalCode'],
              properties: {
                street: {
                  type: 'string',
                },
                city: {
                  type: 'string',
                },
                state: {
                  type: 'string',
                },
                country: {
                  type: 'string',
                },
                postalCode: {
                  type: 'string',
                },
              },
            },
            phoneNumber: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            documentType: {
              type: 'string',
              enum: ['passport', 'national_id', 'drivers_license'],
            },
            documentNumber: {
              type: 'string',
            },
            documentExpiryDate: {
              type: 'string',
              format: 'date',
            },
            documentFrontUrl: {
              type: 'string',
              format: 'uri',
            },
            documentBackUrl: {
              type: 'string',
              format: 'uri',
            },
            selfieUrl: {
              type: 'string',
              format: 'uri',
            },
          },
        },
        KYCResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
            },
            nationality: {
              type: 'string',
            },
            address: {
              type: 'object',
              required: ['street', 'city', 'state', 'country', 'postalCode'],
              properties: {
                street: {
                  type: 'string',
                },
                city: {
                  type: 'string',
                },
                state: {
                  type: 'string',
                },
                country: {
                  type: 'string',
                },
                postalCode: {
                  type: 'string',
                },
              },
            },
            phoneNumber: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            documentType: {
              type: 'string',
              enum: ['passport', 'national_id', 'drivers_license'],
            },
            documentNumber: {
              type: 'string',
            },
            documentExpiryDate: {
              type: 'string',
              format: 'date',
            },
            documentFrontUrl: {
              type: 'string',
              format: 'uri',
            },
            documentBackUrl: {
              type: 'string',
              format: 'uri',
            },
            selfieUrl: {
              type: 'string',
              format: 'uri',
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'approved', 'rejected', 'expired'],
            },
            verificationNotes: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        KYCStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'approved', 'rejected', 'expired'],
            },
            verificationNotes: {
              type: 'string',
            },
          },
        },
        DocumentResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            documentType: {
              type: 'string',
              enum: ['passport', 'national_id', 'proof_of_address', 'selfie'],
            },
            documentNumber: {
              type: 'string',
            },
            fileUrl: {
              type: 'string',
              format: 'uri',
            },
            status: {
              type: 'string',
              enum: ['pending', 'verified', 'rejected', 'expired'],
            },
            verificationNotes: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        DocumentStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'verified', 'rejected', 'expired'],
            },
            verificationNotes: {
              type: 'string',
            },
          },
        },
        RiskAssessmentCreate: {
          type: 'object',
          required: [
            'kycVerificationId',
            'overallRiskScore',
            'riskLevel',
            'riskFactors',
            'expiryDate',
          ],
          properties: {
            kycVerificationId: {
              type: 'string',
              format: 'uuid',
            },
            overallRiskScore: {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
            },
            riskFactors: {
              type: 'array',
              items: {
                type: 'object',
                required: ['type', 'description', 'score', 'details'],
                properties: {
                  type: {
                    type: 'string',
                    enum: [
                      'identity',
                      'document',
                      'behavioral',
                      'transactional',
                      'geographical',
                      'political',
                      'other',
                    ],
                  },
                  description: {
                    type: 'string',
                  },
                  score: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100,
                  },
                  details: {
                    type: 'object',
                  },
                },
              },
            },
            assessmentDate: {
              type: 'string',
              format: 'date-time',
            },
            expiryDate: {
              type: 'string',
              format: 'date-time',
            },
            assessmentNotes: {
              type: 'string',
            },
          },
        },
        RiskAssessmentResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            kycVerificationId: {
              type: 'string',
              format: 'uuid',
            },
            overallRiskScore: {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
            },
            riskFactors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: [
                      'identity',
                      'document',
                      'behavioral',
                      'transactional',
                      'geographical',
                      'political',
                      'other',
                    ],
                  },
                  description: {
                    type: 'string',
                  },
                  score: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100,
                  },
                  details: {
                    type: 'object',
                  },
                },
              },
            },
            assessmentDate: {
              type: 'string',
              format: 'date-time',
            },
            expiryDate: {
              type: 'string',
              format: 'date-time',
            },
            assessmentNotes: {
              type: 'string',
            },
            assessedBy: {
              type: 'string',
              format: 'uuid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
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
      },
      paths: {
        '/users/register': {
          post: {
            tags: ['Users'],
            summary: 'Register a new user',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserRegistration'
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'User registered successfully'
              },
              '400': {
                description: 'Invalid input data'
              }
            }
          }
        },
        '/users/login': {
          post: {
            tags: ['Users'],
            summary: 'Login user',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserLogin'
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Login successful',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        token: { type: 'string' },
                        user: { $ref: '#/components/schemas/UserResponse' }
                      }
                    }
                  }
                }
              },
              '401': {
                description: 'Invalid credentials'
              }
            }
          }
        }
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
  apis: [
    path.join(__dirname, '../routes/**/*.js'),
  ],
  swaggerOptions: {
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
};

const specs = swaggerJsdoc(options);

export const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'KYC API Documentation',
};

export const serveSwaggerUI = swaggerUi.serve;
export const setupSwaggerUI = swaggerUi.setup(specs, options.swaggerOptions); 