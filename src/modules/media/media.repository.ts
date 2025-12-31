import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { Media, Prisma } from '@prisma/client';
import { MediaEntity } from './entities/media.entity';

@Injectable()
export class MediaRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MediaCreateInput): Promise<MediaEntity> {
    const media = await this.prisma.media.create({
      data,
    });
    return new MediaEntity(media);
  }

  async findById(id: string): Promise<MediaEntity | null> {
    const media = await this.prisma.media.findUnique({
      where: { id, deletedAt: null },
    });
    return media ? new MediaEntity(media) : null;
  }

  async findAll(params: {
    where?: Prisma.MediaWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.MediaOrderByWithRelationInput;
  }): Promise<MediaEntity[]> {
    const medias = await this.prisma.media.findMany({
      ...params,
      where: { ...params.where, deletedAt: null },
    });
    return medias.map((media) => new MediaEntity(media));
  }

  async count(where: Prisma.MediaWhereInput): Promise<number> {
    return this.prisma.media.count({
      where: { ...where, deletedAt: null },
    });
  }

  async update(
    id: string,
    data: Prisma.MediaUpdateInput,
  ): Promise<MediaEntity> {
    const media = await this.prisma.media.update({
      where: { id },
      data,
    });
    return new MediaEntity(media);
  }

  async softDelete(id: string): Promise<MediaEntity> {
    const media = await this.prisma.media.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return new MediaEntity(media);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.media.delete({
      where: { id },
    });
  }

  async softDeleteAllByOwner(
    ownerId: string,
    ownerType: string,
  ): Promise<number> {
    const result = await this.prisma.media.updateMany({
      where: {
        ownerId,
        ownerType,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
    return result.count;
  }
}
