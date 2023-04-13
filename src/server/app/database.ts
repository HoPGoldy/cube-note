import { createDb } from '../lib/sqlite'
import { getStoragePath } from '@/server/lib/fileAccessor'

export const db = createDb({
    getDbPath: () => getStoragePath('cube-note.db')
})