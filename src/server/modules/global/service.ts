import { DatabaseAccessor } from '@/server/lib/sqlite'
import { AppConfig, AppConfigResp, UserDataInfoResp } from '@/types/appConfig'

interface Props {
    getConfig: () => AppConfig
    db: DatabaseAccessor
}

export const createService = (props: Props) => {
    const { getConfig } = props
    const { dbGet } = props.db

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

    const getUserDataInfo = async (userId: number) => {
        const { ['COUNT(*)']: articleCount } = await dbGet(`SELECT COUNT(*) FROM articles WHERE createUserId = ${userId}`)

        const data: UserDataInfoResp = { articleCount }
        return { code: 200, data }
    }

    return { getAppConfig, getUserDataInfo }
}

export type GlobalService = ReturnType<typeof createService>