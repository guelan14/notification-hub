import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.routes';
import errorHandler from './middlewares/error.handler';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);

// Endpoint de prueba de errores
app.get('/error-test', (_req, _res, next) => {
  const err = new (require('./errors/HttpError').default)('Esto es un error de prueba', 418, 'TEST_ERROR');
  next(err);
});

// Error handler (should be registered after routes)
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Notification Hub</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0f0f0f;
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { text-align: center; padding: 40px; }
          .badge {
            display: inline-block;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 20px;
            padding: 6px 16px;
            font-size: 13px;
            color: #888;
            margin-bottom: 32px;
          }
          h1 { font-size: 3rem; font-weight: 700; margin-bottom: 12px; }
          h1 span { color: #6366f1; }
          .subtitle { color: #666; font-size: 1.1rem; margin-bottom: 48px; }
          .links { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
          .btn {
            padding: 12px 28px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 500;
            text-decoration: none;
            transition: opacity 0.2s;
          }
          .btn:hover { opacity: 0.8; }
          .btn-primary { background: #6366f1; color: #fff; }
          .btn-secondary { background: #1a1a1a; color: #fff; border: 1px solid #333; }
          .footer { margin-top: 64px; color: #444; font-size: 13px; }
          .footer span { color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge"> REST API</div>
          <h1>Notification <span>Hub</span></h1>
          <p class="subtitle">Enviá mensajes a múltiples plataformas desde un solo lugar.</p>
          <div class="links">
            <a href="/docs" class="btn btn-primary">Ver documentación</a>
          </div>
          <div class="footer">
            Desarrollado por <span>Neumann Miguel Angel</span>
          </div>
        </div>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
});

export default app;
