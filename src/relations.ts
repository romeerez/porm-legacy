import {singular} from 'pluralize'
import {quote} from 'pg-adapter'
import porm, {Model} from './model'
import {join} from './utils'

export type BelongsToOptions<T> = {
  primaryKey?: string
  foreignKey?: string
}

export const belongsTo = <T extends Model<any>, P>(self: any, fn: (params: P) => T, {
  primaryKey,
  foreignKey,
}: BelongsToOptions<T> = {}) => () => {
  const model = fn(null as any).clone()
  const pk = primaryKey || model.primaryKey
  const fk = foreignKey || join(self, singular(model.table), pk)
  const query = (params: P) => {
    const id = (params as any)[fk]
    return model.and({[pk]: id}).take()
  }

  const subquery = (as = self.table) =>
    model.and(`${model.quotedTable}."${pk}" = "${as}"."${fk}"`)

  query.json = () =>
    subquery().take().json()

  query.subquery = subquery
  query.sourceModel = model
  return query
}

export const hasThrough = <T, P>(self: Model<any>, model: T, joinQuery: any, sourceQuery: any, many: boolean) => {
  const query: any = many ?
    (params: P) => sourceQuery.subquery().join(joinQuery(params)).merge(model) :
    (params: P) => sourceQuery.subquery().join(joinQuery(params)).merge(model).take()

  const subquery = () =>
    sourceQuery.subquery().join(joinQuery.subquery()).merge(model)

  query.json = many ? () => subquery().json() : () => subquery().take().json()

  query.subquery = subquery
  query.sourceModel = model
  return query
}

export type HasOptions<T> = {
  primaryKey?: string
  foreignKey?: string
  through?: string
  source?: string
}

export const has = <T extends Model<any>, P>
(
  many: boolean,
  self: Model<any>,
  fn: (params: P) => T,
  {primaryKey, foreignKey, through, source}: HasOptions<T> = {}
) => (name: string) => {
  const model = fn(null as any).clone()

  if (through) {
    const sourceModel = (self as any)[through].sourceModel as Model<any>
    if (source) name = source
    else if (!(sourceModel as any)[name]) name = singular(name)
    const sourceQuery = (sourceModel as any)[name]
    return hasThrough<T, P>(self, model, (self as any)[through], sourceQuery, many)
  }

  const pk = primaryKey || self.primaryKey
  const fk = `${model.quotedTable}."${join(self, foreignKey || singular(self.table), pk)}"`

  const query: any = many ?
    (params: P) => {
      const id = (params as any)[pk]
      return model.and(`${fk} = ${quote(id)}`)
    } : (params: P) => {
      const id = (params as any)[pk]
      return model.and(`${fk} = ${quote(id)}`).take()
    }

  const subquery = (as = self.table) =>
    model.and(`${fk} = "${as}"."${pk}"`)

  query.json = many ? () => subquery().json() : () => subquery().take().json()

  query.subquery = subquery
  query.sourceModel = model
  return query
}

export const hasOne = <T extends Model<any>, P>(
  self: Model<any>, fn: (params: P) => T, options: HasOptions<T> = {}
) => has(false, self, fn, options)

export const hasMany = <T extends Model<any>, P>(
  self: Model<any>, fn: (params: P) => T, options: HasOptions<T> = {}
) => has(true, self, fn, options)

export interface HasAndBelongsToManyOptions<T> {
  primaryKey?: string
  foreignKey?: string
  joinTable?: string
  associationForeignKey?: string
}

export const hasAndBelongsToMany = <T extends Model<any>, P>(
  self: Model<any>, fn: (params: P) => T, {
    primaryKey,
    foreignKey,
    joinTable,
    associationForeignKey,
  }: HasAndBelongsToManyOptions<T> = {}
) => (name: string) => {
  const sourceModel = fn(null as any)
  const jt = joinTable || join(self, ...[self.table, sourceModel.table].sort())

  const joinModel = porm(self.db, self.config)(jt)

  const joinQuery = hasMany(self, (params: P) => joinModel, {primaryKey, foreignKey})(name)

  const sourceQuery = belongsTo(joinModel, () => sourceModel.model, {foreignKey: associationForeignKey})()

  return hasThrough<T, undefined>(self, sourceModel, joinQuery, sourceQuery, true)
}
