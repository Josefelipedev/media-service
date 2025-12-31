import { Injectable, ForbiddenException } from '@nestjs/common';
import { MediaEntity } from '../entities/media.entity';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class MediaAccessPolicy {
  checkDeletePermission(media: MediaEntity, user: JwtPayload) {
    const isOwner =
      media.ownerId === user.userId && media.ownerType === user.ownerType;

    const isAdmin = user.roles?.includes('admin');
    const hasDeletePermission = user.permissions?.includes('media:delete');

    if (!isOwner && !isAdmin && !hasDeletePermission) {
      throw new ForbiddenException(
        'You do not have permission to delete this media',
      );
    }
  }

  checkViewPermission(media: MediaEntity, user: JwtPayload) {
    const isOwner =
      media.ownerId === user.userId && media.ownerType === user.ownerType;

    const isAdmin = user.roles?.includes('admin');
    const hasViewPermission = user.permissions?.includes('media:view');

    if (!isOwner && !isAdmin && !hasViewPermission) {
      throw new ForbiddenException(
        'You do not have permission to view this media',
      );
    }
  }
}
