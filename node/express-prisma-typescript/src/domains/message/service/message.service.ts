import { MessageDTO, MessageInputDTO } from '@domains/message/dto';

export interface MessageService {
  send: (senderId: string, receiverId: string, message: MessageInputDTO) => Promise<MessageDTO>;
  messagesSent: (senderId: string) => Promise<MessageDTO[]>;
  messagesReceived: (receiverId: string) => Promise<MessageDTO[]>;
  chatHistory: (senderId: string, receiverId: string) => Promise<MessageDTO[]>;
}
