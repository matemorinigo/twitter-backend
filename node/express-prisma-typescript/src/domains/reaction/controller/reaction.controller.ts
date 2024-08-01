import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation, ValidatePostVisibility } from '@utils'
import { ReactBodyDTO } from '@domains/reaction/dto'
import { ReactionRepositoryImpl } from '@domains/reaction/repository/reaction.repository.impl'
import { ReactionServiceImpl } from '@domains/reaction/service/reaction.service.impl'
import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl'
import { UserRepositoryImpl } from '@domains/user/repository'
import { PostRepositoryImpl } from '@domains/post/repository'

export const reactionRouter = Router()

const service = new ReactionServiceImpl(new ReactionRepositoryImpl(db),
  new ValidatePostVisibility(new FollowRepositoryImpl(db), new UserRepositoryImpl(db),
    new PostRepositoryImpl(db)))

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
 *     ReactPostDTOC:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [LIKE, RETWEET]
 *         postId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *     ReactBodyDTO:
 *       type: object
 *       properties:
 *         type:
 *           type: string
             enum: [LIKE, RETWEET]
 *
 *
 *
 * /api/reaction/{postId}:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: React a post
 *     tags: [Reaction]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReactBodyDTO'
 *     responses:
 *       200:
 *         description: Post reacted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReactPostDTOC'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/notFoundException'
 */

reactionRouter.post('/:postId', BodyValidation(ReactBodyDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const reaction = await service.react(req.params.postId, userId, req.body.type)

  res.status(HttpStatus.OK).json(reaction)
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
 *     ReactPostDTOA:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           example: LIKE
 *         postId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *     ReactBodyDTO:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [LIKE, RETWEET]
 *
 *
 *
 * /api/reaction/likes/{postId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get post likes
 *     tags: [Reaction]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post likes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReactPostDTOA'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/notFoundException'
 */

reactionRouter.get('/likes/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const reactions = await service.likesByPost(req.params.postId, userId)

  res.status(HttpStatus.OK).json(reactions)
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
 *     ReactPostDTOB:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           example: RETWEET
 *         postId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *     ReactBodyDTO:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [LIKE, RETWEET]
 *
 *
 *
 * /api/reaction/retweets/{postId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get post retweets
 *     tags: [Reaction]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post retweets retrieved successfully successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReactPostDTOB'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/notFoundException'
 */

reactionRouter.get('/retweets/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const reactions = await service.retweetsByPost(req.params.postId, userId)

  res.status(HttpStatus.OK).json(reactions)
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
 *     ReactPostDTOA:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           example: LIKE
 *         postId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *     ReactBodyDTO:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [LIKE, RETWEET]
 *
 *
 *
 * /api/reaction/likes/by_user/{userId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get user likes
 *     tags: [Reaction]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User likes retrieved successfully successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReactPostDTOA'
 *       404:
 *         description: Likes not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/notFoundException'
 */

reactionRouter.get('/likes/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const reactions = await service.likesByUser(req.params.userId, userId)

  res.status(HttpStatus.OK).json(reactions)
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
 *     ReactPostDTOB:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           example: RETWEET
 *         postId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *     ReactBodyDTO:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [LIKE, RETWEET]
 *
 *
 *
 * /api/reaction/retweets/by_user/{userId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get user retweets
 *     tags: [Reaction]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retweets retrieved successfully successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReactPostDTOB'
 *       404:
 *         description: Retweets not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/notFoundException'
 */

reactionRouter.get('/retweets/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const reactions = await service.retweetsByUser(req.params.userId, userId)

  res.status(HttpStatus.OK).json(reactions)
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
 *     ReactPostDTOC:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [LIKE, RETWEET]
 *         postId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *     ReactBodyDTO:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [LIKE, RETWEET]
 *
 *
 *
 * /api/reaction/{postId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Unreact a post
 *     tags: [Reaction]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReactBodyDTO'
 *     responses:
 *       200:
 *         description: Post unreacted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReactPostDTOC'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/notFoundException'
 */


reactionRouter.delete('/:postId', BodyValidation(ReactBodyDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const reaction = await service.unreact(req.params.postId, userId, req.body.type)

  res.status(HttpStatus.OK).json(reaction)
})
