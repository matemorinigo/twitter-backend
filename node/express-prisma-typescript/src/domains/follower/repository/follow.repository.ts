import { FollowDTO } from '@domains/follower/dto'

export interface FollowRepository {
  follow: (followerId: string, followedId: string) => Promise<FollowDTO>
  unfollow: (followerId: string, followedId: string) => Promise<FollowDTO>
  getFollowers: (followingId: string) => Promise<FollowDTO[]>
  getFollowing: (followerId: string) => Promise<FollowDTO[]>
  isFollowing: (followerId: string, followedId: string) => Promise<boolean>
}
