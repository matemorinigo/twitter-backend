import { FollowService } from '@domains/follower/service/follow.service'
import { FollowRepository } from '@domains/follower/repository/follow.repository'
import { FollowDTO } from '@domains/follower/dto'
import { ConflictException, NotFoundException } from '@utils';
import { UserRepository } from '@domains/user/repository';
import { ExtendedUserDTO, UserViewDTO } from '@domains/user/dto';

export class FollowServiceImpl implements FollowService {
  constructor (private readonly repository: FollowRepository, private readonly userRepository: UserRepository) {}

  async follow (followerId: string, followedId: string): Promise<FollowDTO> {
    if (followerId === followedId) throw new ConflictException('CANNOT_FOLLOW_YOURSELF')

    if (await this.repository.isFollowing(followerId, followedId)) throw new ConflictException('USER_ALREADY_FOLLOWED')

    if (!await this.userRepository.getById(followedId)) { throw new NotFoundException('user') }

    return await this.repository.follow(followerId, followedId)
  }

  async unfollow (followerId: string, followedId: string): Promise<FollowDTO> {
    if (!await this.repository.isFollowing(followerId, followedId)) { throw new ConflictException('USER_IS_NOT_FOLLOWED') }
    return await this.repository.unfollow(followerId, followedId)
  }

  async getFollowers (followerId: string): Promise<FollowDTO[]> {
    return await this.repository.getFollowers(followerId)
  }

  async getFollowing (followingId: string): Promise<FollowDTO[]> {
    return await this.repository.getFollowing(followingId)
  }

  async isFollowing (followerId: string, followedId: string): Promise<boolean> {
    return await this.repository.isFollowing(followerId, followedId)
  }

  async getMutuals (userId: string): Promise<UserViewDTO[]> {
    const followed = await this.repository.getFollowing(userId)
    const followers = await this.repository.getFollowers(userId)
    
    const mutuals: UserViewDTO[] = []
    for (const follow of followed){
      if(followers.find(f => f.followerId === follow.followedId)){
        const user = await this.userRepository.getById(follow.followedId)
        user && mutuals.push(await this.userToUserViewDTO(user))
      }
    }

    return mutuals
  }

  private async userToUserViewDTO (user: ExtendedUserDTO): Promise<UserViewDTO> {
    return new UserViewDTO({
      id: user.id,
      name: user.name,
      username: user.username,
      profilePicture: await this.userRepository.getProfilePicture(user.id)
    })
  }
}
