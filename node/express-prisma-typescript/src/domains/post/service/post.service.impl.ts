import { CreatePostInputDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException, ValidatePostVisibility } from '@utils'
import { CursorPagination } from '@types'
import { UserDTO } from '@domains/user/dto'
import { FollowRepository } from '@domains/follower/repository/follow.repository'
import { UserRepository } from '@domains/user/repository'

export class PostServiceImpl implements PostService {
  constructor (private readonly repository: PostRepository, private readonly followRepository: FollowRepository,
    private readonly userRepository: UserRepository, private readonly validatePostVisibility: ValidatePostVisibility) {}

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
    if (!(await this.validatePostVisibility.validateUserCanSeePost(userId, postId))) { throw new NotFoundException() }
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    // TODO: filter post search to return posts from authors that the user follows
    const posts = await this.repository.getAllByDatePaginated(options)
    const filteredPosts: PostDTO[] = []

    for (const post of posts) {
      if (await this.validatePostVisibility.validateUserCanSeePosts(userId, post.authorId)) { filteredPosts.push(post) }
    }

    return filteredPosts
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    // TODO: throw exception when the author has a private profile and the user doesn't follow them

    if (!await this.validatePostVisibility.validateUserCanSeePosts(userId, authorId)) { throw new NotFoundException() }

    return await this.repository.getByAuthorId(authorId)
  }

  async getPostAuthor (postId: string): Promise<UserDTO> {
    const post = await this.repository.getById(postId)

    if (!post) { throw new NotFoundException('post') }

    // I know that user cant be null if it has a post, but typescript not...
    const user = await this.userRepository.getById(post.authorId)

    if (!user) { throw new NotFoundException('user') }

    return user
  }

  // I need to use it on lots of services (at least 2),
  /*
  private async userCanSeePosts (userId: string, author: UserDTO): Promise<boolean> {
    return author.publicAccount || !await this.followRepository.isFollowing(userId, author.id) || author.id === userId
  } */
}
