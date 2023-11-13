import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { PrismaModule } from '../prisma.module'
import { PrismaService } from '../prisma.service'

describe(`PrismaModule`, () => {
  let app: INestApplication
  let prisma: DeepMocked<PrismaService>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createMock<PrismaClient>())
      .compile()
    prisma = module.get(PrismaService)
    app = module.createNestApplication()
    app.init()
  })

  it(`should be defined`, async () => {
    expect(app).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
