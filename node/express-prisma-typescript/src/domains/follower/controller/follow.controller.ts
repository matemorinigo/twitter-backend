import { Request, Response, Router } from 'express'
import { FollowServiceImpl } from '@domains/follower/service/follow.service.impl'
import { FollowService } from '@domains/follower/service/follow.service'
import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl'
import { db } from '@utils'
import HttpStatus from 'http-status'

import 'express-async-errors'
import { UserServiceImpl } from '@domains/user/service';
import { UserRepositoryImpl } from '@domains/user/repository';

export const followRouter = Router()

const service: FollowService = new FollowServiceImpl(new FollowRepositoryImpl(db),
  new UserServiceImpl(new UserRepositoryImpl(db)))

followRouter.post('/follow/:id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const follow = await service.follow(userId, req.params.id)

  res.status(HttpStatus.OK).json({ follow })
})

followRouter.post('/unfollow/:id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const follow = await service.follow(userId, req.params.id)

  res.status(HttpStatus.OK).json({ follow })
})
