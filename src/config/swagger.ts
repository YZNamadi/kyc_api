import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KYC API Documentation',
      version: '1.0.0',
      description: 'API documentation for the KYC verification system',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
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
            'selfieUrl'
          ],
          properties: {
            firstName: { type: 'string', minLength: 2, maxLength: 50 },
            lastName: { type: 'string', minLength: 2, maxLength: 50 },
            dateOfBirth: { type: 'string', format: 'date' },
            nationality: { type: 'string' },
            address: {
              type: 'object',
              required: ['street', 'city', 'state', 'country', 'postalCode'],
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                country: { type: 'string' },
                postalCode: { type: 'string' }
              }
            },
            phoneNumber: { type: 'string' },
            email: { type: 'string', format: 'email' },
            documentType: { type: 'string' },
            documentNumber: { type: 'string' },
            documentExpiryDate: { type: 'string', format: 'date' },
            documentFrontUrl: { type: 'string', format: 'uri' },
            documentBackUrl: { type: 'string', format: 'uri' },
            selfieUrl: { type: 'string', format: 'uri' }
          }
        },
        KYCResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['individual', 'corporate'] },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            documentType: { type: 'string' },
            documentNumber: { type: 'string' },
            documentExpiryDate: { type: 'string', format: 'date' },
            documentFrontUrl: { type: 'string', format: 'uri' },
            documentBackUrl: { type: 'string', format: 'uri' },
            selfieUrl: { type: 'string', format: 'uri' },
            verificationData: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                dateOfBirth: { type: 'string', format: 'date' },
                nationality: { type: 'string' },
                address: {
                  type: 'object',
                  properties: {
                    street: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    country: { type: 'string' },
                    postalCode: { type: 'string' }
                  }
                },
                phoneNumber: { type: 'string' },
                email: { type: 'string', format: 'email' }
              }
            },
            riskScore: { type: 'number', minimum: 0, maximum: 100 },
            riskFactors: { type: 'array', items: { type: 'string' } },
            verificationNotes: { type: 'string' },
            verifiedBy: { type: 'string', format: 'uuid' },
            verifiedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        KYCStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['pending', 'in_progress', 'approved', 'rejected', 'expired'] },
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
      }
    }
  },
  apis: [
    path.join(__dirname, '../routes/**/*.ts'),
    path.join(__dirname, '../controllers/**/*.ts')
  ],
};

export const specs = swaggerJsdoc(options);

export const swaggerUiOptions = {
  explorer: true,
  showCommonExtensions: true,
  tryItOutEnabled: true,
  docExpansion: 'list',
  filter: true,
  tagsSorter: 'alpha',
  operationsSorter: 'alpha'
};

export { swaggerUi }; 