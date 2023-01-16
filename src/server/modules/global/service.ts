import { AppConfig, AppConfigResp } from '@/types/appConfig'
import { UserStorage } from '@/types/user'
import { Collection } from 'mongodb'

interface Props {
    mainColor: string[]
    getConfig: () => AppConfig
    getUserCollection: () => Collection<UserStorage>
}

export const createService = (props: Props) => {
    const { getConfig, getUserCollection } = props

    /**
     * 获取当前应用全局配置
     */
    const getAppConfig = async (): Promise<AppConfigResp> => {
        const { DEFAULT_COLOR, APP_NAME, LOGIN_SUBTITLE } = getConfig()
        const randIndex = Math.floor(Math.random() * (DEFAULT_COLOR.length))
        const buttonColor = DEFAULT_COLOR[randIndex]

        const userCollection = getUserCollection()
        const needInit = (await userCollection.countDocuments()) <= 0

        const data: AppConfigResp = { buttonColor, appName: APP_NAME, loginSubtitle: LOGIN_SUBTITLE }
        if (needInit) data.needInit = true
        return data
    }

    return { getAppConfig }
}

export type GlobalService = ReturnType<typeof createService>