import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { FileController } from './file.controller'
import { FILE_CSV_TASK_INSERT, FILE_CSV_TASK_REPORT } from './file.interface'
import { FileService } from './file.service'
import { FileTaskInsertProcessor } from './processor/file-task-insert.processor'
import { FileTaskReportProcessor } from './processor/file-task-report.processor'

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: FILE_CSV_TASK_INSERT,
        defaultJobOptions: {
          attempts: 2,
          backoff: { type: 'fixed', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: { count: 1000, age: 3600 * 8 },
        },
      },
      {
        name: FILE_CSV_TASK_REPORT,
        defaultJobOptions: {
          attempts: 1,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: { count: 1000, age: 3600 },
        },
      },
    ),
    BullBoardModule.forFeature(
      { name: FILE_CSV_TASK_INSERT, adapter: BullMQAdapter },
      { name: FILE_CSV_TASK_REPORT, adapter: BullMQAdapter },
    ),
  ],
  exports: [FileService],
  providers: [FileService, FileTaskInsertProcessor, FileTaskReportProcessor],
  controllers: [FileController],
})
export class FileModule {}
