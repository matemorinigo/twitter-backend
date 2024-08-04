import { CommentDTO, CreateCommentInputDTO } from '@domains/comment/dto'
import { CursorPagination } from '@types'
import { ExtendedPostDTO } from '@domains/post/dto';

export interface CommentService {
  comment: (postId: string, userId: string, data: CreateCommentInputDTO) => Promise<CommentDTO>
  deleteComment: (postId: string, commentId: string, userId: string) => Promise<CommentDTO>
  getComment: (postId: string, commentId: string, userId: string) => Promise<ExtendedPostDTO>
  getCommentsByUserId: (userId: string, searchedId: string) => Promise<ExtendedPostDTO[]>
  getPostComments: (postId: string, userId: string) => Promise<ExtendedPostDTO[]>
  getPostCommentsPaginated: (postId: string, userId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
}
