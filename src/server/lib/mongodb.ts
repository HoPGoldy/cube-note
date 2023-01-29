import { ArticleStorage } from '@/types/article'
import { TagStorage } from '@/types/tag'
import { UserStorage } from '@/types/user'
import { getRunArg } from '@/utils/common'
import { MongoClient } from 'mongodb'
import { getAppConfig } from './appConfig'

const { MONGODB_URL } = getAppConfig()
const client = new MongoClient(MONGODB_URL || getRunArg('mongodb-url') || 'mongodb://localhost:27017')
const database = client.db('cube-note')

/**
 * 获取用户表
 */
export const getUserCollection = () => database.collection<UserStorage>('users')

/**
 * 获取用户基本数据
 * @param username 用户名
 */
export const getUserStorage = async (username: string) => {
    const collection = getUserCollection()
    return collection.findOne({ username })
}

/**
 * 更新指定用户基本数据
 * 若不存在该用户则新增
 */
export const updateUserStorage = async (username: string, newStorage: Partial<UserStorage>) => {
    const collection = getUserCollection()
    const oldStorage = await collection.findOne({ username })

    if (!oldStorage) {
        return collection.insertOne({
            ...newStorage as UserStorage,
            username
        })
    }

    const fullStorage = { ...oldStorage, ...newStorage }
    return collection.updateOne({ username }, { $set: fullStorage })
}

/**
 * 获取防重放攻击的 nonce 集合
 */
export const getReplayAttackNonceCollection = () => database.collection<{ value: string }>('replayAttackNonce')

// nonce 只用保存一分钟的时间
getReplayAttackNonceCollection().createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 })

/**
 * 获取文章集合
 */
export const getArticleCollection = () => database.collection<ArticleStorage>('articles')

/**
 * 获取标签集合
 */
export const getTagCollection = () => database.collection<TagStorage>('tags')

/**
 * 获取数据库状态
 */
export const getDatabaseStats = async () => database.stats()