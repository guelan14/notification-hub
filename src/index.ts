import express from 'express'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import authRoutes from './routes/auth.routes'
import messageRoutes from './routes/message.routes'
import { swaggerSpec } from './config/swagger'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/auth', authRoutes)
app.use('/messages', messageRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Swagger UI: http://localhost:${PORT}/docs`)
})

export default app