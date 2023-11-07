import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { PaginatedResult } from 'prisma-pagination'
import { Observable, map } from 'rxjs'
import { IPaginationRes } from '../pagination'

export class HttpInterceptor<T> implements NestInterceptor<T> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<T | IPaginationRes<T>> | Promise<Observable<T | IPaginationRes<T>>> {
    return next
      .handle()
      .pipe(
        map((data: T | PaginatedResult<T>) =>
          typeof data === 'object' && (data as PaginatedResult<T>)?.meta
            ? this.formatPagination(data as PaginatedResult<T>)
            : (data as T),
        ),
      )
  }

  private formatPagination<T>({ data, meta }: PaginatedResult<T>): IPaginationRes<T> {
    return {
      data,
      meta: {
        page: meta.currentPage,
        last: meta.lastPage,
        size: meta.perPage,
        next: meta.next,
        prev: meta.prev,
        total: meta.total,
      },
    }
  }
}
