import { Server, Socket } from 'socket.io';
import * as http from 'node:http';
import { Constants } from '@utils';

import { authMiddleware, joinRoomsMiddleware } from '@domains/message/socket/socket.middleware';
import { sendMessageHandler, errorMessageHandler } from '@domains/message/socket/event.handler';


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
