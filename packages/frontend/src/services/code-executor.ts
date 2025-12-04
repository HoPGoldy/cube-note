import { requestPost } from "./base";

export interface CodeExecuteRequest {
  code: string;
  timeout?: number;
  context?: Record<string, any>;
  hostId?: string;
}

export interface CodeExecuteResponse {
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
  logs: string[];
}

/**
 * 执行代码
 */
export const executeCode = async (data: CodeExecuteRequest) => {
  return await requestPost<CodeExecuteResponse>("code-executor/execute", data);
};

/**
 * 验证代码语法
 */
export const validateCode = async (code: string) => {
  return await requestPost<{ valid: boolean; error?: string }>(
    "code-executor/validate",
    { code },
  );
};
