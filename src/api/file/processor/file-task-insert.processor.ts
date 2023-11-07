import { PrismaService } from '@/modules/prisma'
import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import type { Job, Queue } from 'bullmq'
import {
  FILE_CSV_TASK_INSERT,
  FILE_CSV_TASK_REPORT,
  IFileTaskInsert,
  IFileTaskReport,
  TaskReportJob,
} from '../file.interface'

@Processor(FILE_CSV_TASK_INSERT, { concurrency: 4, limiter: { max: 20, duration: 30000 } })
export class FileTaskInsertProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(FILE_CSV_TASK_REPORT) private readonly queue: Queue<IFileTaskReport, string, TaskReportJob>,
  ) {
    super()
  }

  async process(job: Job<IFileTaskInsert, string, string>): Promise<number> {
    const response = await this.prisma.task.createMany({
      data: job.data.data.map((item) => ({ ...item, userId: job.data.sub, createdAt: job.data.date })),
      skipDuplicates: true,
    })
    return response.count
  }

  @OnWorkerEvent('completed')
  async onWOrkerCompleted(job: Job<IFileTaskInsert, number, string>) {
    if (job.data.last) {
      const total = await this.prisma.task.count({ where: { userId: job.data.sub, createdAt: job.data.date } })
      await this.queue.add('report-success', { sub: job.data.sub, date: job.data.date, totalRecord: total })
    }
  }

  @OnWorkerEvent('failed')
  async onWorkerFailed(job: Job<IFileTaskInsert, string, string>) {
    if (job.data.last) {
      const total = await this.prisma.task.count({ where: { userId: job.data.sub, createdAt: job.data.date } })
      await this.queue.add('report-failed', { sub: job.data.sub, date: job.data.date, totalRecord: total })
    }
  }
}
