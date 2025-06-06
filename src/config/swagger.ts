import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// @ts-expect-error TS6133
const swaggerDocument = YAML.load(path.join(__dirname, '../../docs/swagger.yaml'));

// Update servers based on environment
const servers = [
  {
    url: process.env.NODE_ENV === 'production' 
      ? 'https://kyc-api-pf6f.onrender.com/api/v1'
      : 'http://localhost:3000/api/v1',
    description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
  }
];

const options = {
  definition: {
    ...swaggerDocument,
    servers,
    openapi: '3.0.0',
    components: {
      ...swaggerDocument.components,
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
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