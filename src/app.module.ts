import { CommonModule, configuration } from '@/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Module, OnModuleDestroy } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Cache } from 'cache-manager'
import { RedisStore } from 'cache-manager-ioredis-yet'
import { UserModule } from './api/user/user.module'
import { AppController } from './app.controller'
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
    CommonModule,
    PrismaModule,
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule implements OnModuleDestroy {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  onModuleDestroy() {
    ;(this.cache.store as RedisStore).client.quit()
  }
}
