import { ArticleStorage } from '@/types/article'
import { FileStorage } from '@/types/file'
import { TagGroupStorage, TagStorage } from '@/types/tag'
import { UserStorage } from '@/types/user'
import { MongoClient } from 'mongodb'
import sqlite3 from 'sqlite3'

interface Props {
    dbUrl: string
}

const { Database } = sqlite3.verbose()

export const createDb = (props: Props) => {
    const db = new Database(props.dbUrl)
}

export type DatabaseAccessor = ReturnType<typeof createDb>