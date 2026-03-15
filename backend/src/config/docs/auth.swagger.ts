/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */

/**
 * @swagger
 * /api/auth/register-admin:
 *   post:
 *     tags: [Auth]
 *     summary: Register an admin user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Admin created
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     responses:
 *       200:
 *         description: User logged in
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh cookie
 *     responses:
 *       200:
 *         description: Token refreshed
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user and clear refresh cookie
 *     responses:
 *       200:
 *         description: Logged out
 */
