import { CommentDTO, CreateCommentInputDTO } from '@domains/comment/dto'
import { CursorPagination } from '@types'

export interface CommentService {
  comment: (postId: string, userId: string, data: CreateCommentInputDTO) => Promise<CommentDTO>
  deleteComment: (postId: string, commentId: string, userId: string) => Promise<CommentDTO>
  getComment: (postId: string, commentId: string, userId: string) => Promise<CommentDTO>
  getPostComments: (postId: string, userId: string) => Promise<CommentDTO[]>,
  getPostCommentsPaginated: (postId: string, userId: string, options: CursorPagination) => Promise<CommentDTO[]>
}
