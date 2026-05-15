import { Router } from 'express'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'
import * as messageController from '../controllers/message.controller'

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /messages:
 *   post:
 *     tags: [Messages]
 *     summary: Send a message to one or more platforms
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, platforms]
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Hola desde Notification Hub!"
 *               platforms:
 *                 type: array
 *                 example: ["DISCORD", "TELEGRAM"]
 *                 items:
 *                   type: string
 *                   enum: [DISCORD, TELEGRAM]
 *     responses:
 *       201:
 *         description: Message sent and persisted
 *       429:
 *         description: Daily limit exceeded
 */
router.post('/', messageController.sendMessage)

/**
 * @openapi
 * /messages:
 *   get:
 *     tags: [Messages]
 *     summary: Get your messages with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILED, PENDING]
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [DISCORD, TELEGRAM]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/', messageController.getMessages)

/**
 * @openapi
 * /messages/metrics:
 *   get:
 *     tags: [Admin]
 *     summary: Get metrics for all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics per user
 *       403:
 *         description: Admin access required
 */
router.get('/metrics', requireAdmin, messageController.getMetrics)

export default router