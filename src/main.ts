import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { Env, setupSwagger } from './common'
import { HttpExceptionFilter } from './common/middleware'

async function bootstrap() {
  const adapter = new FastifyAdapter()
  adapter.getInstance().addHook('onRoute', (opts) => {
    if (opts.path === '/api/v1/healthcheck' || opts.path.startsWith('/api/v1/docs')) opts.logLevel = 'error'
  })

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter)

  const config = app.get(ConfigService)
  const logger = new Logger('Main')

  // GLOBAL MIDDLEWARE
  app.useGlobalFilters(new HttpExceptionFilter())

  // CONFIG
  const { port, version, service } = config.get('app')
  app.setGlobalPrefix(`api/${version}`)

  // SWAGGER
  if (config.get('env') !== Env.PRODUCTION) {
    setupSwagger(app, version, service)
  }

  // EXIT
  app.enableShutdownHooks()

  // START
  await app.listen(port, '0.0.0.0')
  logger.log(`🚀 Application is running on: http://localhost:${port}/api/${version}`)
}
bootstrap()
