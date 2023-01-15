import fs from 'fs/promises'
import path from 'path'
import json5 from 'json5'
import { AppConfig } from '@/types/appConfig'

let cache: AppConfig | undefined = undefined

export const getAppConfig = async () => {
    if (cache) return cache

    const defaultConfigPath = path.join(__dirname, '../../../config.example.json')
    const configPath = path.join(__dirname, '../../../config.json')
    
    const [defaultConfigResult, configResult] = await Promise.allSettled([
        fs.readFile(defaultConfigPath),
        fs.readFile(configPath),
    ])

    if (defaultConfigResult.status === 'rejected' && configResult.status === 'rejected') {
        throw new Error('读取配置文件失败，请确保根目录下存在 config.json 或 config.example.json')
    }

    const defaultConfig = defaultConfigResult.status === 'fulfilled' ? json5.parse<AppConfig>(defaultConfigResult.value.toString()) : {}
    const config = configResult.status === 'fulfilled' ? json5.parse<AppConfig>(configResult.value.toString()) : {}
    
    const result = { ...defaultConfig, ...config } as AppConfig
    console.log('result', result)
    cache = result
    return result
}