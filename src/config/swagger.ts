import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Load the base Swagger document
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

export { specs, swaggerUi }; 