import { AppConfig } from '@/types/appConfig'
import { UserStorage } from '@/types/user'
import { Collection } from 'mongodb'

interface Props {
    mainColor: string[]
    getUserCollection: () => Collection<UserStorage>
}

export const createService = (props: Props) => {
    const { mainColor, getUserCollection } = props

    /**
     * 获取当前应用全局配置
     */
    const getAppConfig = async (): Promise<AppConfig> => {
        const randIndex = Math.floor(Math.random() * (mainColor.length))
        const buttonColor = mainColor[randIndex]

        const userCollection = getUserCollection()
        const needInit = (await userCollection.countDocuments()) <= 0

        const data: AppConfig = { buttonColor }
        if (needInit) data.needInit = true
        return data
    }

    return { getAppConfig }
}

export type GlobalService = ReturnType<typeof createService>