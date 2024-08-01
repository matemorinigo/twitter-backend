import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation } from '@utils'
import { UserRepositoryImpl } from '@domains/user/repository'

import { AuthService, AuthServiceImpl } from '../service'
import { LoginInputDTO, SignupInputDTO } from '../dto'

export const authRouter = Router()

// Use dependency injection
const service: AuthService = new AuthServiceImpl(new UserRepositoryImpl(db))

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     conflictExceptionA:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           default: Conflict
 *         code:
 *           type: number
 *           default: 409
 *         errors:
 *           type: object
 *           properties:
 *             error_code:
 *               type: string
 *               default: USER_ALREADY_EXISTS
 *     SignupInputDTO:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *       required:
 *         - email
 *         - username
 *         - password
 *     token:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *     validationError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         code:
 *           type: number
 *           default: 400
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               property:
 *                 type: string
 *               children:
 *                 type: array
 *               constraints:
 *                 type: object
 *
 *
 *
 * /api/auth/signup:
 *   post:
 *     summary: Register a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInputDTO'
 *     responses:
 *       201:
 *         description: User registered and logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/token'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/conflictExceptionA'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 *
 */

authRouter.post('/signup', BodyValidation(SignupInputDTO), async (req: Request, res: Response) => {
  const data = req.body

  const token = await service.signup(data)

  return res.status(HttpStatus.CREATED).json(token)
})

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     LoginInputDTO:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *       required:
 *         - password
 *       oneOf:
 *         - required: [email]
 *         - required: [username]
 *     token:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *     validationError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         code:
 *           type: number
 *           default: 400
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               property:
 *                 type: string
 *               children:
 *                 type: array
 *               constraints:
 *                 type: object
 *
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInputDTO'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/token'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */

authRouter.post('/login', BodyValidation(LoginInputDTO), async (req: Request, res: Response) => {
  const data = req.body

  const token = await service.login(data)

  return res.status(HttpStatus.OK).json(token)
})
