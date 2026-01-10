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
  BadRequestException,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
import { MediaListResponseDto } from './dto/media-response.dto';
import { UploadMediaDto } from './dto/upload-media.dto';

@Controller('media')
@ApiTags('media')
// @UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file directly to storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        app: { type: 'string', enum: ['webchat', 'finance'] },
        ownerType: { type: 'string', enum: ['user', 'company'] },
        metadata: {
          type: 'string',
          description: 'Optional JSON string with metadata.',
          example: '{"source":"web","device":"mobile"}',
        },
      },
      required: ['file', 'app'],
    },
  })
  @ApiCreatedResponse({
    description: 'File uploaded successfully.',
    type: MediaEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid file type or payload.' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadMediaDto: UploadMediaDto,
    @Request() req,
  ) {
    const allowedApps = new Set(['webchat', 'finance']);
    const resolvedApp = req.user?.app ?? uploadMediaDto.app;
    if (!resolvedApp || !allowedApps.has(resolvedApp)) {
      throw new BadRequestException('Invalid app');
    }

    const resolvedOwnerType =
      req.user?.ownerType ?? uploadMediaDto.ownerType ?? 'user';

    let metadata: Record<string, unknown> | undefined;
    if (uploadMediaDto.metadata) {
      try {
        metadata = JSON.parse(uploadMediaDto.metadata);
      } catch {
        throw new BadRequestException('Invalid metadata JSON');
      }
    }

    const user = {
      app: resolvedApp,
      ownerType: resolvedOwnerType,
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
