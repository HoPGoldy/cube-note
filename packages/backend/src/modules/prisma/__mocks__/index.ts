import { PrismaClient } from "@db/client";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";

/**
 * 用于单元测试的 Prisma Mock
 * 使用 vitest-mock-extended 创建深度 mock
 * 不需要真实数据库，通过 mock 返回值来控制测试行为
 */
export const prismaMock = mockDeep<PrismaClient>();

/**
 * 重置所有 mock 状态
 * 在 beforeEach 中调用以确保测试隔离
 */
export const resetPrismaMock = () => {
  mockReset(prismaMock);
};

export type MockPrismaClient = DeepMockProxy<PrismaClient>;
