import { CommonModule, configuration } from '@/common'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import { join } from 'path'
import { AuthModule } from './api/auth/auth.module'
import { TaskModule } from './api/task/task.module'
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
    CommonModule,
    PrismaModule,
    AuthModule,
    UserModule,
    TaskModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
