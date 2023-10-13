import { Pag, Res } from '../common.interface'

export interface IBaseService<Result, Create, Update, Params, Query, Info> {
  getAll(info: Info, param: Params, query: Query): Promise<Pag<Result>>
  create(info: Info, param: Params, data: Create): Promise<Res<Result>>
  update(info: Info, param: Params, data: Update): Promise<Res<Result>>
  getOne(info: Info, param: Params): Promise<Res<Result> | null>
  remove(info: Info, param: Params): Promise<Res<Result> | null>
}
