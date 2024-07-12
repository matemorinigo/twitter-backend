import { ReactionRepository } from '@domains/reaction/repository/reaction.repository'
import { PrismaClient, Reaction } from '@prisma/client'
import { ReactionType, ReactPostDTO } from '@domains/reaction/dto'

export class ReactionRepositoryImpl implements ReactionRepository {
  constructor (private readonly db: PrismaClient) {}

  async react (postId: string, userId: string, type: ReactionType): Promise<ReactPostDTO> {
    const reaction: Reaction = await this.db.reaction.create({
      data: {
        postId,
        userId,
        type
      }
    })
    return new ReactPostDTO(reaction)
  }

  async unreact (postId: string, userId: string, type: ReactionType): Promise<ReactPostDTO> {
    const reaction: Reaction = await this.db.reaction.delete({
      where: {
        postId_userId_type: {
          postId,
          userId,
          type
        }
      }
    })

    return new ReactPostDTO(reaction)
  }

  async likesByPost (postId: string): Promise<ReactPostDTO[]> {
    const reactions: Reaction[] = await this.db.reaction.findMany({
      where: {
        postId,
        type: 'LIKE'
      }
    })

    return reactions.map((reaction: Reaction) => new ReactPostDTO(reaction))
  }

  async retweetsByPost (postId: string): Promise<ReactPostDTO[]> {
    const reactions: Reaction[] = await this.db.reaction.findMany({
      where: {
        postId,
        type: 'RETWEET'
      }
    })

    return reactions.map((reaction: Reaction) => new ReactPostDTO(reaction))
  }

  async likesByUser (userId: string): Promise<ReactPostDTO[]> {
    const reactions: Reaction[] = await this.db.reaction.findMany({
      where: {
        userId,
        type: 'LIKE'
      }
    })

    return reactions.map((reaction: Reaction) => new ReactPostDTO(reaction))
  }

  async retweetsByUser (userId: string): Promise<ReactPostDTO[]> {
    const reactions: Reaction[] = await this.db.reaction.findMany({
      where: {
        userId,
        type: 'RETWEET'
      }
    })

    return reactions.map((reaction: Reaction) => new ReactPostDTO(reaction))
  }

  async getReaction (postId: string, userId: string, type: ReactionType): Promise<ReactPostDTO | null> {
    const reaction: Reaction | null = await this.db.reaction.findUnique({
      where: {
        postId_userId_type: {
          postId,
          userId,
          type
        }
      }
    })
    return reaction
  }
}
