import sqlite3 from 'sqlite3'

interface Props {
    dbPath: string
}

const { Database } = sqlite3.verbose()

export const createDb = (props: Props) => {
    const db = new Database(props.dbPath)

    // 用户表
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        username TEXT NOT NULL,
        passwordHash TEXT NOT NULL,
        passwordSalt TEXT NOT NULL,
        initTime INTEGER NOT NULL,
        rootArticleId TEXT NOT NULL,
        theme TEXT NOT NULL,
        favoriteArticleIds TEXT,
        isAdmin INTEGER
    )`)

    // 文章表
    db.run(`CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        createTime INTEGER NOT NULL,
        updateTime INTEGER NOT NULL,
        relatedArticleIds TEXT,
        parentArticleId TEXT,
        createUserId TEXT NOT NULL,
        tagIds TEXT
    )`)

    // 标签表
    db.run(`CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        color TEXT NOT NULL,
        createUserId TEXT NOT NULL,
        groupId TEXT
    )`)

    // 标签分组表
    db.run(`CREATE TABLE IF NOT EXISTS tagGroups (
        id TEXT PRIMARY KEY NOT NULL,
        createUserId TEXT NOT NULL,
        title TEXT NOT NULL
    )`)

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

    return { dbRun, dbGet, dbAll }
}

export type DatabaseAccessor = ReturnType<typeof createDb>