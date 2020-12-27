import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(morgan('dev'));
app.use(cors({ origin: 'http://localhost:3000' }));

app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
