import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })

  const config = app.get(ConfigService)
  const logger = new Logger('Main')

  // CONFIG
  const { port, version } = config.get('app')
  app.setGlobalPrefix(`api/${version}`)

  // EXIT
  app.enableShutdownHooks()

  // START
  await app.listen(port, '0.0.0.0')
  logger.log(`🚀 Application is running on: http://localhost:${port}/api/${version}`)
}
bootstrap()
