import lokijs from 'lokijs'
import { ensureDir } from 'fs-extra'
import { AppStorage, AppTheme, CertificateDetail, CertificateGroup, UserStorage } from '@/types/user'
import { STORAGE_PATH } from '@/config'

/**
 * 全局的 loki 实例缓存
 */
const lokiInstances: Record<string, lokijs> = {}

/**
 * 获取全局 loki 存储实例
 */
export const getLoki = async (name = 'storage'): Promise<lokijs> => {
    if (lokiInstances[name]) return lokiInstances[name]

    await ensureDir(STORAGE_PATH)

    return new Promise(resolve => {
        lokiInstances[name] = new lokijs(`${STORAGE_PATH}/${name}.json`, {
            autoload: true,
            autosave: true,
            autosaveInterval: 1000 * 60 * 60 * 24,
            autoloadCallback: () => resolve(lokiInstances[name])
        })
    })
}

/**
 * 保存数据到本地
 */
export const saveLoki = async (name = 'storage'): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!lokiInstances) return resolve()

        lokiInstances[name].saveDatabase(err => {
            if (err) reject(err)
            resolve()
        })
    })
}

interface CreateAccessorArgs<T> {
    lokiName?: string,
    collectionName: string,
    initOption?: Partial<CollectionOptions<T>>,
    initData?: T[]
}

/**
 * 创建集合访问器
 * @param collectionName 集合名
 * @returns 一个 async 函数，调用后返回对应的集合
 */
export const createCollectionAccessor = <T extends Record<string | number, any>>(arg: CreateAccessorArgs<T>) => {
    const { lokiName: defaultLokiName, collectionName, initData, initOption } = arg

    return async (lokiName?: string) => {
        const loki = await getLoki(lokiName || defaultLokiName)
        const collection = loki.getCollection<T>(collectionName)
        if (collection) return collection

        const newCollection = loki.addCollection<T>(collectionName, initOption)
        if (initData) newCollection.insert(initData)
        return newCollection
    }
}

/**
 * 获取用户表
 */
export const getUserCollection = createCollectionAccessor<UserStorage>({
    lokiName: 'system',
    collectionName: 'users'
})

/**
 * 获取用户基本数据
 * @param username 用户名
 */
export const getUserStorage = async (username: string) => {
    const collection = await getUserCollection()
    return collection.findOne({ username })
}

/**
 * 更新指定用户基本数据
 * 若不存在该用户则新增
 */
export const updateUserStorage = async (username: string, newStorage: Partial<UserStorage>) => {
    const collection = await getUserCollection()
    const oldStorage = collection.findOne({ username })

    if (!oldStorage) {
        return collection.insert({
            ...newStorage as UserStorage,
            username
        })
    }

    const fullStorage = { ...oldStorage, ...newStorage }
    return collection.update(fullStorage)
}

/**
 * 获取防重放攻击的 nonce 集合
 */
export const getReplayAttackNonceCollection = createCollectionAccessor<{ value: string }>({
    lokiName: 'system',
    collectionName: 'replayAttackNonce',
    initOption: {
        indices: ['value'],
        // 只保存一分钟的数据
        ttl: 1000 * 60,
        ttlInterval: 1000 * 60
    }
})

/**
 * 获取分组集合
 */
export const getGroupCollection = createCollectionAccessor<CertificateGroup>({
    collectionName: 'group',
    initData: [{ name: '我的密码', order: 0 }]
})

/**
 * 获取凭证集合
 */
export const getCertificateCollection = createCollectionAccessor<CertificateDetail>({
    collectionName: 'certificate'
})
