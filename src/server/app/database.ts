import { createDb } from '../lib/sqlite'
import { getStoragePath } from '../utils'

export const db = createDb({
    dbPath: getStoragePath('cube-note.db')
})