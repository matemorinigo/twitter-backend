import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateCommentInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @MaxLength(4)
    images?: string[]
}

export class CommentDTO {
  constructor (comment: CommentDTO) {
    this.id = comment.id
    this.postId = comment.postId
    this.authorId = comment.authorId
    this.content = comment.content
    this.images = comment.images
    this.createdAt = comment.createdAt
  }

  id: string
  postId: string | null
  authorId: string
  content: string
  images: string[]
  createdAt: Date
}
