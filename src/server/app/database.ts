import { getRunArg } from '@/utils/common'
import { getAppConfig } from '../lib/appConfig'
import { createDb } from '../lib/mongodb'
import { createDb as createSqlDb } from '../lib/sqlite'
import { getStoragePath } from '../utils'

const { MONGODB_URL } = getAppConfig()

export const db = createDb({
    mongodbUrl: MONGODB_URL || getRunArg('mongodb-url') || 'mongodb://localhost:27017',
    dbName: 'cube-note',
})

export const sqlDb = createSqlDb({
    dbPath: getStoragePath('cube-note.db')
})