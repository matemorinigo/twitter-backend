import { CommentRepository } from '@domains/comment/repository/comment.repository'
import { PostRepository } from '@domains/post/repository'
import { CommentDTO, CreateCommentInputDTO } from '@domains/comment/dto'
import { NotFoundException, UnauthorizedException, ValidatePostVisibility } from '@utils';
import { CommentService } from '@domains/comment/service/comment.service'
import { CursorPagination } from '@types';

export class CommentServiceImpl implements CommentService {
  constructor (private readonly repository: CommentRepository,
    private readonly postRepository: PostRepository, private readonly validatePostVisibility: ValidatePostVisibility) {}

  async comment (postId: string, userId: string, data: CreateCommentInputDTO): Promise<CommentDTO> {
    if (!await this.validatePostVisibility.validateUserCanSeePost(userId, postId)) { throw new NotFoundException() }
    return await this.repository.comment(postId, userId, data)
  }

  async deleteComment (postId: string, commentId: string, userId: string): Promise<CommentDTO> {
    const comment = await this.repository.getComment(postId, commentId)

    if (!comment) { throw new NotFoundException() }
    if (comment.authorId !== userId) { throw new UnauthorizedException() }

    return await this.repository.deleteComment(postId, commentId)
  }

  async getComment (postId: string, commentId: string, userId: string): Promise<CommentDTO> {
    if (!await this.validatePostVisibility.validateUserCanSeePost(userId, postId)) { throw new NotFoundException() }
    const comment = await this.repository.getComment(postId, commentId)
    if (!comment) { throw new NotFoundException() }
    return comment
  }

  async getPostComments (postId: string, userId: string): Promise<CommentDTO[]> {
    if (!await this.validatePostVisibility.validateUserCanSeePost(userId, postId)) { throw new NotFoundException() }
    const comments = await this.repository.getPostComments(postId)
    return comments
  }

  async getPostCommentsPaginated (postId: string, userId: string, options: CursorPagination): Promise<CommentDTO[]> {
    if (!await this.validatePostVisibility.validateUserCanSeePost(userId, postId)) { throw new NotFoundException() }
    const comments = await this.repository.getPostCommentsPaginated(postId, options)
    return comments
  }
}
