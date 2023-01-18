
export interface UserStorage {
    /**
     *用户名
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
    /**
     * 用户当前根节点文章的 id
     */
    rootArticleId: string
}

/**
 * 应用主题色
 */
export enum AppTheme {
    Dark = 'dark',
    Light = 'light'
}

export interface LoginPostData {
    username: string
    password: string
}

/**
 * 登录接口返回值
 */
export type LoginResp = Partial<LoginSuccessResp> & Partial<LoginFailResp>

export type LoginSuccessResp = {
    /**
     * 用户鉴权令牌
     */
    token: string
    /**
     * 防重放攻击的签名密钥
     */
    replayAttackSecret: string
} & FrontendUserInfo

export interface LoginFailResp {
    /**
     * 登录错误的日期数组
     */
    loginFailure: number[]
    /**
     * 登录是否被锁定
     */
    ipBaned: boolean

}

export interface ChangePasswordPostData {
    newP: string
    oldP: string
}

export interface SetThemePostData {
    theme: AppTheme
}

export interface FrontendUserInfo {
    /**
     *用户名
     */
    username: string
    /**
     * 主题色
     */
    theme: AppTheme
    /**
     * 初始化时间
     */
    initTime: number
    /**
     * 笔记根节点 id
     */
    rootArticleId: string
    /**
     * 是否为管理员
     */
    isAdmin?: boolean
}