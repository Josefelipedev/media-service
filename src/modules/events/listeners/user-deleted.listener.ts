import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MediaService } from '../../media/media.service';
import { DatabaseService } from '../../../infra/database/database.service';
import { deletionLog, media } from '../../../infra/database/schema';
import { eq } from 'drizzle-orm';

export interface UserDeletedEvent {
  userId: string;
  ownerType: 'user' | 'company';
  app: string;
  deletedBy: string;
  reason?: string;
}

@Injectable()
export class UserDeletedListener {
  private readonly logger = new Logger(UserDeletedListener.name);

  constructor(
    private readonly mediaService: MediaService,
    private readonly database: DatabaseService,
  ) {}

  @OnEvent('user.deleted')
  async handleUserDeletedEvent(payload: UserDeletedEvent) {
    try {
      this.logger.log(
        `Processing media deletion for user ${payload.userId} (${payload.ownerType})`,
      );

      // Delete all media for the user
      const result = await this.mediaService.deleteAllByOwner(
        payload.userId,
        payload.ownerType,
      );

      // Log the deletion for compliance
      await this.database.db.insert(deletionLog).values({
        userId: payload.userId,
        userType: payload.ownerType,
        mediaCount: result.deletedCount,
        deletedBy: payload.deletedBy,
        reason: payload.reason || 'Account deletion',
      });

      this.logger.log(
        `Deleted ${result.deletedCount} media files for user ${payload.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete media for user ${payload.userId}: ${error.message}`,
        error.stack,
      );
      // You might want to implement retry logic or send to dead letter queue
    }
  }

  @OnEvent('media.uploaded')
  async handleMediaUploadedEvent(payload: {
    mediaId: string;
    userId: string;
    fileSize: number;
    fileType: string;
  }) {
    this.logger.log(
      `Media ${payload.mediaId} uploaded by user ${payload.userId} (${payload.fileSize} bytes)`,
    );

    // Update file size in database
    try {
      await this.database.db
        .update(media)
        .set({ size: payload.fileSize, updatedAt: new Date() })
        .where(eq(media.id, payload.mediaId));
    } catch (error) {
      this.logger.error(
        `Failed to update media size for ${payload.mediaId}: ${error.message}`,
      );
    }
  }
}
