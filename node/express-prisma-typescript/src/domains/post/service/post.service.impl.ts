import { CreatePostInputDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'
import { FollowService } from '@domains/follower/service/follow.service';
import { UserDTO } from '@domains/user/dto';
import { UserService } from '@domains/user/service';

export class PostServiceImpl implements PostService {
  constructor (private readonly repository: PostRepository, private readonly followService: FollowService,
    private readonly userService: UserService) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data)
    return await this.repository.create(userId, data)
  }

  async deletePost (userId: string, postId: string): Promise<void> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.repository.delete(postId)
  }

  async getPost (userId: string, postId: string): Promise<PostDTO> {
    // TODO: validate that the author has public profile or the user follows the author
    const author = await this.getPostAuthor(postId)
    if (!author.publicAccount && !await this.followService.isFollowing(userId, author.id)) { throw new ForbiddenException() }
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    // TODO: filter post search to return posts from authors that the user follows
    return await this.repository.getAllByDatePaginated(options)
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    // TODO: throw exception when the author has a private profile and the user doesn't follow them
    return await this.repository.getByAuthorId(authorId)
  }

  async getPostAuthor (postId: string): Promise<UserDTO> {
    const post = await this.repository.getById(postId)

    return await this.userService.getUser(post?.authorId)
  }
}
