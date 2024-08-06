import { CommentRepository } from '@domains/comment/repository/comment.repository'
import { PostRepository } from '@domains/post/repository'
import { CommentDTO, CreateCommentInputDTO } from '@domains/comment/dto'
import { ForbiddenException, NotFoundException, UnauthorizedException, ValidatePostVisibility } from '@utils';
import { CommentService } from '@domains/comment/service/comment.service'
import { CursorPagination } from '@types';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3 from '@utils/s3';
import { ExtendedPostDTO, PostDTO } from '@domains/post/dto';
import { UserRepository } from '@domains/user/repository';
import { ReactionRepository } from '@domains/reaction/repository/reaction.repository';

export class CommentServiceImpl implements CommentService {
  constructor (private readonly repository: CommentRepository,
    private readonly postRepository: PostRepository, private readonly userRepository: UserRepository, private readonly reactionsRepository: ReactionRepository, private readonly validatePostVisibility: ValidatePostVisibility) {}

  async comment (postId: string, userId: string, data: CreateCommentInputDTO): Promise<CommentDTO> {
    if (!await this.validatePostVisibility.validateUserCanSeePost(userId, postId)) { throw new NotFoundException() }
    return await this.repository.comment(postId, userId, data)
  }

  async deleteComment (postId: string, commentId: string, userId: string): Promise<CommentDTO> {
    const comment = await this.repository.getComment(postId, commentId)

    if (!comment) { throw new NotFoundException() }
    if (comment.authorId !== userId) { throw new ForbiddenException() }

    return await this.repository.deleteComment(postId, commentId)
  }

  async getComment (postId: string, commentId: string, userId: string): Promise<ExtendedPostDTO> {
    const comment = await this.repository.getComment(postId, commentId)
    if (!comment) { throw new NotFoundException() }
    if (!await this.validatePostVisibility.validateUserCanSeePost(userId, comment.id)) { throw new NotFoundException() }
    return await this.commentToExtendedPostDTO(comment)
  }

  async getCommentsByUserId (userId: string, searchedId: string): Promise<ExtendedPostDTO[]> {
    const comments = await this.repository.getCommentsByUserId(searchedId)
    if (!await this.validatePostVisibility.validateUserCanSeePosts(userId, searchedId)) { throw new NotFoundException() }
    return await Promise.all(comments.map(async comment => await this.commentToExtendedPostDTO(comment)))
  }

  async getPostComments (postId: string, userId: string): Promise<ExtendedPostDTO[]> {
    const comments = await this.repository.getPostComments(postId)
    const filteredComments: CommentDTO[] = []

    for (const comment of comments) {
      if (await this.validatePostVisibility.validateUserCanSeePost(userId, comment.id)) {
        filteredComments.push(comment)
      }
    }

    return await Promise.all(filteredComments.map(async comment => await this.commentToExtendedPostDTO(comment)))
  }

  async getPostCommentsPaginated (postId: string, userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const comments = await this.repository.getPostCommentsPaginated(postId, options)
    const filteredComments: CommentDTO[] = []

    for (const comment of comments) {
      if (await this.validatePostVisibility.validateUserCanSeePost(userId, comment.id)) {
        filteredComments.push(comment)
      }
    }

    return await Promise.all(filteredComments.map(async comment => await this.commentToExtendedPostDTO(comment)))
  }

  private async signUrl (url: string): Promise<string> {
    const { hostname, pathname } = new URL(url)

    const bucket = hostname?.split('.')[0]
    const key = pathname?.slice(1)

    const params = {
      Bucket: bucket,
      Key: key
    }

    const command = new GetObjectCommand(params)

    return await getSignedUrl(s3, command, { expiresIn: 3600 })
  }

  async commentToExtendedPostDTO (post: CommentDTO): Promise<ExtendedPostDTO> {
    const author = await this.userRepository.getById(post.authorId)

    if (!author) { throw new Error('Internal server error') }
    const extendedPost = {
      id: post.id,
      authorId: post.authorId,
      content: post.content,
      images: await Promise.all(post?.images.map(async url => await this.signUrl(url))),
      createdAt: post.createdAt,
      isComment: true,
      author: {
        id: author.id,
        name: author.name,
        username: author.username,
        profilePicture: await this.userRepository.getProfilePicture(author.id)
      },
      qtyComments: (await this.repository.getPostComments(post.id)).length,
      qtyLikes: (await this.reactionsRepository.likesByPost(post.id)).length,
      qtyRetweets: (await this.reactionsRepository.retweetsByPost(post.id)).length
    }
    return new ExtendedPostDTO(extendedPost)
  }
}
