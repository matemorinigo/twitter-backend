import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { BodyValidation, db } from '@utils'

import { UserRepositoryImpl } from '../repository'
import { UserService, UserServiceImpl } from '../service'
import { UpdateUserDTO, UserViewDTO } from '@domains/user/dto';
import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl';

export const userRouter = Router()

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db), new FollowRepositoryImpl(db))

/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     UserViewDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         profilePicture:
 *           type: string
 *           format: url
 *           nullable: true
 *
 *
 *
 * /api/user/:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get user recommendations paginated
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: skip
 *         name: before
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User recommendations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserViewDTO'
 *
 */

userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users: UserViewDTO[] = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json({ users })
})

/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     UserViewDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         profilePicture:
 *           type: string
 *           format: url
 *           nullable: true
 *
 *
 *
 * /api/user/me:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get your user view
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User view retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserViewDTO'
 *
 */

userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json({ user })
})

/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
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
 *     notFoundException:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           default: Not found
 *         code:
 *           type: number
 *           default: 404
 *     UpdateUserDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         publicAccount:
 *           type: boolean
 *         profilePictureKey:
 *           type: string
 *           nullable: true
 *
 *
 *
 * /api/user/me:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Update your profile
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDTO'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateUserDTO'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */

userRouter.post('/me', BodyValidation(UpdateUserDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const updatedUser = await service.updateUser(userId, req.body)

  return res.status(HttpStatus.OK).json({ updatedUser })
})

/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     notFoundException:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           default: Not found
 *         code:
 *           type: number
 *           default: 404
 *     UserViewDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         profilePicture:
 *           type: string
 *           format: url
 *           nullable: true
 *     ExtendedPostDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The post ID
 *         authorId:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             images:
 *               type: string
 *           minItems: 0
 *           maxItems: 4
 *         createdAt:
 *           type: string
 *           format: date-time
 *         author:
 *           $ref: '#components/schemas/UserViewDTO'
 *         qtyComments:
 *           type: number
 *           minimum: 0
 *         qtyLikes:
 *           type: number
 *           minimum: 0
 *         qtyRetweets:
 *           type: number
 *           minimum: 0
 *
 *
 *
 * /api/user/me/profilePicture:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get profile picture url
 *     tags: [User]
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Profile picture url retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: url
 *                   nullable: true
 *
 *
 */

userRouter.get('/me/profilePicture', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const url = await service.getProfilePicture(userId)

  return res.status(HttpStatus.OK).json({ url })
})

/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     profilePictureUrlDTO:
 *       type: object
 *       properties:
 *         updateProfilePictureURL:
 *           type: string
 *           format: url
 *
 * /api/user/me/profilePicture:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Get a link to upload media
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Upload media url retrieved successfully
 *         content:
 *           text/plain:
 *             schema:
 *               $ref: '#/components/schemas/profilePictureUrlDTO'
 */

userRouter.post('/me/profilePicture', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const updateProfilePictureURL = await service.uploadProfilePicture(userId)

  return res.status(HttpStatus.OK).json({ updateProfilePictureURL })
})

/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     notFoundException:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           default: Not found
 *         code:
 *           type: number
 *           default: 404
 *     UserViewDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         profilePicture:
 *           type: string
 *           format: url
 *           nullable: true
 *
 *
 *
 * /api/user/{userId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get user view
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User view retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserViewDTO'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/notFoundException'
 *
 */

userRouter.get('/:userId', async (req: Request, res: Response) => {
  const userId = req.params.userId

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json({ user })
})

/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     UserViewDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         profilePicture:
 *           type: string
 *           format: url
 *           nullable: true
 *
 *
 *
 * /api/user/by_username/{username}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get user recommendations paginated
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Users by username retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserViewDTO'
 *
 */

userRouter.get('/by_username/:username', async (req: Request, res: Response) => {
  const username = req.params.username

  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUsersByUsername(username, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json({ users })
})

/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *
 * /api/user/:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete your profile
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User deleted successfully
 *
 */

userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK)
})
