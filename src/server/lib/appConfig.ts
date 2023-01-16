import fs from 'fs'
import path from 'path'
import json5 from 'json5'
import { AppConfig } from '@/types/appConfig'

let cache: AppConfig | undefined = undefined

export const getFile = (filePath: string) => {
    try {
        return fs.readFileSync(filePath).toString()
    }
    catch (e) {
        return ''
    }
}

export const getAppConfig = () => {
    if (cache) return cache

    const defaultConfigPath = path.join(__dirname, '../../../config.example.json')
    const configPath = path.join(__dirname, '../../../config.json')

    const defaultConfigResult = getFile(defaultConfigPath)
    const configResult = getFile(configPath)

    if (!defaultConfigResult && !configResult) {
        throw new Error('读取配置文件失败，请确保根目录下存在 config.json 或 config.example.json')
    }

    const defaultConfig = defaultConfigResult ? json5.parse<AppConfig>(defaultConfigResult) : {}
    const config = configResult ? json5.parse<AppConfig>(configResult) : {}
    const result = { ...defaultConfig, ...config } as AppConfig

    cache = result
    return result
}