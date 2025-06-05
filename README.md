# KYC Verification System

A robust Know Your Customer (KYC) verification system built with Node.js, Express, TypeScript, and MySQL. This system provides comprehensive identity verification, document management, and risk assessment capabilities.

## Features

- User Authentication and Authorization
- KYC Verification Management
- Document Upload and Verification
- Risk Assessment and Scoring
- Role-based Access Control
- API Rate Limiting
- Comprehensive Logging
- Swagger API Documentation

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kyc-verification.git
cd kyc-verification
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kyc_verification
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880 # 5MB
```

4. Create the database:
```sql
CREATE DATABASE kyc_verification;
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start the development server:
```bash
npm run dev
```

## API Documentation

The API documentation is available at `/api/docs` when the server is running. It provides detailed information about all available endpoints, request/response schemas, and authentication requirements.

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── app.ts         # Express app setup
└── index.ts       # Application entry point
```

## Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build the project
- `npm start`: Start production server
- `npm run test`: Run tests
- `npm run lint`: Run ESLint
- `npm run migrate`: Run database migrations
- `npm run seed`: Seed the database with initial data

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- Helmet for security headers
- CORS configuration
- File upload restrictions

## Error Handling

The system implements a centralized error handling mechanism with:
- Custom error classes
- HTTP status codes
- Detailed error messages
- Error logging
- Client-friendly error responses

## Logging

The application uses Winston for logging with:
- Console and file logging
- Different log levels
- Request/response logging
- Error logging
- Performance monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@example.com or create an issue in the repository. 