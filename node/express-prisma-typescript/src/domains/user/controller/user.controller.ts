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

userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users: UserViewDTO[] = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json({ users })
})

userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json({ user })
})

userRouter.post('/me', BodyValidation(UpdateUserDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const updatedUser = await service.updateUser(userId, req.body)

  return res.status(HttpStatus.OK).json({ updatedUser })
})

userRouter.get('/me/profilePicture', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getProfilePicture(userId)

  return res.status(HttpStatus.OK).json({ user })
})

userRouter.post('/me/profilePicture', BodyValidation(UpdateUserDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const updateProfilePictureURL = await service.uploadProfilePicture(userId)

  return res.status(HttpStatus.OK).json({ updateProfilePictureURL })
})

userRouter.get('/:userId', async (req: Request, res: Response) => {
  const userId = req.params.userId

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json({ user })
})

userRouter.get('by_username/:username', async (req: Request, res: Response) => {
  const username = req.params.username

  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUsersByUsername(username, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json({ users })
})

userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK)
})
