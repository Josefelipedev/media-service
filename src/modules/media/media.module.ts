import { forwardRef, Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaRepository } from './media.repository';
import { MediaAccessPolicy } from './policies/media-access.policy';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { EventsModule } from '../events/events.module';
import { DatabaseModule } from '../../infra/database/database.module';


@Module({
  imports: [
    AuthModule,
    StorageModule,
    forwardRef(() => EventsModule),
    DatabaseModule,
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository, MediaAccessPolicy],
  exports: [MediaService],
})
export class MediaModule {}
