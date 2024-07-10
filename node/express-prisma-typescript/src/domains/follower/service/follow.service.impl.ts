import { FollowService } from '@domains/follower/service/follow.service'
import { FollowRepository } from '@domains/follower/repository/follow.repository'
import { FollowDTO } from '@domains/follower/dto'
import { ConflictException } from '@utils';
import { UserService } from '@domains/user/service';

export class FollowServiceImpl implements FollowService {
  constructor (private readonly repository: FollowRepository, private readonly userService: UserService) {}

  async follow (followerId: string, followedId: string): Promise<FollowDTO> {
    if (followerId === followedId) throw new ConflictException('CANNOT_FOLLOW_YOURSELF')

    if (await this.repository.isFollowing(followerId, followedId)) throw new ConflictException('USER_ALREADY_FOLLOWED')

    // si no lo encuentra, throwea (no me parece la forma mas linda de hacerlo igual)
    await this.userService.getUser(followedId)

    return await this.repository.follow(followerId, followedId)
  }

  async unfollow (followerId: string, followedId: string): Promise<FollowDTO> {
    return await this.repository.unfollow(followerId, followedId)
  }

  async getFollowers (followerId: string): Promise<FollowDTO[]> {
    return await this.repository.getFollowers(followerId)
  }

  async getFollowing (followingId: string): Promise<FollowDTO[]> {
    return await this.repository.getFollowing(followingId)
  }

  // Tener un isFollowing en service o llamar al repo directo desde posts?
  async isFollowing (followerId: string, followedId: string): Promise<boolean> {
    return await this.repository.isFollowing(followerId, followedId)
  }
}
