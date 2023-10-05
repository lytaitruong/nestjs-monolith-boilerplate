import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [],
  exports: [UserService],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
