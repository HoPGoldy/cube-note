/**
 * 数据库升级工具
 * 会检查 package.json 里的 version 和 storage/dbVersion 文件里的版本号是否一致
 * 不一致就会按照下面的方法依次升级至最高版本
 */

import { createAccessor } from '@/server/lib/fileAccessor'
import { getPackageVersion } from '@/server/utils'
import knex, { Knex } from 'knex'

type DbPatcher = (db: Knex) => Promise<void>

const DB_PATCH_LIST: Array<{ version: string, patcher: DbPatcher }> = [
    {
        version: '1.0.0',
        patcher: async (db) => {
            db.schema.hasTable('users').then(exists => {
                if (!exists) return
                return db.schema.alterTable('users', t => {
                    t.string('first_name')
                    t.string('last_name')
                })
            })
            
        }
    },
    {
        version: '1.1.0',
        patcher: async (db) => {
            db.schema.hasTable('users').then(exists => {
                if (!exists) return
                return db.schema.alterTable('users', t => {
                    t.string('first_name')
                    t.string('last_name')
                })
            })
            
        }
    }
]

export const upgradeDatabase = async () => {
    const packageVersion = getPackageVersion()
    const dbVersionFile = createAccessor({ fileName: 'dbVersion', getInitData: async () => packageVersion })
    const versionFile = await dbVersionFile.read()

    if (versionFile === packageVersion) return

    const sqliteDb = knex({
        client: 'sqlite3',
        connection: { filename: './.storage/cube-note.db' },
        useNullAsDefault: true
    })
    // console.log('数据库需要升级！', versionFile, packageVersion)
    // TODO 数据库升级功能

    // 先找到要执行的 patch 函数
    const startIndex = DB_PATCH_LIST.findIndex(item => item.version === versionFile)
    const endIndex = DB_PATCH_LIST.findIndex(item => item.version === packageVersion)
    const patchList = DB_PATCH_LIST.slice(startIndex + 1, endIndex + 1)

    // 执行 patch 函数
    for (const patch of patchList) {
        try {
            await patch.patcher(sqliteDb)
            await dbVersionFile.write(patch.version)
        }
        catch (err) {
            console.error('数据库升级失败！', err)
            console.error('升级失败的版本号：', patch.version)
            return
        }
    }

    console.log('数据库升级成功！')
}