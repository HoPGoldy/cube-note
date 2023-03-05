import { DatabaseAccessor } from '@/server/lib/sqlite'
import { AppConfig, AppConfigResp, UserDataInfoResp } from '@/types/appConfig'
import { ObjectId } from 'mongodb'

interface Props {
    getConfig: () => AppConfig
    db: DatabaseAccessor
}

export const createService = (props: Props) => {
    const { getConfig } = props
    const { dbGet, getUserStorage } = props.db

    /**
     * 获取当前应用全局配置
     */
    const getAppConfig = async (): Promise<AppConfigResp> => {
        const { DEFAULT_COLOR, APP_NAME, LOGIN_SUBTITLE } = getConfig()
        const randIndex = Math.floor(Math.random() * (DEFAULT_COLOR.length))
        const buttonColor = DEFAULT_COLOR[randIndex]

        const { ['COUNT(*)']: userCount } = await dbGet('SELECT COUNT(*) FROM users')
        const needInit = userCount <= 0

        const data: AppConfigResp = { buttonColor, appName: APP_NAME, loginSubtitle: LOGIN_SUBTITLE }
        if (needInit) data.needInit = true
        return data
    }

    const getUserDataInfo = async (username: string) => {
        const userStorage = await getUserStorage(username)
        if (!userStorage) return { code: 404, message: '用户不存在' }

        const rootArticleId = new ObjectId(userStorage.rootArticleId)

        const data: UserDataInfoResp = { articleCount: 100 }
        return { code: 200, data }
    }

    return { getAppConfig, getUserDataInfo }
}

export type GlobalService = ReturnType<typeof createService>