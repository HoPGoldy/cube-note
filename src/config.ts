/**
 * 接口返回的状态码
 */
export const STATUS_CODE = {
    SUCCESS: 200,
    NOT_REGISTER: 40101,
    ALREADY_REGISTER: 40102,
    /**
     * 因为关联了其他资源所以无法删除
     */
    CANT_DELETE: 40601,
    /**
     * 未提供防重放攻击 header
     */
    REPLAY_ATTACK: 40602,
}

/**
 * 统一的日期格式化
 */
export const DATE_FORMATTER = 'YYYY-MM-DD HH:mm:ss'

/**
 * 无需登录即可访问的接口
 */
export const AUTH_EXCLUDE = [
    '/api/global', '/api/user/login', '/api/user/register', '/api/user/createAdmin', '/api/file/content'
]

/**
 * 不进行防重放攻击检查的接口
 */
export const REPLAY_ATTACK_EXCLUDE = [
    '/api/user/getInfo', ...AUTH_EXCLUDE
]
