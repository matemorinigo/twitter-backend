import { MessageRepository } from '@domains/message/repository/message.repository';
import { Message, PrismaClient } from '@prisma/client';
import { MessageDTO, MessageInputDTO } from '@domains/message/dto';

export class MessageRepositoryImpl implements MessageRepository {
  constructor(private readonly db: PrismaClient) {}

  async send(senderId: string, receiverId: string, message: MessageInputDTO): Promise<MessageDTO> {
    const msg: Message = await this.db.message.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        content: message.message,
        images: message.images,
      },
    });

    return new MessageDTO(msg);
  }

  async messagesReceived(receiverId: string): Promise<MessageDTO[]> {
    const msgs = await this.db.message.findMany({
      where: {
        receiverId,
      },
    });

    return msgs.map((msg) => new MessageDTO(msg));
  }

  async messagesSent(senderId: string): Promise<MessageDTO[]> {
    const msgs = await this.db.message.findMany({
      where: {
        senderId,
      },
    });

    return msgs.map((msg) => new MessageDTO(msg));
  }

  async chatHistory(senderId: string, receiverId: string): Promise<MessageDTO[]> {
    const msgs = await this.db.message.findMany({
      where: {
        senderId,
        receiverId,
      },
    });

    return msgs.map((msg) => new MessageDTO(msg));
  }
}
