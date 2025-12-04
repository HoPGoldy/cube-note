import type { FastifyInstance } from "fastify";
import { Type } from "typebox";
import { TagService } from "./service";

interface RegisterOptions {
  server: FastifyInstance;
  tagService: TagService;
}

export async function registerTagController(options: RegisterOptions) {
  const { server, tagService } = options;

  // 创建标签
  server.post<{ Body: { title: string; color?: string; groupId?: string } }>(
    "/tag/create",
    {
      schema: {
        description: "创建标签",
        body: Type.Object({
          title: Type.String({ minLength: 1 }),
          color: Type.Optional(Type.String()),
          groupId: Type.Optional(Type.String()),
        }),
      },
    },
    async (request) => {
      return await tagService.createTag(
        request.body.title,
        request.body.color,
        request.body.groupId,
      );
    },
  );

  // 获取标签详情
  server.get<{ Params: { id: string } }>(
    "/tag/:id",
    { schema: { description: "获取标签详情" } },
    async (request) => {
      return await tagService.getTagById(request.params.id);
    },
  );

  // 更新标签
  server.put<{
    Params: { id: string };
    Body: { title?: string; color?: string; groupId?: string };
  }>(
    "/tag/:id",
    {
      schema: {
        description: "更新标签",
        body: Type.Object({
          title: Type.Optional(Type.String()),
          color: Type.Optional(Type.String()),
          groupId: Type.Optional(Type.String()),
        }),
      },
    },
    async (request) => {
      return await tagService.updateTag(request.params.id, request.body);
    },
  );

  // 删除标签
  server.delete<{ Params: { id: string } }>(
    "/tag/:id",
    { schema: { description: "删除标签" } },
    async (request) => {
      await tagService.deleteTag(request.params.id);
      return { success: true };
    },
  );

  // 获取所有标签
  server.get(
    "/tag/list",
    { schema: { description: "获取所有标签" } },
    async (request) => {
      return await tagService.getTagList();
    },
  );

  // 创建标签分组
  server.post<{ Body: { title: string } }>(
    "/tag-group/create",
    {
      schema: {
        description: "创建标签分组",
        body: Type.Object({
          title: Type.String({ minLength: 1 }),
        }),
      },
    },
    async (request) => {
      return await tagService.createGroup(request.body.title);
    },
  );

  // 获取标签分组详情
  server.get<{ Params: { id: string } }>(
    "/tag-group/:id",
    { schema: { description: "获取标签分组详情" } },
    async (request) => {
      return await tagService.getGroupById(request.params.id);
    },
  );

  // 更新标签分组
  server.put<{ Params: { id: string }; Body: { title: string } }>(
    "/tag-group/:id",
    {
      schema: {
        description: "更新标签分组",
        body: Type.Object({
          title: Type.String({ minLength: 1 }),
        }),
      },
    },
    async (request) => {
      return await tagService.updateGroup(
        request.params.id,
        request.body.title,
      );
    },
  );

  // 删除标签分组
  server.delete<{ Params: { id: string } }>(
    "/tag-group/:id",
    { schema: { description: "删除标签分组" } },
    async (request) => {
      await tagService.deleteGroup(request.params.id);
      return { success: true };
    },
  );

  // 获取所有标签分组
  server.get(
    "/tag-group/list",
    { schema: { description: "获取所有标签分组" } },
    async (request) => {
      return await tagService.getGroupList();
    },
  );
}
