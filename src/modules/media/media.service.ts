import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { StorageService } from '../storage/storage.interface';
import { MediaAccessPolicy } from './policies/media-access.policy';
import { DeleteMediaDto } from './dto/delete-media.dto';
import { ListMediaDto } from './dto/list-media.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storageService: StorageService,
    private readonly mediaAccessPolicy: MediaAccessPolicy,
  ) {}

  async uploadFileDirectly(
    file: Express.Multer.File,
    metadata: Record<string, unknown> | undefined,
    user: { app: string; ownerType: string; userId: string },
  ) {
    console.log('uploadFileDirectly', file);
    const { originalname, mimetype, buffer, size } = file;

    // Validate file type
    const allowedTypes = ['image/', 'video/', 'application/pdf', 'text/'];
    if (!allowedTypes.some((type) => mimetype.startsWith(type))) {
      throw new BadRequestException('File type not allowed');
    }

    // Generate unique key
    const timestamp = Date.now();
    const key = `${user.app}/${user.ownerType}/${user.userId}/${timestamp}-${originalname}`;

    // Upload directly to Backblaze
    await this.storageService.uploadFileDirectly(key, buffer, mimetype);

    // Get file URL
    const url = await this.storageService.getFileUrl(key);

    // Save metadata to database
    const media = await this.mediaRepository.create({
      key,
      url,
      type: mimetype,
      size,
      ownerId: user.userId,
      ownerType: user.ownerType,
      app: user.app,
      metadata: metadata || {},
    });

    return media;
  }

  async listMedia(listMediaDto: ListMediaDto, user: JwtPayload) {
    const { app, ownerType, page = 1, limit = 20 } = listMediaDto;

    // Use user's context if not specified
    const queryApp = app || user.app;
    const queryOwnerType = ownerType || user.ownerType;

    const [items, total] = await Promise.all([
      this.mediaRepository.findAll({
        where: {
          ownerId: user.userId,
          ownerType: queryOwnerType,
          app: queryApp,
          deletedAt: null,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.mediaRepository.count({
        ownerId: user.userId,
        ownerType: queryOwnerType,
        app: queryApp,
        deletedAt: null,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteMedia(
    id: string,
    deleteMediaDto: DeleteMediaDto,
    user: JwtPayload,
  ) {
    const media = await this.mediaRepository.findById(id);

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Check access policy
    this.mediaAccessPolicy.checkDeletePermission(media, user);

    if (deleteMediaDto.permanent) {
      // Delete from storage
      await this.storageService.deleteFile(media.key);
      // Permanent delete from database
      await this.mediaRepository.delete(id);
    } else {
      // Soft delete
      await this.mediaRepository.softDelete(id);
    }

    return { success: true };
  }

  async deleteAllByOwner(userId: string, ownerType: string) {
    const medias = await this.mediaRepository.findAll({
      where: {
        ownerId: userId,
        ownerType,
        deletedAt: null,
      },
    });

    // Delete from storage
    await Promise.all(
      medias.map((media) => this.storageService.deleteFile(media.key)),
    );

    // Soft delete all
    await this.mediaRepository.softDeleteAllByOwner(userId, ownerType);

    return { deletedCount: medias.length };
  }
}
