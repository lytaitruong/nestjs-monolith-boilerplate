import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { configuration } from './app.config'
import { AppController } from './app.controller'
import { PrismaModule } from './modules/prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: ['.env'],
      load: [configuration],
    }),
    PrismaModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
