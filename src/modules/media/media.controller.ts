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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MediaEntity } from './entities/media.entity';
import {
  CreatePresignResponseDto,
  MediaListResponseDto,
} from './dto/media-response.dto';

@Controller('media')
@ApiTags('media')
// @UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign-url')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a presigned upload URL' })
  @ApiCreatedResponse({
    description: 'Presigned URL created.',
    type: CreatePresignResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid payload or file type.' })
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
  @ApiOperation({ summary: 'Upload a file directly to storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        metadata: {
          type: 'string',
          description: 'Optional JSON string with metadata.',
          example: '{"source":"web"}',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'File uploaded successfully.',
    type: MediaEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid file type or payload.' })
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
  @ApiOperation({ summary: 'List media items' })
  @ApiBearerAuth('JWT')
  @ApiQuery({ name: 'app', required: false, type: String })
  @ApiQuery({ name: 'ownerType', required: false, enum: ['user', 'company'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiOkResponse({
    description: 'Media list.',
    type: MediaListResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async listMedia(
    @Query() listMediaDto: ListMediaDto,
    @User() user: JwtPayload,
  ) {
    return this.mediaService.listMedia(listMediaDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a media item' })
  @ApiBearerAuth('JWT')
  @ApiParam({ name: 'id', description: 'Media ID' })
  @ApiBody({ type: DeleteMediaDto })
  @ApiNoContentResponse({ description: 'Media deleted.' })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async deleteMedia(
    @Param('id') id: string,
    @Body() deleteMediaDto: DeleteMediaDto,
    @User() user: JwtPayload,
  ) {
    return this.mediaService.deleteMedia(id, deleteMediaDto, user);
  }
}
