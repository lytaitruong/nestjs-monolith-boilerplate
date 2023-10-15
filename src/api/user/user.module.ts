import { S3Module } from '@/modules/s3'
import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [S3Module],
  exports: [UserService],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
