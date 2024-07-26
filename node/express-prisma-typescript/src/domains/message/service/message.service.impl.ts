import { MessageRepository } from '@domains/message/repository/message.repository';
import { MessageService } from '@domains/message/service/message.service';
import { MessageDTO, MessageInputDTO } from '@domains/message/dto';

export class MessageServiceImpl implements MessageService {
  constructor(private readonly repository: MessageRepository) {}

  async send(senderId: string, receiverId: string, message: MessageInputDTO): Promise<MessageDTO> {
    return await this.repository.send(senderId, receiverId, message);
  }

  async messagesReceived(receiverId: string): Promise<MessageDTO[]> {
    return await this.repository.messagesReceived(receiverId);
  }

  async messagesSent(senderId: string): Promise<MessageDTO[]> {
    return await this.repository.messagesSent(senderId);
  }

  async chatHistory(senderId: string, receiverId: string): Promise<MessageDTO[]> {
    return await this.repository.chatHistory(senderId, receiverId);
  }
}
