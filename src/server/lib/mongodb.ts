import { ArticleStorage } from '@/types/article'
import { TagStorage } from '@/types/tag'
import { UserStorage } from '@/types/user'
import { MongoClient } from 'mongodb'

interface Props {
    mongodbUrl: string
    dbName: string
}

export const createDb = (props: Props) => {
    const client = new MongoClient(props.mongodbUrl)
    const database = client.db(props.dbName)

    /**
     * 获取用户表
     */
    const getUserCollection = () => database.collection<UserStorage>('users')

    /**
     * 获取用户基本数据
     * @param username 用户名
     */
    const getUserStorage = async (username: string) => {
        const collection = getUserCollection()
        return collection.findOne({ username })
    }

    /**
     * 更新指定用户基本数据
     * 若不存在该用户则新增
     */
    const updateUserStorage = async (username: string, newStorage: Partial<UserStorage>) => {
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
    const getReplayAttackNonceCollection = () => database.collection<{ value: string }>('replayAttackNonce')

    // nonce 只用保存一分钟的时间
    getReplayAttackNonceCollection().createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 })

    /**
     * 获取文章集合
     */
    const getArticleCollection = () => database.collection<ArticleStorage>('articles')

    /**
     * 获取标签集合
     */
    const getTagCollection = () => database.collection<TagStorage>('tags')

    /**
     * 获取数据库状态
     */
    const getDatabaseStats = async () => database.stats()

    return {
        getUserCollection, getUserStorage, updateUserStorage, getReplayAttackNonceCollection,
        getArticleCollection, getTagCollection, getDatabaseStats
    }
}

export type DatabaseAccessor = ReturnType<typeof createDb>