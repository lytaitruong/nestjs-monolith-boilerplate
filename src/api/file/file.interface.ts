export const FILE_CSV_TASK_INSERT = 'file-task-insert'
export const FILE_CSV_TASK_REPORT = 'file-task-report'

export type TaskInsertJob = 'insert-write'
export type TaskReportJob = 'report-success' | 'report-failed'

export interface IFileTaskData {
  title: string
  content: string
  hashtag: string[]
}

export interface IFileTaskInsert {
  sub: string
  data: IFileTaskData[]
  date: Date
  last?: boolean
}

export interface IFileTaskReport {
  sub: string
  date: Date
  totalRecord: number
}
