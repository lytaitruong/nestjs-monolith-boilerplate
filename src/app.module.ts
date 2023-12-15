import { CommonModule, configuration } from '@/common'
import { FastifyAdapter } from '@bull-board/fastify'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import { join } from 'path'
import { AuthModule } from './api/auth/auth.module'
import { FileModule } from './api/file/file.module'
import { TaskModule } from './api/task/task.module'
import { UserModule } from './api/user/user.module'
import { WebhookModule } from './api/webhook/webhook.module'
import { AppController } from './app.controller'
import { MetricModule } from './modules/metric'
import { PrismaModule } from './modules/prisma'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: ['.env'],
      load: [configuration],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: { path: join(__dirname, '/i18n/'), watch: true },
      resolvers: [
        { use: HeaderResolver, options: ['x-lang'] },
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
      ...(process.env.NODE_ENV === 'default'
        ? { typesOutputPath: join(__dirname, '../src/generated/i18n.generated.ts') }
        : {}),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          connection: {
            host: config.get('ioredis.host'),
            port: config.get('ioredis.port'),
            password: config.get('ioredis.password'),
          },
        }
      },
    }),
    BullBoardModule.forRoot({
      adapter: FastifyAdapter,
      route: '/queues',
    }),
    CommonModule,
    MetricModule,
    PrismaModule,
    AuthModule,
    UserModule,
    TaskModule,
    FileModule,
    WebhookModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
