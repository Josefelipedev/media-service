import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ListMediaDto {
  @IsString()
  @IsOptional()
  app?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['user', 'company'])
  ownerType?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  type?: string;
}
