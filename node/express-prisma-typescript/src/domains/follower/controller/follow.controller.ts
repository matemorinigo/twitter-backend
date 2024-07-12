import { Request, Response, Router } from 'express'
import { FollowServiceImpl } from '@domains/follower/service/follow.service.impl'
import { FollowService } from '@domains/follower/service/follow.service'
import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl'
import { db } from '@utils'
import HttpStatus from 'http-status'

import 'express-async-errors'
import { UserRepositoryImpl } from '@domains/user/repository'

export const followRouter = Router()

const service: FollowService = new FollowServiceImpl(new FollowRepositoryImpl(db),
  new UserRepositoryImpl(db))

/**
 * @swagger
 *
 * /api/follower/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags: [Follower]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User registered and logged successfully
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

followRouter.post('/follow/:id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const follow = await service.follow(userId, req.params.id)

  res.status(HttpStatus.OK).json({ follow })
})

followRouter.post('/unfollow/:id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const follow = await service.unfollow(userId, req.params.id)

  res.status(HttpStatus.OK).json({ follow })
})

followRouter.get('/following', async (req: Request, res: Response) =>{
  const { userId } = res.locals.context

  const following = await service.getFollowing(userId)

  res.status(HttpStatus.OK).json({ following })
})

followRouter.get('/followers', async (req: Request, res: Response) =>{
  const { userId } = res.locals.context

  const following = await service.getFollowers(userId)

  res.status(HttpStatus.OK).json({ following })
})