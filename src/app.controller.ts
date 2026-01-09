import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('root')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Service root' })
  @ApiOkResponse({ description: 'Service status message.' })
  root() {
    return 'Hello World';
  }
}
