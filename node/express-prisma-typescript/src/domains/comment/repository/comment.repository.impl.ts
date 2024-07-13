import { PrismaClient } from '@prisma/client'
import { CommentDTO, CreateCommentInputDTO } from '@domains/comment/dto'
import { CommentRepository } from '@domains/comment/repository/comment.repository';

export class CommentRepositoryImpl implements CommentRepository {
  constructor (private readonly db: PrismaClient) {}

  async comment (postId: string, userId: string, data: CreateCommentInputDTO): Promise<CommentDTO> {
    const comment = await this.db.post.create({
      data: {
        postId,
        authorId: userId,
        content: data.content,
        images: data.images,
        isComment: true
      }
    })

    return comment
  }

  async deleteComment (postId: string, commentId: string): Promise<CommentDTO> {
    const comment = await this.db.post.delete({
      where: {
        id: commentId
      }
    })

    return new CommentDTO(comment)
  }

  async getComment (postId: string, commentId: string): Promise<CommentDTO | null> {
    const comment = await this.db.post.findFirst({
      where: {
        id: commentId,
        postId,
        isComment: true
      }
    })

    return (comment) ? new CommentDTO(comment) : null
  }

  async getPostComments (postId: string): Promise<CommentDTO[]> {
    const comments = await this.db.post.findMany({
      where: {
        postId,
        isComment: true
      }
    })

    return comments.map(comment => new CommentDTO(comment))
  }
}
