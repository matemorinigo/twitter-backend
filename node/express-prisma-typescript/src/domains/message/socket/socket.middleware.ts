import jwt from 'jsonwebtoken';
import { Constants, db, UnauthorizedException, ValidationException } from '@utils';
import { Socket } from 'socket.io';
import { FollowServiceImpl } from '@domains/follower/service/follow.service.impl';
import { FollowRepositoryImpl } from '@domains/follower/repository/follow.repository.impl';
import { UserRepositoryImpl } from '@domains/user/repository';
import { plainToInstance } from 'class-transformer';
import { MessageInputDTO } from '@domains/message/dto';
import { validate } from 'class-validator';

const FollowService = new FollowServiceImpl(new FollowRepositoryImpl(db), new UserRepositoryImpl(db));

export const authMiddleware = (socket: Socket, next: (err?: Error | undefined) => void): void => {
  const token = socket.handshake.query?.token;

  if (typeof token === 'string') {
    jwt.verify(token, Constants.TOKEN_SECRET, (err, context) => {
      if (err) {
        next(new UnauthorizedException('INVALID_TOKEN'));
      }
      socket.data.context = context;
      next();
    });
  } else {
    next(new UnauthorizedException('MISSING_TOKEN'));
  }
};

export const joinRoomsMiddleware = async (socket: Socket, next: (err?: Error | undefined) => void): Promise<void> => {
  if (socket.data.context) {
    const userId: string = socket.data.context.userId;
    const followedUsers = await FollowService.getFollowing(userId);
    await socket.join(followedUsers.map((follow) => `${follow.followedId}-${userId}`));
  }
  next();
};
