import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'

@Controller()
export class AppController {
  @Get('healthcheck')
  @ApiTags('healthcheck')
  @ApiOkResponse({ schema: { example: 'Ping!' }, description: 'Server alive' })
  getHealthcheck() {
    return 'Ping!'
  }
}
