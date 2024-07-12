import { ReactionType, ReactPostDTO } from '@domains/reaction/dto'

export interface ReactionService {
  react: (postId: string, userId: string, type: ReactionType) => Promise<ReactPostDTO>
  unreact: (postId: string, userId: string, type: ReactionType) => Promise<ReactPostDTO>
  likesByPost: (postId: string, userId: string) => Promise<ReactPostDTO[]>
  retweetsByPost: (postId: string, userId: string) => Promise<ReactPostDTO[]>
  likesByUser: (authorId: string, userId: string) => Promise<ReactPostDTO[]>
  retweetsByUser: (authorId: string, userId: string) => Promise<ReactPostDTO[]>
}
