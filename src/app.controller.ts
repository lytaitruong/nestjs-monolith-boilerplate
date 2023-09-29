import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'

@Controller()
export class AppController {
  @ApiTags('healthcheck')
  @ApiOkResponse({ schema: { example: 'Ping!' }, description: 'Server alive' })
  @Get('healthcheck')
  getHealthcheck() {
    return 'Ping!'
  }
}
