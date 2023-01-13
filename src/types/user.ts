
export interface UserStorage {
    /**
     *用户米
     */
    username: string
    /**
     * 密码 sha512 摘要
     */
    passwordHash: string
    /**
     * 密码的盐值
     */
    passwordSalt: string
    /**
     * 主题色
     */
    theme: AppTheme
    /**
     * 初始化时间
     */
    initTime: number
    /**
     * 是否为管理员
     */
    isAdmin?: boolean
}

/**
 * 应用主题色
 */
export enum AppTheme {
    Dark = 'dark',
    Light = 'light'
}

/**
 * 登录接口返回值
 */
export type LoginResp = {
    /**
     * 用户鉴权令牌
     */
    token: string
    /**
     * 应用主题
     */
    theme: AppTheme
    /**
     * 防重放攻击的签名密钥
     */
    replayAttackSecret: string
}

/**
 * 登录失败响应
 */
export interface LoginErrorResp {
    /**
     * 登录错误的日期数组
     */
    loginFailure: string[]
    /**
     * 应用是否被锁定
     */
    appLock: boolean
    /**
     * 应用是被被无限期锁定
     */
    appFullLock: boolean
}