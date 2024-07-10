export class FollowDTO {
  constructor (follow: FollowDTO) {
    this.followerId = follow.followerId
    this.followedId = follow.followedId
    this.createdAt = follow.createdAt
  }

  followerId: string
  followedId: string
  createdAt: Date
}
