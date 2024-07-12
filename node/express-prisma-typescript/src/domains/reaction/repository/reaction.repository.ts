import { ReactionType, ReactPostDTO } from '@domains/reaction/dto'

export interface ReactionRepository {
  react: (postId: string, userId: string, type: ReactionType) => Promise<ReactPostDTO>
  unreact: (postId: string, userId: string, type: ReactionType) => Promise<ReactPostDTO>
  likesByPost: (postId: string) => Promise<ReactPostDTO[]>
  retweetsByPost: (postId: string) => Promise<ReactPostDTO[]>
  likesByUser: (authorId: string) => Promise<ReactPostDTO[]>
  retweetsByUser: (authorId: string) => Promise<ReactPostDTO[]>
  getReaction: (postId: string, userId: string, type: ReactionType) => Promise<ReactPostDTO | null>
}
