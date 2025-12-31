import { Media as PrismaMedia } from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';

export class MediaEntity implements PrismaMedia {
  id: string;
  key: string;
  url: string;
  type: string;
  size: number;
  ownerId: string;
  ownerType: string;
  app: string;

  @Transform(({ value }) => value || {})
  metadata: any;

  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  deletedAt: Date | null;

  constructor(partial: Partial<MediaEntity>) {
    Object.assign(this, partial);
  }
}
