import { FollowServiceImpl } from '@domains/follower/service/follow.service.impl';
import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl';
import { db } from '@utils';
import { UserRepositoryImpl } from '@domains/user/repository';
import { MessageServiceImpl } from '@domains/message/service/message.service.impl';
import { MessageRepositoryImpl } from '@domains/message/repository/message.repository.impl';
import { Server, Socket } from 'socket.io';
import { plainToInstance } from 'class-transformer';
import { MessageInputDTO } from '@domains/message/dto';
import { validate } from 'class-validator';

const FollowService = new FollowServiceImpl(new FollowRepositoryImpl(db), new UserRepositoryImpl(db));
const MessageService = new MessageServiceImpl(new MessageRepositoryImpl(db));

export const sendMessageHandler = (io: Server, socket: Socket) => {
  const sendMessage = async (receiverId: string, data: { message: string, images: string[] }): Promise<void> => {
    const userId: string = socket.data.context.userId
    const room = `${userId}-${receiverId}`

    const body = plainToInstance(MessageInputDTO, data);
    const errors = await validate(body, {
      whitelist: true,
      skipMissingProperties: true,
      forbidNonWhitelisted: true
    })

    if (errors.length > 0) {
      socket.emit('error', errors)
    } else {
      if (
        (await FollowService.isFollowing(userId, receiverId)) &&
        (await FollowService.isFollowing(receiverId, userId))
      ) {
        await MessageService.send(userId, receiverId, data)
        socket.to(room).emit('message:receive', { user: userId, data })
      }
    }
  }

  socket.on('message:send', sendMessage);
}

export const errorMessageHandler = (io: Server, socket: Socket) => {
  const emitError = (err: Error) => {
    socket.emit('error', err)
  }

  socket.on('error', emitError)
}
