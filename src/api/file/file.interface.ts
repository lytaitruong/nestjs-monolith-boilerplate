export const FILE_CSV_TASK_INSERT = 'file-task-insert'
export const FILE_CSV_TASK_REPORT = 'file-task-report'

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
  status: 'success' | 'failed'
  failedRecord: string[]
  totalRecord?: number
}
