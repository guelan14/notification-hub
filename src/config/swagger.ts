import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notification Hub API',
      version: '1.0.0',
      description: 'API para enviar notificaciones a múltiples plataformas',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          additionalProperties: false,
          properties: {
            error: {
              description: 'Human-readable error message (or validation details).',
              oneOf: [{ type: 'string' }, { type: 'object' }],
            },
            code: {
              description: 'Stable, machine-readable error code.',
              type: 'string',
              example: 'AUTH_INVALID_CREDENTIALS',
            },
            details: {
              description: 'Optional extra details (usually only in non-production).',
              oneOf: [{ type: 'object' }, { type: 'array' }, { type: 'string' }, { type: 'number' }],
            },
            stack: {
              description: 'Stack trace (only in non-production environments).',
              type: 'string',
            },
          },
          required: ['error'],
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
