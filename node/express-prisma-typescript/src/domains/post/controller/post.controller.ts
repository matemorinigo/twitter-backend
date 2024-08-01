import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation, ValidatePostVisibility } from '@utils'

import { PostRepositoryImpl } from '../repository'
import { PostService, PostServiceImpl } from '../service'
import { AddMediaInputDTO, CreatePostInputDTO } from '../dto';
import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl'
import { UserRepositoryImpl } from '@domains/user/repository'
import { ReactionRepositoryImpl } from '@domains/reaction/repository/reaction.repository.impl';
import { CommentRepositoryImpl } from '@domains/comment/repository/comment.repository.impl';

export const postRouter = Router()

// Use dependency injection
const service: PostService = new PostServiceImpl(new PostRepositoryImpl(db),
  new FollowRepositoryImpl(db),
  new UserRepositoryImpl(db),
  new ValidatePostVisibility(new FollowRepositoryImpl(db), new UserRepositoryImpl(db),
    new PostRepositoryImpl(db)), new ReactionRepositoryImpl(db), new CommentRepositoryImpl(db))

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
 * /api/post/:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get latest posts paginated
 *     tags: [Post]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: before
 *         schema:
 *           type: integer
 *       - in: query
 *         name: after
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Latest posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExtendedPostDTO'
 *
 */

postRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, before, after } = req.query as Record<string, string>

  const posts = await service.getLatestPosts(userId, { limit: Number(limit), before, after })

  return res.status(HttpStatus.OK).json(posts)
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
 * /api/post/{postId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get post by id
 *     tags: [Post]
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExtendedPostDTO'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/notFoundException'
 *
 */

postRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  const post = await service.getPost(userId, postId)

  return res.status(HttpStatus.OK).json(post)
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
 * /api/post/by_user/{userId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get posts by author
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Posts by author retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExtendedPostDTO'
 *       404:
 *         description: Posts not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/notFoundException'
 *
 */

postRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: authorId } = req.params

  const posts = await service.getPostsByAuthor(userId, authorId)

  return res.status(HttpStatus.OK).json(posts)
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
 *     CreatePostInputDTO:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             image:
 *               type: string
 *           minItems: 0
 *           maxItems: 4
 *           nullable: true
 *     PostDTO:
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
 *
 *
 *
 * /api/post/:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new post
 *     tags: [Post]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInputDTO'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostDTO'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */

postRouter.post('/', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const data = req.body

  const post = await service.createPost(userId, data)

  return res.status(HttpStatus.CREATED).json(post)
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
 *     conflictExceptionB:
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
 *               default: 'File types allowed: jpg, jpeg, png'
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
 *     AddMediaInputDTO:
 *       type: object
 *       properties:
 *         fileType:
 *           type: string
 *     CreateUrlDTO:
 *       type: object
 *       properties:
 *         putObjectUrl:
 *           type: string
 *           format: url
 *         objectUrl:
 *           type: string
 *           format: url
 *
 *
 * /api/post/add_media:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Get a link to upload media
 *     tags: [Post]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInputDTO'
 *     responses:
 *       200:
 *         description: Upload media url retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateUrlDTO'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 *       409:
 *         description: That file type is not allowed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/conflictExceptionB'
 */

postRouter.post('/add_media', BodyValidation(AddMediaInputDTO), async (req: Request, res: Response) => {
  const data = req.body

  const urls = await service.getUploadMediaPresignedUrl(data)

  return res.status(HttpStatus.CREATED).json({ urls })
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
 *     forbiddenException:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           default: Forbidden. You are not allowed to perform this action
 *         code:
 *           type: number
 *           default: 403
 *     notFoundException:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           default: Not found
 *         code:
 *           type: number
 *           default: 404
 *     PostDTO:
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
 *
 *
 *
 * /api/post/{postId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a post
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Deleted post 60c36e14-4252-4865-886e-161e4839a13a
 *       404:
 *         description: Posts not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/notFoundException'
 *       403:
 *         description: User is not post author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/forbiddenException'
 */

postRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await service.deletePost(userId, postId)

  return res.status(HttpStatus.OK).send(`Deleted post ${postId}`)
})
