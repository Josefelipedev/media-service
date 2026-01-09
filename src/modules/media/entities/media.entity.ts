import { Exclude, Transform } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { MediaRow } from '../../../infra/database/schema';

export class MediaEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  ownerType: string;

  @ApiProperty()
  app: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
  })
  @Transform(({ value }) => value || {})
  metadata: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiHideProperty()
  @Exclude()
  deletedAt: Date | null;

  constructor(partial: Partial<MediaEntity> | MediaRow) {
    Object.assign(this, partial);
  }
}
