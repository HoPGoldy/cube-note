import knex from 'knex'
import {UserStorage } from '@/types/user'
import { TABLE_NAME } from '@/constants'
import { ArticleStorage } from '@/types/article'
import { TagGroupStorage, TagStorage } from '@/types/tag'
import { FileStorage } from '@/types/file'

interface Props {
    dbPath: string
}

export const createDb = (props: Props) => {
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

    // 标签分组表
    sqliteDb.schema.hasTable(TABLE_NAME.TAG_GROUP).then(exists => {
        if (exists) return
        return sqliteDb.schema.createTable(TABLE_NAME.TAG_GROUP, t => {
            t.increments('id').primary()
            t.text('title').notNullable()
            t.integer('createUserId')
        })
    })

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

    return {
        user: () => sqliteDb<UserStorage>(TABLE_NAME.USER),
        article: () => sqliteDb<ArticleStorage>(TABLE_NAME.ARTICLE),
        tag: () => sqliteDb<TagStorage>(TABLE_NAME.TAG),
        tagGroup: () => sqliteDb<TagGroupStorage>(TABLE_NAME.TAG_GROUP),
        file: () => sqliteDb<FileStorage>(TABLE_NAME.FILE),
    }
}

export type DatabaseAccessor = ReturnType<typeof createDb>