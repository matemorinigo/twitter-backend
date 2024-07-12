import { IsEnum, IsString, IsUUID } from 'class-validator'

export enum ReactionType {
  LIKE = 'LIKE',
  RETWEET = 'RETWEET'
}

export class ReactBodyDTO {
  @IsEnum(ReactionType)
    type: string

  constructor (type: ReactionType) {
    this.type = type
  }
}

export class ReactPostDTO {
  @IsEnum(ReactionType)
    type: string

  @IsString()
  @IsUUID()
    postId: string

  @IsString()
  @IsUUID()
    userId: string

  constructor (reaction: ReactPostDTO) {
    this.type = reaction.type
    this.postId = reaction.postId
    this.userId = reaction.userId
  }
}
