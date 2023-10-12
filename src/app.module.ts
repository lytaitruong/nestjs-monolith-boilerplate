import { CommonModule, configuration } from '@/common'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './api/auth/auth.module'
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
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
