import { Server, Socket } from 'socket.io';
import { addMessageToChat, createChat } from '../db/chat';
import { findByEmail } from '../db/users';

export const socket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    let currRoom: string;
    socket.on('create-group', async obj => {
      const ids = obj.users.map(async (user: string) => {
        const id = await findByEmail(user);

        if (id) return id.id;
      });

      console.log(await Promise.all(ids));

      createChat(await Promise.all(ids));
    });

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
