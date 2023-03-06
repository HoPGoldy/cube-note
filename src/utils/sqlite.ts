import isNil from 'lodash/isNil'
import { customAlphabet } from 'nanoid'

/**
 * 生成应用中数据的唯一 id
 */
export const createId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 15)

/**
 * 将值转成 SQL 语句中的值
 */
export const createSqlValue = (value: string | number | boolean) => {
    if (typeof value === 'string') return `'${value}'`
    // 如果值是布尔的话，就转成 1 或 0
    if (typeof value === 'boolean') return value ? '1' : '0'
    return `${value}`
}

const formatSqlValues = (value: Record<string, any>) => {
    const keys: string[] = []
    const values: string[] = []
    Object.entries(value).forEach(([ key, value ]) => {
        if (isNil(value)) return
        keys.push(key)
        values.push(createSqlValue(value))
    })

    return { keys, values }
}

/**
 * 生成 sql 语句中的 value 部分
 */
export const createSqlValueSet = (value: Record<string, any>) => {
    const { keys, values } = formatSqlValues(value)
    return keys.map((key, index) => `${key} = ${values[index]}`).join(', ')
}

/**
 * 生成 sql 插入语句
 */
export const sqlInsert = (tableName: string, value: Record<string, any>) => {
    const { keys, values } = formatSqlValues(value)

    return `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${values.join(', ')});`
}

/**
 * 生成 sql 插入多条语句
 */
export const sqlInsertMany = (tableName: string, values: Record<string, any>[]) => {
    const { keys } = formatSqlValues(values[0])

    const valueSets = values.map(value => {
        const { values } = formatSqlValues(value)
        return `SELECT ${values.join(', ')}`
    })

    return `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES ${valueSets.join(' UNION ALL ')};`
}

export type SqlWhere<T = Record<string, any>> = T | string | Array<T | string | 'AND' | 'OR'>

const sqlWhereSet = (value: Record<string, any>) => {
    const { keys, values } = formatSqlValues(value)
    return keys.map((key, index) => `${key} = ${values[index]}`).join(' AND ')
}

/**
 * 生成 sql where 部分
 */
export const createSqlWhere = <T extends Record<string, any>>(where: SqlWhere<T>) => {
    if (typeof where === 'string') return where

    if (!Array.isArray(where)) return sqlWhereSet(where)

    const whereSet: string[] = []
    where.forEach(item => {
        if (item === 'AND' || item === 'OR') whereSet.push(item)
        else if (typeof item === 'string') whereSet.push(item)
        else whereSet.push(sqlWhereSet(item))
    })

    return whereSet.join(' ')
}

/**
 * 生成 sql 更新语句
 */
export const sqlUpdate = (tableName: string, value: Record<string, any>, where: SqlWhere) => {
    const valueSet = createSqlValueSet(value)
    const whereSet = createSqlWhere(where)

    return `UPDATE ${tableName} SET ${valueSet} WHERE ${whereSet};`
}

/**
 * 生成 sql 查询语句
 */
export const sqlSelect = <T extends Record<string, any>>(
    tableName: string,
    where: SqlWhere<Partial<T>>,
    select?: Array<keyof T | string>
) => {
    const whereSet = createSqlWhere(where)
    return `SELECT ${select ? select.join(', ') : '*'} FROM ${tableName} WHERE ${whereSet};`
}

/**
 * 生成 sql 删除语句
 */
export const sqlDelete = <T extends Record<string, any>>(
    tableName: string,
    where: SqlWhere<Partial<T>>
) => {
    const whereSet = createSqlWhere(where)
    return `DELETE FROM ${tableName} WHERE ${whereSet};`
}