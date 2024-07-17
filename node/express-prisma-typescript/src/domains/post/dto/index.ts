import { ArrayMaxSize, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ExtendedUserDTO, UserViewDTO } from '@domains/user/dto';
import { Exclude } from 'class-transformer';

export class CreatePostInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @ArrayMaxSize(4)
    images?: string[]
}

export class AddMediaInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
    fileType!: string
}

export class PostDTO {
  constructor (post: PostDTO) {
    this.id = post.id
    this.authorId = post.authorId
    this.content = post.content
    this.images = post.images
    this.createdAt = post.createdAt
    this.isComment = post.isComment
  }

  id: string
  authorId: string
  content: string
  images: string[]
  createdAt: Date

  @Exclude()
    isComment: boolean
}

export class ExtendedPostDTO extends PostDTO {
  constructor (post: ExtendedPostDTO) {
    super(post)
    this.author = post.author
    this.qtyComments = post.qtyComments
    this.qtyLikes = post.qtyLikes
    this.qtyRetweets = post.qtyRetweets
  }

  author!: UserViewDTO
  qtyComments!: number
  qtyLikes!: number
  qtyRetweets!: number
}
