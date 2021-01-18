import express, { json } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/users';
import chatRoutes from './routes/chat';
import { Server } from 'socket.io';
import http from 'http';
import { CORS_ORIGIN } from './constants';
import { socket } from './helpers/socket';
import cookieparser from 'cookie-parser';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});
socket(io);

const PORT = process.env.PORT || 4000;

app.use(morgan('dev'));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(json());
app.use(cookieparser());

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
