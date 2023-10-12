import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'
import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Cache } from 'cache-manager'
import { RedisStore, redisStore } from 'cache-manager-ioredis-yet'
import { LoggerModule } from 'nestjs-pino'
import { Env } from './common.enum'
import { IConfig, IConfigIoredis, IReq } from './common.interface'

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const { enable, ...ioredis } = config.get<IConfigIoredis>('ioredis')
        return enable ? { store: await redisStore(ioredis) } : {}
      },
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<IConfig>) => {
        const { version } = config.get('app')
        return {
          pinoHttp: {
            useLevel: 'info',
            level: config.get('env') !== Env.PRODUCTION ? 'debug' : 'info',
            redact: ['req.headers.authorization', 'req.headers.cookie', 'body.password'],
            autoLogging: {
              ignore: (req) => {
                return (
                  (req as unknown as IReq).originalUrl === `/api/${version}/healthcheck` ||
                  (req as unknown as IReq).originalUrl.startsWith(`/api/${version}/docs`)
                )
              },
            },
            transport: {
              targets: [
                {
                  target: 'pino-pretty',
                  level: 'info',
                  options: {
                    levelFirst: true,
                    singleLine: true,
                    colorize: true,
                    translateTime: "yyyy-mm-dd'T'HH:MM:ss.l'Z'",
                    ignore: 'pid,hostname,context,res,responseTime',
                    errorLikeObjectKeys: ['err', 'error'],
                  },
                },
              ],
            },
            forRoutes: ['*'],
            exclude: [
              `/api/${version}/healthcheck`,
              `/api/${version}/docs`,
              `/api/${version}/docs/swagger-ui-init.js`,
              `/api/${version}/docs/swagger-ui.css`,
              `/api/${version}/docs/swagger-ui-bundle.js`,
              `/api/${version}/docs/swagger-ui-standalone-preset.js`,
              `/api/${version}/docs/favicon-32x32.png`,
            ],
          },
        }
      },
    }),
  ],
})
export class CommonModule implements OnModuleDestroy {
  constructor(
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  onModuleDestroy() {
    if (this.config.get<IConfigIoredis>('ioredis').enable) {
      ;(this.cache.store as RedisStore).client.quit()
    }
  }
}
