import { UserStorage } from '@/types/user'
import { createSqlInsert, createSqlUpdate } from '@/utils/sqlite'
import sqlite3 from 'sqlite3'

interface Props {
    dbPath: string
}

const { Database } = sqlite3.verbose()

export const createDb = (props: Props) => {
    const db = new Database(props.dbPath)
    
    db.run(`CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY NOT NULL,
        passwordHash TEXT NOT NULL,
        passwordSalt TEXT NOT NULL,
        initTime INTEGER NOT NULL,
        rootArticleId TEXT NOT NULL,
        theme TEXT NOT NULL,
        favoriteArticleIds TEXT,
        isAdmin INTEGER
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        createTime INTEGER NOT NULL,
        updateTime INTEGER NOT NULL,
        relatedArticleIds TEXT,
        parentArticleId TEXT,
        tagIds TEXT
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

    /**
     * 获取用户基本数据
     * @param username 用户名
     */
    const getUserStorage = async (username: string) => {
        return dbGet<UserStorage>('SELECT * FROM users WHERE username = ?', [username])
    }

    /**
     * 更新指定用户基本数据
     * 若不存在该用户则新增
     */
    const updateUserStorage = async (username: string, next: Partial<UserStorage>) => {
        const prev = await getUserStorage(username)
        if (!prev) return dbRun(createSqlInsert('users', { ...next, username }))

        return dbRun(createSqlUpdate(
            'users',
            { ...prev, ...next },
            { username }
        ))
    }

    return { dbRun, dbGet, dbAll, getUserStorage, updateUserStorage }
}

export type DatabaseAccessor = ReturnType<typeof createDb>