import { PrismaService } from '@/modules/prisma'
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { FILE_CSV_TASK_REPORT, IFileTaskReport } from '../file.interface'

@Processor(FILE_CSV_TASK_REPORT, { concurrency: 1, limiter: { max: 20, duration: 30000 } })
export class FileTaskReportProcessor extends WorkerHost {
  private readonly logger = new Logger(FileTaskReportProcessor.name)

  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async process(job: Job<IFileTaskReport, string, string>) {
    switch (job.name) {
      case 'report-success': {
        // Implement notification or email to notice end-user know the state
        break
      }
      case 'report-failed': {
        // Implement notification or email to notice end-user know the state
        break
      }
      default: {
        throw new Error('Queue is not existed')
      }
    }
  }

  @OnWorkerEvent('completed')
  async onWorkerCompleted(data: Job) {
    this.logger.log(data.returnvalue)
  }

  @OnWorkerEvent('failed')
  async onWorkerFailed(data: Job) {
    this.logger.error(data.failedReason)
  }
}
