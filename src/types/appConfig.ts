/**
 * 后端发给前端的应用配置
 */
export interface AppConfigResp {
    /**
     * 主按钮颜色
     */
    buttonColor: string
    /**
     * 应用名
     */
    appName: string
    /**
     * 登录页副标题
     */
    loginSubtitle: string
    /**
     * 是否已完成初始化
     */
    needInit?: boolean
}

export interface AppConfig {
    DEFAULT_COLOR: string[]
    APP_NAME: string
    LOGIN_SUBTITLE: string
}

export interface UserDataInfoResp {
    articleCount: number
}
