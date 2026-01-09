import { Module, forwardRef } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { DatabaseModule } from '../../infra/database/database.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserDeletedListener } from './listeners/user-deleted.listener';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    forwardRef(() => MediaModule),
    DatabaseModule,
  ],
  providers: [UserDeletedListener],
})
export class EventsModule {}
