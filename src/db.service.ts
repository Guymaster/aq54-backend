import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DbService {
  getDb(): PrismaClient {
    return new PrismaClient();
  }
}