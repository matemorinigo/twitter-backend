import { NotFoundException } from '@utils/errors'
import { OffsetPagination } from 'types'
import { ExtendedUserDTO, UpdateUserDTO, UserViewDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import 'dotenvrc'

import s3 from '@utils/s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { FollowRepository } from '@domains/follower/repository/follow.repository'
import { FollowDTO } from '@domains/follower/dto'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository, private readonly followRepository: FollowRepository) {}

  async getUser (userId: string, searchedUser?: string): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return new UserViewDTO({ id: user.id, name: user.name, username: user.username, profilePicture: await this.getProfilePicture(userId) })
  }

  async updateUser (userId: string, data: UpdateUserDTO): Promise<UpdateUserDTO> {
    return await this.repository.updateUser(userId, data)
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserViewDTO[]> {
    // TODO: make this return only users followed by users the original user follows
    const userFollows: FollowDTO[] = await this.followRepository.getFollowing(userId)
    let allRecommendedUsers = await this.repository.getRecommendedUsersPaginated(options)
    if (userFollows.length > 0) {
      const recommendedUsers: ExtendedUserDTO[] = []
      for (const user of allRecommendedUsers) {
        if ((await this.isFollowedByAFollow(user.id, userFollows) || user.publicAccount) && user.id !== userId) { recommendedUsers.push(user) }
      }
      allRecommendedUsers = recommendedUsers
    }

    allRecommendedUsers = allRecommendedUsers.filter(user => user.id !== userId && user.publicAccount)

    return await Promise.all(allRecommendedUsers.map(async user => (new UserViewDTO({
      id: user.id,
      name: user.name,
      username: user.username,
      profilePicture: await this.getProfilePicture(user.id)
    }))))
  }

  async deleteUser (userId: any): Promise<void> {
    await this.repository.delete(userId)
  }

  async getProfilePicture (userId: string): Promise<string | null> {
    if (!await this.repository.userHasProfilePicture(userId)) { return null }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME ? process.env.AWS_BUCKET_NAME : '',
      Key: userId
    }

    const command = new GetObjectCommand(params)

    return await getSignedUrl(s3, command, { expiresIn: 3600 })
  }

  async uploadProfilePicture (userId: string): Promise<string> {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME ? process.env.AWS_BUCKET_NAME : '',
      Key: userId
    }

    const command = new PutObjectCommand(params)

    await this.repository.updateUser(userId, { profilePictureKey: userId })

    return await getSignedUrl(s3, command, { expiresIn: 3600 })
  }

  private async isFollowedByAFollow (userId: string, follows: FollowDTO[]): Promise<boolean> {
    for (const user of follows) {
      if (await this.followRepository.isFollowing(user.followedId, userId)) { return true }
    }

    return false
  }
}
