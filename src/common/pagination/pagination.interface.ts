export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 10,
  MAXIMUM_PAGE: 100,
  MAXIMUM_SIZE: 100,
}

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
