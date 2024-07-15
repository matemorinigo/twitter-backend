import { ReactionService } from '@domains/reaction/service/reaction.service'
import { ReactionType, ReactPostDTO } from '@domains/reaction/dto'
import { ReactionRepository } from '@domains/reaction/repository/reaction.repository'
import { ConflictException, NotFoundException, ValidatePostVisibility } from '@utils'

export class ReactionServiceImpl implements ReactionService {
  constructor (private readonly repository: ReactionRepository, private readonly validatePostVisibility: ValidatePostVisibility) {}

  async react (postId: string, userId: string, type: ReactionType): Promise<ReactPostDTO> {
    const existingReaction = await this.repository.getReaction(postId, userId, type)
    if (existingReaction) { throw new ConflictException(`POST_ALREADY_${type}`) }
    if (!await this.validatePostVisibility.validateUserCanSeePost(userId, postId)) { throw new NotFoundException() }
    return await this.repository.react(postId, userId, type)
  }

  async unreact (postId: string, userId: string, type: ReactionType): Promise<ReactPostDTO> {
    if (!await this.repository.getReaction(postId, userId, type)) { throw new ConflictException(`POST_NOT_${type}`) }
    if (!await this.validatePostVisibility.validateUserCanSeePost(userId, postId)) { throw new NotFoundException() }
    return await this.repository.unreact(postId, userId, type)
  }

  async likesByPost (postId: string, userId: string): Promise<ReactPostDTO[]> {
    if (!await this.validatePostVisibility.validateUserCanSeePost(userId, postId)) { throw new NotFoundException() }
    return await this.repository.likesByPost(postId)
  }

  async retweetsByPost (postId: string, userId: string): Promise<ReactPostDTO[]> {
    if (!await this.validatePostVisibility.validateUserCanSeePost(userId, postId)) { throw new NotFoundException() }
    return await this.repository.retweetsByPost(postId)
  }

  async likesByUser (authorId: string, userId: string): Promise<ReactPostDTO[]> {
    return await this.repository.likesByPost(authorId)
  }

  async retweetsByUser (authorId: string, userId: string): Promise<ReactPostDTO[]> {
    return await this.repository.retweetsByPost(authorId)
  }
}
