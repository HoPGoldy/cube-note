import { AppConfig } from '@/types/appConfig'
import { AppStorage, AppTheme, UserStorage } from '@/types/user'
import { DEFAULT_PASSWORD_ALPHABET, DEFAULT_PASSWORD_LENGTH } from '@/constants'

interface Props {
    mainColor: string[]
    saveStorage: () => Promise<void>
    updateAppStorage: (data: Partial<AppStorage>) => Promise<void>
    getUserCollection: () => Collection<UserStorage>
}

export const createService = (props: Props) => {
    const { mainColor, updateAppStorage, saveStorage, getUserCollection } = props

    /**
     * 获取当前应用全局配置
     */
    const getAppConfig = (): AppConfig => {
        const randIndex = Math.floor(Math.random() * (mainColor.length))
        const buttonColor = mainColor[randIndex]

        const userCollection = getUserCollection()
        const isInit = userCollection.data.length > 0

        return { buttonColor, isInit }
    }

    /**
     * 设置应用主题色
     */
    const setTheme = async (theme: AppTheme) => {
        await updateAppStorage({ theme })
        saveStorage()
    }

    /**
     * 设置新密码的生成参数
     * 置空以设置为默认
     *
     * @param alphabet 密码生成的字符集
     * @param length 密码生成的长度
     */
    const setCreatePwdSetting = async (alphabet: string, length: number) => {
        await updateAppStorage({
            createPwdAlphabet: alphabet || DEFAULT_PASSWORD_ALPHABET,
            createPwdLength: length || DEFAULT_PASSWORD_LENGTH
        })
        saveStorage()
    }

    return { getAppConfig, setTheme, setCreatePwdSetting }
}

export type GlobalService = ReturnType<typeof createService>