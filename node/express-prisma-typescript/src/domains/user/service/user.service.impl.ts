import { NotFoundException } from '@utils/errors'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UpdateUserDTO, UserViewDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import 'dotenvrc'
import { FollowRepository } from '@domains/follower/repository/follow.repository'
import { FollowDTO } from '@domains/follower/dto'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository, private readonly followRepository: FollowRepository) {}

  async getUser (userId: string): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return await this.userToUserViewDTO(user)
  }

  async getUsersByUsername (username: string, options: OffsetPagination): Promise<UserViewDTO[]> {
    return await this.repository.getUsersByUsername(username, options)
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

    return await Promise.all(allRecommendedUsers.map(async user => await this.userToUserViewDTO(user)))
  }

  async deleteUser (userId: any): Promise<void> {
    await this.repository.delete(userId)
  }

  async getProfilePicture (userId: string): Promise<string | null> {
    return await this.repository.getProfilePicture(userId)
  }

  async uploadProfilePicture (userId: string): Promise<string> {
    await this.repository.updateUser(userId, { profilePictureKey: userId })

    return await this.repository.uploadProfilePicture(userId)
  }

  private async isFollowedByAFollow (userId: string, follows: FollowDTO[]): Promise<boolean> {
    for (const user of follows) {
      if (await this.followRepository.isFollowing(user.followedId, userId)) { return true }
    }

    return false
  }

  private async userToUserViewDTO (user: ExtendedUserDTO): Promise<UserViewDTO> {
    return new UserViewDTO({
      id: user.id,
      name: user.name,
      username: user.username,
      profilePicture: await this.getProfilePicture(user.id)
    })
  }
}
