import { JwtInfo } from '@/modules/guard'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { randomUUID } from 'crypto'
import { Options, parse } from 'csv-parse'
import { Readable } from 'stream'
import { FileCreateDto } from './file.dto'
import { FILE_CSV_TASK_INSERT, IFileTaskData, IFileTaskInsert, TaskInsertJob } from './file.interface'

@Injectable()
export class FileService {
  constructor(
    @InjectQueue(FILE_CSV_TASK_INSERT) private readonly queue: Queue<IFileTaskInsert, string, TaskInsertJob>,
  ) {}

  async create(info: JwtInfo, data: FileCreateDto, date = new Date()) {
    const execute = async (readable: Readable, records: IFileTaskData[], data: IFileTaskData) => {
      if (records.length > 10_000) {
        readable.pause()
        await this.queue.add('insert-write', { sub: info.sub, data: records, date })
        records.length = 0
        readable.resume()
      }
      records.push(data)
    }
    const remain = await this.parseCSV(Readable.from(await data.file.toBuffer()), execute)
    this.queue.add('insert-write', { sub: info.sub, data: remain, date, last: true })

    return { id: randomUUID() }
  }

  parseCSV<E, T>(
    readable: Readable,
    execute: (readable: Readable, records: T[], data: E) => void,
    records: T[] = [],
    { encoding = 'utf-8', trim = true, columns = true, skip_empty_lines = true, ...other }: Options = {},
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      readable
        .pipe(parse({ trim, encoding, columns, skip_empty_lines, ...other }))
        .on('end', () => resolve(records))
        .on('error', (error) => reject(error))
        .on('data', async function (data) {
          //! Technical debt must be paid
          //! Be careful in here, It took at least my 4 hours to figure out why this shit not working correctly
          return execute(this, records, data)
        })
    })
  }
}
