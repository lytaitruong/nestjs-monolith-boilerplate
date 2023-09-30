export enum Sort {
  ASC = 'asc',
  DESC = 'desc',
}

export interface IPaginationParams<T> {
  page: number
  size: number
  sort?: { [data in keyof T]: Sort }
  filter?: keyof T[]
  search?: string
  export?: boolean
}

export interface IPaginationMeta {
  page: number
  last: number
  size: number
  next: number | null
  prev: number | null
  total: number
  link?: { [key: string]: string }
}

export type IPaginationRes<T> = {
  data: T[]
  meta: IPaginationMeta
}
