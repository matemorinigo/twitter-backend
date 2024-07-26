import { Server, Socket } from 'socket.io';
import * as http from 'node:http';
import { Constants, ValidationException } from '@utils';

import { authMiddleware, joinRoomsMiddleware } from '@domains/message/socket/socket.middleware';
import { sendMessageHandler, errorMessageHandler } from '@domains/message/socket/event.handler';
import { plainToInstance } from 'class-transformer';
import { MessageInputDTO } from '@domains/message/dto';
import { validate } from 'class-validator';

export const getSocket = (server: http.Server): Server => {
  const io = new Server(server, {
    cors: {
      origin: `localhost:${Constants.PORT}`,
    },
  });

  const onConnect = (socket: Socket) => {
    errorMessageHandler(io, socket);
    sendMessageHandler(io, socket);
  };

  io.use(authMiddleware);

  io.use(joinRoomsMiddleware);

  io.on('connect', onConnect);

  return io;
};
