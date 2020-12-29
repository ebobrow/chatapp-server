import { Server, Socket } from 'socket.io';
import { addMessageToChat } from '../db/chat';

export const socket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    let currRoom: string;
    socket.on('join', room => {
      currRoom = room;
      socket.join(room);
    });

    socket.on('leave', room => {
      currRoom = '';
      socket.leave(room);
    });

    socket.on('new-message', async obj => {
      socket.to(obj.room).emit('message', obj);
      addMessageToChat(obj.message, obj.sender, currRoom);
    });
  });
};
