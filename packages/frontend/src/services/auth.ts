import { useMutation } from "@tanstack/react-query";
import { requestPost } from "./base";

export interface LoginReqData {
  password: string;
}

export type LoginResp = {
  /** 用户鉴权令牌 */
  token: string;
};

/** 登录 */
export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginReqData) => {
      return requestPost<LoginResp>("auth/login", data);
    },
  });
};

/** 刷新令牌 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => {
      return requestPost<LoginResp>("auth/renew");
    },
  });
};
