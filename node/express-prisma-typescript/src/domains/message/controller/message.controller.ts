import { Router, Request, Response } from 'express';
import { Socket } from 'socket.io';

export const messageRouter = Router();

messageRouter.get('/', async (req: Request, res: Response) => {
  const io = req.app.get('socketio');
  io.on('connect', (socket: Socket) => {
    console.log(socket.id);
  });
});
