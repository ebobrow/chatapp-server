import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/users';
import { Server, Socket } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const CORS_ORIGIN = 'http://localhost:3000';
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 4000;

io.on('connection', (socket: Socket) => {
  console.log('connected');

  socket.on('new-message', obj => {
    socket.broadcast.emit('message', obj);
  });
});

app.use(morgan('dev'));
app.use(cors({ origin: CORS_ORIGIN }));

app.use('/auth', authRoutes);

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
