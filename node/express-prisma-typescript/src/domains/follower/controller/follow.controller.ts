import { NextFunction, Request, Response, Router } from 'express'
import { FollowServiceImpl } from '@domains/follower/service/follow.service.impl'
import { FollowService } from '@domains/follower/service/follow.service'
import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl'
import { db } from '@utils'

export const followRouter = Router()

const service: FollowService = new FollowServiceImpl(new FollowRepositoryImpl(db))

followRouter.post('/follow/:id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const follow = await service.follow(userId, req.params.id)

  res.status(200).json({ follow })
})

followRouter.post('/unfollow/:id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const follow = await service.follow(userId, req.params.id)

  res.status(200).json({ follow })
})
