import { Module, forwardRef } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { PrismaModule } from '../../infra/database/prisma.module';
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
    PrismaModule,
  ],
  providers: [UserDeletedListener],
})
export class EventsModule {}
