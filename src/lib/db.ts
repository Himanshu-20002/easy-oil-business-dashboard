import mongoose from 'mongoose';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { Application } from '../models/Application';
import { Document } from '../models/Document';
import { ActivityLog } from '../models/ActivityLog';

const MONGODB_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;

if (!MONGODB_URI) {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    throw new Error('MONGODB_URI environment variable must be set in production. Check Vercel environment variables.');
  }
  // In development, provide a helpful error message with instructions
  console.error('[MongoDB] MONGODB_URI environment variable is not set.');
  console.error('[MongoDB] Please ensure MONGODB_URI is configured in your Vercel project settings or .env.local file.');
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: GlobalMongoose | undefined;
}

const cached: GlobalMongoose = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function dbConnect() {
  // Prevent bundler tree-shaking and guarantee model registration
  const _models = { User, Company, Application, Document, ActivityLog };

  if (cached.conn) {
    try {
      // Verify connection is still alive
      const db = cached.conn?.connection?.db;
      if (db) {
        await db.admin().ping();
      }
      return cached.conn;
    } catch (e) {
      // Connection is stale, reset it
      cached.conn = null;
      cached.promise = null;
    }
  }
  
  // Attempt to connect with retries
  const maxRetries = process.env.NODE_ENV === 'production' ? 5 : 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    attempt++;
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: process.env.NODE_ENV === 'production' ? 5 : 10,
        serverSelectionTimeoutMS: process.env.NODE_ENV === 'production' ? 10000 : 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      };
      cached.promise = mongoose.connect(MONGODB_URI!, opts);
    }
    try {
      cached.conn = await cached.promise;
      // Ensure Mongoose indexes are created so unique constraints are enforced.
      await Promise.all(Object.values(_models).map(async (model) => model.init()));
      break; // exit loop on success
    } catch (e) {
      cached.promise = null; // reset promise for retry
      if (attempt >= maxRetries) {
        throw e; // rethrow after max attempts
      }
      // Exponential backoff for retries
      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }

  return cached.conn;
}
