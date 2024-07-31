import { Router, Request, Response } from 'express';
import { BodyValidation, db, ValidatePostVisibility } from '@utils';
import { CreateCommentInputDTO } from '@domains/comment/dto';
import HttpStatus from 'http-status';
import { CommentServiceImpl } from '@domains/comment/service/comment.service.impl';
import { CommentService } from '@domains/comment/service/comment.service';
import { CommentRepositoryImpl } from '@domains/comment/repository/comment.repository.impl';
import { PostRepositoryImpl } from '@domains/post/repository';
import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl';
import { UserRepositoryImpl } from '@domains/user/repository';
import 'express-async-errors';
import { ReactionRepositoryImpl } from '@domains/reaction/repository/reaction.repository.impl';

export const commentRouter = Router();

const service: CommentService = new CommentServiceImpl(
  new CommentRepositoryImpl(db),
  new PostRepositoryImpl(db), new UserRepositoryImpl(db), new ReactionRepositoryImpl(db),
  new ValidatePostVisibility(new FollowRepositoryImpl(db), new UserRepositoryImpl(db), new PostRepositoryImpl(db))
);

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
 * /api/comments/{postId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get post comments paginated
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: The post ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post comments paginated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExtendedPostDTO'
 *       404:
 *         description: Post not found
 *
 */


commentRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const { limit, before, after } = req.query as Record<string, string>;

  const comment = await service.getPostCommentsPaginated(req.params.postId, userId, {
    limit: Number(limit),
    before,
    after
  })

  res.status(HttpStatus.OK).json({ comment })
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
 *     CreateCommentDTO:
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
 * /api/comments/{postId}:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Get post comments paginated
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: The post ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInputDTO'
 *     responses:
 *       201:
 *         description: Post commented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExtendedPostDTO'
 *       404:
 *         description: Post not found
 *
 */



commentRouter.post('/:postId', BodyValidation(CreateCommentInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const comment = await service.comment(req.params.postId, userId, req.body)

  res.status(HttpStatus.CREATED).json({ comment })
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
 * /api/comments/{postId}/comment/{commentId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get post comment
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: The post ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExtendedPostDTO'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/notFoundException'
 *
 */

commentRouter.get('/:postId/comment/:commentId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const comment = await service.getComment(req.params.postId, req.params.commentId, userId)
  res.status(HttpStatus.OK).json({ comment })
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
 *     CommentDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         postId:
 *           type: string
 *           format: uuid
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
 *               format: url
 *           minItems: 0
 *           maxItems: 4
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *
 *
 * /api/comments/{postId}/comment/{commentId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Get post comment
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: The post ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentDTO'
 *       404:
 *         description: Comment not found
 *       401:
 *         description: User is not post author
 *
 *
 *
 */


commentRouter.delete('/:postId/comment/:commentId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const comment = await service.deleteComment(req.params.postId, req.params.commentId, userId)
  res.status(HttpStatus.OK).json({ comment })
})
