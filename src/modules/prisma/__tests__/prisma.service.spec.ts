import { Env } from '@/common'
import { createMock } from '@golevelup/ts-jest'
import { INestApplication } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { PrismaService } from '../prisma.service'

describe(`PrismaService`, () => {
  let config: ConfigService
  let service: PrismaService
  let app: INestApplication

  describe.each<[Env]>([[Env.DEVELOPMENT], [Env.PRODUCTION], [Env.DEFAULT]])(
    `Prisma should defined when process.env.NODE_ENV=%s`,
    (env) => {
      beforeEach(async () => {
        jest.resetModules()
        jest.spyOn(PrismaClient.prototype, '$connect').mockImplementation(() => Promise.resolve())
        const module: TestingModule = await Test.createTestingModule({
          imports: [ConfigModule.forRoot({ isGlobal: true, load: [() => ({ env })] })],
          providers: [PrismaService],
        })
          .useMocker(createMock)
          .compile()
        config = module.get<ConfigService>(ConfigService)
        service = module.get<PrismaService>(PrismaService)

        app = module.createNestApplication()
        app.init()
      })

      afterEach(() => {
        jest.resetAllMocks()
        jest.clearAllMocks()
      })

      it(`should be defined`, () => {
        expect(config).toBeDefined()
        expect(service).toBeDefined()
      })
    },
  )
})
