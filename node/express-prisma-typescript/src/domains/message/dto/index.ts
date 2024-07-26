import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class MessageDTO {
  constructor(msg: MessageDTO) {
    this.senderId = msg.senderId;
    this.receiverId = msg.receiverId;
    this.content = msg.content;
    this.createdAt = msg.createdAt;
  }

  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
}

export class MessageInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  message!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  images?: string[];
}
