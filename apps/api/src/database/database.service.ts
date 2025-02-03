import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor() { }

  async onModuleInit() {
    const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/url-shortener';
    try {
      await mongoose.connect(MONGODB_URI);
      Logger.log('Connected to MongoDB');
    } catch (error) {
      Logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }
}
