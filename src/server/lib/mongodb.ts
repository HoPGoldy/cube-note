import { UserStorage } from '@/types/user'
import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017')

/**
 * 创建集合访问器
 * @param collectionName 集合名
 * @returns 一个函数，调用后返回对应的集合
 */
export const createCollectionAccessor = <T extends Record<string | number, any>>(collectionName: string) => {
    return () => {
        const database = client.db('cube-note')
        return database.collection<T>(collectionName)
    }
}

/**
 * 获取用户表
 */
export const getUserCollection = createCollectionAccessor<UserStorage>('users')

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
export const getReplayAttackNonceCollection = createCollectionAccessor<{ value: string }>('replayAttackNonce')

// nonce 只用保存一分钟的时间
getReplayAttackNonceCollection().createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 })