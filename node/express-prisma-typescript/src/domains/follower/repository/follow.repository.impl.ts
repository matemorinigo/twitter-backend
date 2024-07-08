import { Follow, PrismaClient } from '@prisma/client'
import { FollowRepository } from '@domains/follower/repository/follow.repository'
import { FollowDTO } from '@domains/follower/dto'
import { NotFoundException } from '@utils'

export class FollowRepositoryImpl implements FollowRepository {
  constructor (private readonly db: PrismaClient) {}

  async follow (followerId: string, followedId: string): Promise<FollowDTO> {
    const follow: Follow = await this.db.follow.create({
      data: {
        followerId,
        followedId
      }
    })

    return new FollowDTO(follow)
  }

  async unfollow (followerId: string, followedId: string): Promise<FollowDTO> {
    // se solucionaria armando una clave unica followedID y followerID

    const follow = await this.db.follow.delete({
      where: {
        followerId_followedId: {
          followerId,
          followedId
        }
      }
    })
    return new FollowDTO(follow)
  }

  async getFollowId (followerId: string, followedId: string): Promise<string> {
    const follow = await this.db.follow.findFirst({
      where: {
        followerId,
        followedId
      }
    })

    if (follow) { return follow.id } else { throw new NotFoundException() }
  }

  async getFollowers (followingId: string): Promise<FollowDTO[]> {
    const followers = await this.db.follow.findMany({
      where: {
        followedId: followingId
      }
    })

    return followers.map(follow => new FollowDTO(follow))
  }

  async getFollowing (followerId: string): Promise<FollowDTO[]> {
    const follows = await this.db.follow.findMany({
      where: {
        followerId
      }
    })

    return follows.map(follow => new FollowDTO(follow))
  }
}
