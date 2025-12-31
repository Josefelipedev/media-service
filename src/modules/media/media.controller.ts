import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePresignDto } from './dto/create-presign.dto';
import { DeleteMediaDto } from './dto/delete-media.dto';
import { ListMediaDto } from './dto/list-media.dto';
import { User } from '../../common/decorators/user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('media')
// @UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign-url')
  @HttpCode(HttpStatus.CREATED)
  async createPresignUrl(
    @Body() createPresignDto: CreatePresignDto,
    // @User() user: JwtPayload,
  ) {
    // const key = `${user.app}/${user.ownerType}/${user.userId}/${timestamp}-${fileName}`;
    return this.mediaService.createPresignedUrl(createPresignDto, {
      app: 'finance',
      ownerType: 'user',
      userId: 'anonymous',
    });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: any,
    @Request() req,
  ) {
    const user = {
      app: 'finance',
      ownerType: 'user',
      userId: req.user?.userId || 'anonymous',
    };

    return this.mediaService.uploadFileDirectly(file, metadata, user);
  }
  @Get()
  async listMedia(
    @Query() listMediaDto: ListMediaDto,
    @User() user: JwtPayload,
  ) {
    return this.mediaService.listMedia(listMediaDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(
    @Param('id') id: string,
    @Body() deleteMediaDto: DeleteMediaDto,
    @User() user: JwtPayload,
  ) {
    return this.mediaService.deleteMedia(id, deleteMediaDto, user);
  }
}
