import { createMock } from '@golevelup/ts-jest'
import { Test } from '@nestjs/testing'
import { PrismaModule } from '../prisma.module'
import { PrismaService } from '../prisma.service'

describe(`PrismaModule`, () => {
  it(`Should compile the module`, async () => {
    const module = await Test.createTestingModule({
      imports: [PrismaModule],
    })
      .useMocker(createMock)
      .compile()

    expect(module).toBeDefined()
    expect(module.get(PrismaService)).toBeInstanceOf(PrismaService)
  })
})
