import { AddMediaInputDTO, CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto';
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ConflictException, ForbiddenException, NotFoundException, ValidatePostVisibility } from '@utils'
import { CursorPagination } from '@types'
import { UserDTO } from '@domains/user/dto'
import { FollowRepository } from '@domains/follower/repository/follow.repository'
import { UserRepository } from '@domains/user/repository'
import * as crypto from 'crypto'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import s3 from '@utils/s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as process from 'process'

const randomImageName = (bytes = 32): string => crypto.randomBytes(bytes).toString('hex')

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
    if (post?.images) {
      post.images = await Promise.all(post?.images.map(async url => await this.signUrl(url)))
    }
    if (!post) throw new NotFoundException('post')
    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    // TODO: filter post search to return posts from authors that the user follows
    const posts = await this.repository.getAllByDatePaginated(options)
    const filteredPosts: ExtendedPostDTO[] = []

    for (const post of posts) {
      if (await this.validatePostVisibility.validateUserCanSeePosts(userId, post.authorId)) {
        const author = await this.userRepository.getById(post.authorId)

        post.images = await Promise.all(post?.images.map(async url => await this.signUrl(url)))
        filteredPosts.push(new ExtendedPostDTO(post.id, post.authorId, post.content, post.images, post.createdAt, {id: author?.id, name:author?.name, username: author?.username, profilePicture: this.userRepository.} ))
      }
    }

    return filteredPosts
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    // TODO: throw exception when the author has a private profile and the user doesn't follow them

    if (!await this.validatePostVisibility.validateUserCanSeePosts(userId, authorId)) { throw new NotFoundException() }
    const posts = await this.repository.getByAuthorId(authorId)

    for (const post of posts) {
      post.images = await Promise.all(post?.images.map(async url => await this.signUrl(url)))
    }

    return posts
  }

  async getPostAuthor (postId: string): Promise<UserDTO> {
    const post = await this.repository.getById(postId)

    if (!post) { throw new NotFoundException('post') }

    // I know that user cant be null if it has a post, but typescript not...
    const user = await this.userRepository.getById(post.authorId)

    if (!user) { throw new NotFoundException('user') }

    return user
  }

  async getUploadMediaPresignedUrl (data: AddMediaInputDTO): Promise< { putObjectUrl: string, objectUrl: string } > {
    if (!['jpg', 'jpeg', 'png'].includes(data.fileType.trim())) {
      throw new ConflictException('File types allowed: jpg, jpeg, png')
    }

    const key = `uploadedMedia/${randomImageName()}.${data.fileType}`

    const bucket = process.env.AWS_BUCKET_NAME ? process.env.AWS_BUCKET_NAME : ''
    const region = process.env.AWS_BUCKET_REGION ? process.env.AWS_BUCKET_REGION : ''
    const params = {
      Bucket: bucket,
      Key: key
    }

    const command = new PutObjectCommand(params)

    return {
      putObjectUrl: await getSignedUrl(s3, command, { expiresIn: 3600 }),
      objectUrl: `https://${bucket}.s3.${region}.amazonaws.com/${key}`
    }
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
}
