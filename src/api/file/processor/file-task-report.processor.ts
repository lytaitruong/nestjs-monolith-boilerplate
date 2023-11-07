import { PrismaService } from '@/modules/prisma'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import type { Job } from 'bullmq'
import { FILE_CSV_TASK_REPORT, IFileTaskReport, TaskReportJob } from '../file.interface'

@Processor(FILE_CSV_TASK_REPORT, { concurrency: 1, limiter: { max: 20, duration: 30000 } })
export class FileTaskReportProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async process(job: Job<IFileTaskReport, string, TaskReportJob>) {
    switch (job.name) {
      case 'report-success': {
        // Implement notification or email to notice end-user know the state
        break
      }
      case 'report-failed': {
        await this.prisma.task.deleteMany({ where: { userId: job.data.sub, createdAt: job.data.date } })
        // Implement notification or email to notice end-user know the state
        break
      }
    }
  }
}
