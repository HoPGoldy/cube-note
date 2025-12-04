import { ENV_IS_DEV } from "@/config/env";
import { ErrorHttp } from "@/types/error";
import { PrismaClientKnownRequestError } from "@db/internal/prismaNamespace";
import type { FastifyInstance } from "fastify";
// import Value from "typebox/value";

const PrismaErrorFeedback: Record<string, { status: number; msg: string }> = {
  P2001: {
    status: 400,
    msg: "访问的资源不存在",
  },
  P2002: {
    status: 400,
    msg: "该资源已存在，请勿重复创建",
  },
  DEFAULT: {
    status: 500,
    msg: "数据库错误",
  },
};

interface ErrorResponse {
  success: false;
  code: number | string;
  message: string;
  _stack?: string;
}

export const createErrorResponse = (error: Error): ErrorResponse => {
  return {
    success: false,
    code: (error as any).code || (error as any).statusCode || 500,
    message: error.message,
    _stack: ENV_IS_DEV ? error.stack : undefined,
  };
};

/**
 * 将后端服务的响应处理为统一格式
 * 错误处理也在这里统一捕获
 */
export const registerUnifyResponse = (server: FastifyInstance) => {
  server.setErrorHandler((error, request, reply) => {
    console.error(error);

    if (error instanceof PrismaClientKnownRequestError) {
      const feedback =
        PrismaErrorFeedback[error.code] || PrismaErrorFeedback.DEFAULT;
      let httpStatus = feedback.status;
      if (httpStatus !== 400 && httpStatus !== 500) {
        httpStatus = 500;
      }

      const resp: ErrorResponse = {
        success: false,
        message: feedback.msg,
        code: error.code,
        _stack: ENV_IS_DEV ? error.stack : undefined,
      };

      reply.status(httpStatus).send(resp);
    } else if (error instanceof ErrorHttp) {
      reply.status(error.statusCode);
      reply.send(createErrorResponse(error));
    } else {
      reply.status(500);
      reply.send(createErrorResponse(error));
    }
  });

  // 不能用这个，response schema 没设置时这个会被跳过，没法统一处理
  // server.setSerializerCompiler(() => {
  //   return (data) => {
  //     console.log("data", data);
  //     // const safeData = Value.Clean(schema, data);
  //     // const errors = Value.Errors(schema, data);
  //     // console.log("safeData", safeData);
  //     return JSON.stringify({ success: true, code: 200, data });
  //   };
  // });

  server.setReplySerializer((data, statusCode) => {
    if (statusCode >= 200 && statusCode < 300) {
      return JSON.stringify({ success: true, code: 200, data });
    }

    // 如果不是成功状态码，返回原始数据，让错误处理器自己处理
    return JSON.stringify(data);
  });
};
