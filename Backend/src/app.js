import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import sanitize from './middlewares/sanitize.middleware.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
import rootRouter from './routes/index.route.js';

const app = express();

app.use(helmet());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-socket-id'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sanitize());

app.use((req, res, next) => {
  console.log(` ${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    console.log(' Request Body:', req.body);
  }
  next();
});

app.use('/api', apiRateLimiter);
app.use('/api', rootRouter);

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: ' Classcify Backend API is Running!'
  });
});

app.use(errorMiddleware);

export default app;
