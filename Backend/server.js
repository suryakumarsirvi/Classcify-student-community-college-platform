import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from './src/app.js';
import connectDB from './src/database/connection.js';
import logger from './src/utils/logger.js';
import env from './src/config/env.config.js';

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication token missing'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  socket.join(socket.userId);

  socket.on('disconnect', () => { });

  socket.on('joinCommunity', (communityId) => {
    socket.join(communityId);
  });

  socket.on('leaveCommunity', (communityId) => {
    socket.leave(communityId);
  });

  socket.on('new-message', (message) => {
    io.to(message.community).emit('new-message', message);
  });

  socket.on('typing', ({ communityId, userId }) => {
    socket.to(communityId).emit('typing', { userId });
  });

  socket.on('stop-typing', ({ communityId, userId }) => {
    socket.to(communityId).emit('stop-typing', { userId });
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

server.listen(env.PORT, () => {
  logger.info(`Server running at http://localhost:${env.PORT}`);
});

const gracefulShutdown = () => {
  logger.info('Received shutdown signal. Closing server...');
  server.close(() => {
    logger.info('HTTP server closed.');
    mongoose.connection.close(false).then(() => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
