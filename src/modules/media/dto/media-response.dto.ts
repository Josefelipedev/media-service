import { ApiProperty } from '@nestjs/swagger';
import { MediaEntity } from '../entities/media.entity';

export class CreatePresignResponseDto {
  @ApiProperty({
    description: 'Presigned URL for uploading the file.',
    example: 'https://storage.example.com/path/to/file?signature=...',
  })
  uploadUrl: string;

  @ApiProperty({
    description: 'Created media record ID.',
    example: 'clx123abc456def789',
  })
  mediaId: string;

  @ApiProperty({
    description: 'Storage key for the media object.',
    example: 'finance/user/1234567890-avatar.png',
  })
  key: string;

  @ApiProperty({
    description: 'Expiration timestamp for the presigned URL.',
    example: '2025-01-01T00:00:00.000Z',
  })
  expiresAt: Date;
}

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
