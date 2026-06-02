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
        AuthUserResponse: {
          type: 'object',
          properties: {
            id:       { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
            username: { type: 'string', example: 'john_doe' },
            role:     { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
          },
          required: ['id', 'username', 'role'],
        },
        TokenResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
          required: ['token'],
        },
        DeliveryResponse: {
          type: 'object',
          properties: {
            id:               { type: 'string', format: 'uuid' },
            platform:         { type: 'string', enum: ['DISCORD', 'TELEGRAM', 'SLACK'] },
            status:           { type: 'string', enum: ['SUCCESS', 'FAILED', 'PENDING'] },
            providerResponse: { type: 'string', nullable: true },
            createdAt:        { type: 'string', format: 'date-time' },
          },
          required: ['id', 'platform', 'status', 'providerResponse', 'createdAt'],
        },
        MessageResponse: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            content:   { type: 'string', example: 'Hola desde Notification Hub!' },
            createdAt: { type: 'string', format: 'date-time' },
            deliveries: {
              type: 'array',
              items: { $ref: '#/components/schemas/DeliveryResponse' },
            },
          },
          required: ['id', 'content', 'createdAt', 'deliveries'],
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page:       { type: 'integer', example: 1 },
            limit:      { type: 'integer', example: 20 },
            total:      { type: 'integer', example: 45 },
            totalPages: { type: 'integer', example: 3 },
          },
          required: ['page', 'limit', 'total', 'totalPages'],
        },
        PaginatedMessageResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/MessageResponse' },
            },
            pagination: { $ref: '#/components/schemas/PaginationMeta' },
          },
          required: ['data', 'pagination'],
        },
        MetricResponse: {
          type: 'object',
          properties: {
            userId:          { type: 'string', format: 'uuid' },
            username:        { type: 'string', example: 'john_doe' },
            totalMessages:   { type: 'integer', example: 42 },
            remainingToday:  { type: 'integer', example: 58 },
          },
          required: ['userId', 'username', 'totalMessages', 'remainingToday'],
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
