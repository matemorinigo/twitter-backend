import { CommentDTO, CreateCommentInputDTO } from '@domains/comment/dto'

export interface CommentService {
  comment: (postId: string, userId: string, data: CreateCommentInputDTO) => Promise<CommentDTO>
  deleteComment: (postId: string, commentId: string, userId: string) => Promise<CommentDTO>
}
