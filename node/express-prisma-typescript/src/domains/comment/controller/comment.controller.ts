import { Router, Request, Response } from 'express'
import {BodyValidation, db, ValidatePostVisibility} from '@utils'
import { CreateCommentInputDTO } from '@domains/comment/dto'
import HttpStatus from 'http-status'
import { CommentServiceImpl } from '@domains/comment/service/comment.service.impl'
import { CommentService } from '@domains/comment/service/comment.service'
import { CommentRepositoryImpl } from '@domains/comment/repository/comment.repository.impl'
import {PostRepositoryImpl} from "@domains/post/repository";
import {FollowRepositoryImpl} from "@domains/follower/repository/follow.repository.impl";
import {UserRepositoryImpl} from "@domains/user/repository";
import 'express-async-errors'

export const commentRouter = Router()

const service: CommentService = new CommentServiceImpl(new CommentRepositoryImpl(db), new PostRepositoryImpl(db), new ValidatePostVisibility(new FollowRepositoryImpl(db), new UserRepositoryImpl(db), new PostRepositoryImpl(db)))

commentRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const comment = await service.getPostComments(req.params.postId, userId)

  res.status(HttpStatus.OK).json({ comment })
})

commentRouter.post('/:postId/comment', BodyValidation(CreateCommentInputDTO), async (req: Request, res: Response)=> {
  const { userId } = res.locals.context

  const comment = await service.comment(req.params.postId, userId, req.body)

  res.status(HttpStatus.OK).json({ comment })
})

commentRouter.get('/:postId/comment/:commentId', async (req: Request, res: Response)=>{
  const { userId } = res.locals.context
  const comment = await service.getComment(req.params.postId, req.params.commentId, userId)
  res.status(HttpStatus.OK).json({ comment })
})