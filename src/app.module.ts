import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbService } from './db.service';
import AuthService from './auth.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DbService, AuthService],
})
export class AppModule {}
