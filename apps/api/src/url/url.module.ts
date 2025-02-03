import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [UrlService, DatabaseService],
  controllers: [UrlController]
})
export class UrlModule { }
