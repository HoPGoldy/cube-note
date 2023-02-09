import { ArticleStorage } from '@/types/article'
import { TagGroupStorage, TagStorage } from '@/types/tag'
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

    // 文章内容和标题使用全文索引
    getArticleCollection().createIndex({ content: 'text', title: 'text' })

    /**
     * 获取标签集合
     */
    const getTagCollection = () => database.collection<TagStorage>('tags')

    /**
     * 获取标签分组集合
     */
    const getTagGroupCollection = () => database.collection<TagGroupStorage>('tagGroups')

    /**
     * 获取数据库状态
     */
    const getDatabaseStats = async () => database.stats()

    return {
        getUserCollection, getUserStorage, updateUserStorage, getReplayAttackNonceCollection,
        getArticleCollection, getTagCollection, getDatabaseStats, getTagGroupCollection
    }
}

export type DatabaseAccessor = ReturnType<typeof createDb>