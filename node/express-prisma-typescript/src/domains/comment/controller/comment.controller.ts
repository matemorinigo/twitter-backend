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
 * /api/comment/:postId:
 *   get:
 *     summary: Get post comments paginated
 *     tags: [Comment]
 *     responses:
 *       200:
 *         description: Post comments paginated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       409:
 *         description: User already exists
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 code:
 *                   type: number
 *                   default: 400
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       property:
 *                         type: string
 *                       children:
 *                         type: array
 *                       constraints:
 *                         type: object
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

commentRouter.post('/:postId', BodyValidation(CreateCommentInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const comment = await service.comment(req.params.postId, userId, req.body)

  res.status(HttpStatus.OK).json({ comment })
})

commentRouter.get('/:postId/comment/:commentId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const comment = await service.getComment(req.params.postId, req.params.commentId, userId)
  res.status(HttpStatus.OK).json({ comment })
})
