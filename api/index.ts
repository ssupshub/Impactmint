import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/src/server';
import { connectDatabase } from '../backend/src/config/database';

// Initialize database connection
let isConnected = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isConnected) {
    await connectDatabase();
    isConnected = true;
  }

  // Pass request to Express app
  app(req, res);
}
