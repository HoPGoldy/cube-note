import { requestGet, requestPost } from './base'
import { LoginReqData, LoginResp } from '@/types/user'
import { useQuery, useMutation } from 'react-query'

/** 查询用户信息 */
export const useQueryUserInfo = (enabled: boolean) => {
    return useQuery('userInfo', () => {
        return requestGet<LoginResp>('user/getInfo')
    }, { enabled })
}

/** 登录 */
export const useLogin = () => {
    return useMutation((data: LoginReqData) => {
        return requestPost<LoginResp>('user/login', data)
    })
}

/** 创建管理员账号 */
export const useCreateAdmin = () => {
    return useMutation((data: LoginReqData) => {
        return requestPost('user/createAdmin', data)
    })
}
