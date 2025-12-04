import { ErrorHttp } from "@/types/error";

export class CodeExecutorError extends ErrorHttp {
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
    this.code = 40001;
  }
}

export class CodeExecutionTimeoutError extends ErrorHttp {
  constructor(timeout: number) {
    super(`代码执行超时（${timeout}ms）`);
    this.statusCode = 408;
    this.code = 40800;
  }
}

export class CodeExecutionError extends ErrorHttp {
  constructor(message: string) {
    super(`代码执行错误: ${message}`);
    this.statusCode = 400;
    this.code = 40002;
  }
}
