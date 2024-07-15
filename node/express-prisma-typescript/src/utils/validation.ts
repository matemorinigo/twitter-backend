import { validate } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import { NotFoundException, ValidationException } from './errors'
import { plainToInstance } from 'class-transformer'
import { ClassType } from '@types'
import { FollowRepository } from '@domains/follower/repository/follow.repository'
import { UserRepository } from '@domains/user/repository'
import { PostRepository } from '@domains/post/repository'

export function BodyValidation<T> (target: ClassType<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.body = req.body.data ? plainToInstance(target, JSON.parse(req.body.data)) : plainToInstance(target, req.body)
    const errors = await validate(req.body, {
      whitelist: true,
      skipMissingProperties: true,
      forbidNonWhitelisted: true
    })

    if (errors.length > 0) { throw new ValidationException(errors.map(error => ({ ...error, target: undefined, value: undefined }))) }

    next()
  }
}

export class ValidatePostVisibility {
  constructor (private readonly followRepository: FollowRepository,
    private readonly userRepository: UserRepository, private readonly postRepository: PostRepository) {}

  async validateUserCanSeePost (userId: string, postId: string): Promise<boolean> {
    const post = await this.postRepository.getById(postId)

    if (!post) { throw new NotFoundException('post') }

    const author = await this.userRepository.getById(post.authorId)

    if (!author) { throw new NotFoundException('user') }
    return author.publicAccount || await this.followRepository.isFollowing(userId, author.id) || author.id === userId
  }

  async validateUserCanSeePosts (userId: string, authorId: string): Promise<boolean> {
    const author = await this.userRepository.getById(authorId)

    if (!author) { throw new NotFoundException('user') }

    return author.publicAccount || await this.followRepository.isFollowing(userId, author.id) || author.id === userId
  }
}
