import { DatabaseAccessor } from '@/server/lib/sqlite'
import { AppConfig, AppConfigResp, UserDataInfoResp } from '@/types/appConfig'

interface Props {
    getConfig: () => AppConfig
    db: DatabaseAccessor
}

export const createService = (props: Props) => {
    const { getConfig } = props
    const { queryUser, queryArticle } = props.db

    /**
     * 获取当前应用全局配置
     */
    const getAppConfig = async (): Promise<AppConfigResp> => {
        const { DEFAULT_COLOR, APP_NAME, LOGIN_SUBTITLE } = getConfig()
        const randIndex = Math.floor(Math.random() * (DEFAULT_COLOR.length))
        const buttonColor = DEFAULT_COLOR[randIndex]

        const { ['count(*)']: userCount } = await queryUser().count().first() || {}
        const needInit = userCount <= 0

        const data: AppConfigResp = { buttonColor, appName: APP_NAME, loginSubtitle: LOGIN_SUBTITLE }
        if (needInit) data.needInit = true
        return data
    }

    const getUserDataInfo = async (userId: number) => {
        const { ['count(*)']: count } = await queryArticle()
            .where({ createUserId: userId })
            .count()
            .first() || {}

        const data: UserDataInfoResp = { articleCount: +count }
        return { code: 200, data }
    }

    return { getAppConfig, getUserDataInfo }
}

export type GlobalService = ReturnType<typeof createService>