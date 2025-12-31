import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BackblazeService } from './backblaze/backblaze.service';
import backblazeConfig from '../../config/backblaze.config';
import { StorageService } from './storage.interface';

@Module({
  imports: [ConfigModule.forFeature(backblazeConfig)],
  providers: [
    {
      provide: StorageService,
      useClass: BackblazeService,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
