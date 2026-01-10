import { ApiProperty } from '@nestjs/swagger';
import { MediaEntity } from '../entities/media.entity';

export class MediaListResponseDto {
  @ApiProperty({
    description: 'List of media items.',
    type: MediaEntity,
    isArray: true,
  })
  items: MediaEntity[];

  @ApiProperty({ description: 'Total items count.' })
  total: number;

  @ApiProperty({ description: 'Current page.' })
  page: number;

  @ApiProperty({ description: 'Items per page.' })
  limit: number;

  @ApiProperty({ description: 'Total pages.' })
  totalPages: number;
}
