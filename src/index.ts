import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/users';
import { Server, Socket } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 4000;

io.on('connection', (socket: Socket) => {
  console.log('connected');

  socket.on('new-message', message => {
    console.log(message);
    socket.broadcast.emit('message', { message, sender: socket.id });
  });
});

app.use(morgan('dev'));
app.use(cors({ origin: 'http://localhost:3000' }));

app.use('/auth', authRoutes);

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
