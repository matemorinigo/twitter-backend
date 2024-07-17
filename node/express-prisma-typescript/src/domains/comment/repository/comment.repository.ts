import { CommentDTO, CreateCommentInputDTO } from '@domains/comment/dto'
import { CursorPagination } from '@types';

export interface CommentRepository {
  comment: (postId: string, userId: string, data: CreateCommentInputDTO) => Promise<CommentDTO>
  deleteComment: (postId: string, commentId: string) => Promise<CommentDTO>
  getComment: (postId: string, commentId: string) => Promise<CommentDTO | null>
  getPostComments: (postId: string) => Promise<CommentDTO[]>
  getPostCommentsPaginated: (postId: string, options: CursorPagination) => Promise<CommentDTO[]>
}
