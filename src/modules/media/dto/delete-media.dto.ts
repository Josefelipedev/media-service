import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteMediaDto {
  @ApiPropertyOptional({
    description: 'If true, performs a permanent delete.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  permanent?: boolean = false;
}
