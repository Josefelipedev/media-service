import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class DeleteMediaDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  permanent?: boolean = false;
}
