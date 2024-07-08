import { FollowService } from '@domains/follower/service/follow.service'
import { FollowRepository } from '@domains/follower/repository/follow.repository'
import { FollowDTO } from '@domains/follower/dto'

export class FollowServiceImpl implements FollowService {
  constructor (private readonly repository: FollowRepository) {}

  async follow (followerId: string, followedId: string): Promise<FollowDTO> {
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
}
