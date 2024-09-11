import { FollowDTO } from '@domains/follower/dto';
import { UserViewDTO } from '@domains/user/dto';

export interface FollowService {
  follow: (followerId: string, followedId: string) => Promise<FollowDTO>
  unfollow: (followerId: string, followedId: string) => Promise<FollowDTO>
  getFollowers: (followingId: string) => Promise<FollowDTO[]>
  getFollowing: (followerId: string) => Promise<FollowDTO[]>
  getMutuals: (userId: string) => Promise<UserViewDTO[]>
  isFollowing: (followerId: string, followedId: string) => Promise<boolean>
}
