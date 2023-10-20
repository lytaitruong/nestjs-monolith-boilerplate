import { Body, Delete, Get, Param, Post, Put, Query, Req, Res, Type } from '@nestjs/common'
import { ApiBody, ApiParam, ApiQuery, OmitType } from '@nestjs/swagger'
import { HEADERS } from '../common.constant'
import { IReq, IRes } from '../common.interface'
import { ApiPassedRes } from '../document'
import { ApiPaginateRes } from '../pagination'
import { IBaseService } from './base.interface'
import { AbstractValidationPipe } from './base.validation'

export const BaseController = <R, C, U, P, Q, T = any>(
  result: Type<R>,
  create: Type<C>,
  update: Type<U>,
  param: Type<P>,
  query: Type<Q>,
) => {
  const createPipe = new AbstractValidationPipe({ whitelist: true, transform: true }, { body: create })
  const updatePipe = new AbstractValidationPipe({ whitelist: true, transform: true }, { body: update })
  const queryPipe = new AbstractValidationPipe({ whitelist: true, transform: true }, { query })
  const paramPipe = new AbstractValidationPipe({ whitelist: true, transform: true }, { param })
  const shortPipe = new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { param: OmitType(param, ['id' as any]) },
  )

  class CrudController {
    constructor(public readonly service: IBaseService<R, C, U, P, Q, T>) {}

    @Get()
    @ApiPaginateRes(result)
    @ApiQuery({ type: query })
    async getAll(
      @Req() req: IReq<T>,
      @Param(shortPipe) param: P,
      @Query(queryPipe) query: Q,
      @Res() res: IRes,
      ...others: []
    ) {
      const result = await this.service.getAll(req.user, param, query, ...others)
      if (!query['export']) return res.send(result)

      return res
        .header(HEADERS.CONTENT_DISPOSITION, `attachment; filename=${query['filename'] || result['name']}`)
        .send(result['data'])
    }

    @Post()
    @ApiPassedRes(result)
    @ApiBody({ type: create })
    async create(@Req() req: IReq<T>, @Param(shortPipe) param: P, @Body(createPipe) data: C, ...others: []) {
      return this.service.create(req.user, param, data, ...others)
    }

    @Get(':id')
    @ApiPassedRes(result)
    @ApiParam({ name: 'id', type: String })
    async getOne(@Req() req: IReq<T>, @Param(paramPipe) param: P, ...others: []) {
      return this.service.getOne(req.user, param, ...others)
    }

    @Put(':id')
    @ApiPassedRes(result)
    @ApiParam({ name: 'id', type: String })
    @ApiBody({ type: update })
    async update(@Req() req: IReq<T>, @Param(paramPipe) param: P, @Body(updatePipe) data: U, ...others: []) {
      return this.service.update(req.user, param, data, ...others)
    }

    @Delete(':id')
    @ApiPassedRes(result)
    @ApiParam({ name: 'id', type: String })
    async remove(@Req() req: IReq<T>, @Param(paramPipe) param: P, ...others: []) {
      return this.service.remove(req.user, param, ...others)
    }
  }

  return CrudController
}
