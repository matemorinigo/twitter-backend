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

reactionRouter.post('/:postId', BodyValidation(ReactBodyDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const reaction = await service.react(req.params.postId, userId, req.body.type)

  res.status(HttpStatus.OK).json({ reaction })
})

reactionRouter.get('/likes/:postId', BodyValidation(ReactBodyDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const reactions = await service.likesByPost(req.params.postId, userId)

  res.status(HttpStatus.OK).json({ reactions })
})

reactionRouter.get('/retweets/:postId', BodyValidation(ReactBodyDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const reactions = await service.retweetsByPost(req.params.postId, userId)

  res.status(HttpStatus.OK).json({ reactions })
})

reactionRouter.delete('/:postId', BodyValidation(ReactBodyDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const reaction = await service.unreact(req.params.postId, userId, req.body.type)

  res.status(HttpStatus.OK).json({ reaction })
})
