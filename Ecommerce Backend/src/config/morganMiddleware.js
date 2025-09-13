import morgan from 'morgan';
import Logger from '../lib/logger.js';

// Override the stream method by telling
// Morgan to use our custom logger instead of console.log
const stream = {
  write: (message) => Logger.http(message.trim()),
};

// Skip all the Morgan HTTP logs if not in development mode
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

// Build the Morgan middleware
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

export default morganMiddleware;
