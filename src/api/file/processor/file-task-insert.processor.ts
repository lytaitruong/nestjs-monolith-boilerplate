import { PrismaService } from '@/modules/prisma'
import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job, Queue } from 'bullmq'
import { FILE_CSV_TASK_INSERT, FILE_CSV_TASK_REPORT, IFileTaskInsert, IFileTaskReport } from '../file.interface'

@Processor(FILE_CSV_TASK_INSERT, { concurrency: 4, limiter: { max: 20, duration: 30000 } })
export class FileTaskInsertProcessor extends WorkerHost {
  private readonly logger = new Logger(FileTaskInsertProcessor.name)

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(FILE_CSV_TASK_REPORT) private readonly queue: Queue<IFileTaskReport>,
  ) {
    super()
  }

  async process(job: Job<IFileTaskInsert, any, string>): Promise<number> {
    try {
      const response = await this.prisma.task.createMany({
        data: job.data.data.map((item) => ({ ...item, userId: job.data.sub, createdAt: job.data.date })),
        skipDuplicates: true,
      })
      if (job.data.last) {
        this.queue.add('report-notification', { status: 'success', totalRecord: 0, failedRecord: [] })
      }
      return response.count
    } catch (error) {
      // Implement later
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
