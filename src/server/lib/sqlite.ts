import sqlite3 from 'sqlite3'
import knex from 'knex'
import { AppTheme, UserStorage } from '@/types/user'
import { TABLE_NAME } from '@/constants'
import { ArticleStorage } from '@/types/article'
import { TagStorage } from '@/types/tag'

interface Props {
    dbPath: string
}

const { Database } = sqlite3.verbose()

export const createDb = (props: Props) => {
    const db = new Database(props.dbPath)

    const sqliteDb = knex({
        client: 'sqlite3',
        connection: { filename: props.dbPath },
        useNullAsDefault: true
    })

    // 用户表
    sqliteDb.schema.hasTable(TABLE_NAME.USER).then(exists => {
        if (exists) return
        return sqliteDb.schema.createTable(TABLE_NAME.USER, t => {
            t.increments('id').primary()
            t.string('username').notNullable()
            t.string('passwordHash').notNullable()
            t.string('passwordSalt').notNullable()
            t.timestamp('initTime').notNullable()
            t.integer('rootArticleId')
            t.string('theme').notNullable()
            t.boolean('isAdmin').notNullable()
        })
    })

    const queryUser = () => sqliteDb<UserStorage>(TABLE_NAME.USER)

    // 文章表
    sqliteDb.schema.hasTable(TABLE_NAME.ARTICLE).then(exists => {
        if (exists) return
        return sqliteDb.schema.createTable(TABLE_NAME.ARTICLE, t => {
            t.increments('id').primary()
            t.text('title').notNullable()
            t.text('content').notNullable()
            t.timestamp('createTime').notNullable()
            t.timestamp('updateTime').notNullable()
            t.text('parentPath').notNullable()
            t.integer('createUserId').notNullable()
        })
    })

    const queryArticle = () => sqliteDb<ArticleStorage>(TABLE_NAME.ARTICLE)

    // 标签表
    sqliteDb.schema.hasTable(TABLE_NAME.TAG).then(exists => {
        if (exists) return
        return sqliteDb.schema.createTable(TABLE_NAME.TAG, t => {
            t.increments('id').primary()
            t.text('title').notNullable()
            t.string('color').notNullable()
            t.integer('groupId')
            t.integer('createUserId')
        })
    })

    const queryTag = () => sqliteDb<TagStorage>(TABLE_NAME.TAG)

    // 标签分组表
    sqliteDb.schema.hasTable(TABLE_NAME.TAG_GROUP).then(exists => {
        if (exists) return
        return sqliteDb.schema.createTable(TABLE_NAME.TAG_GROUP, t => {
            t.increments('id').primary()
            t.text('title').notNullable()
            t.integer('createUserId')
        })
    })

    const queryTagGroup = () => sqliteDb<TagStorage>(TABLE_NAME.TAG_GROUP)

    // 附件表
    sqliteDb.schema.hasTable(TABLE_NAME.FILE).then(exists => {
        if (exists) return
        return sqliteDb.schema.createTable(TABLE_NAME.FILE, t => {
            t.increments('id').primary()
            t.string('md5').notNullable()
            t.text('filename').notNullable()
            t.string('type').notNullable()
            t.integer('size').notNullable()
            t.integer('createUserId')
            t.timestamp('createTime').notNullable()
        })
    })

    const queryFile = () => sqliteDb<TagStorage>(TABLE_NAME.FILE)

    const dbRun = <T = any>(sql: string, params?: T[]) => {
        return new Promise<void>((resolve, reject) => {
            db.run(sql, params, err => {
                if (err) reject(err)
                else resolve()
            })
        })
    }

    const dbGet = <R = any, T = any>(sql: string, params?: T[]) => {
        return new Promise<R>((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err)
                else resolve(row)
            })
        })
    }

    const dbAll = <R = any, T = any>(sql: string, params?: T[]) => {
        return new Promise<R[]>((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err)
                else resolve(rows)
            })
        })
    }

    return { queryUser, queryArticle, queryTag, queryTagGroup, queryFile, dbRun, dbGet, dbAll }
}

export type DatabaseAccessor = ReturnType<typeof createDb>