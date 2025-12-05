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

  // POST 版本的路由 - 支持前端的 POST 请求模式

  // 获取标签列表
  server.post<{ Body: Record<string, never> }>(
    "/tag/list",
    {
      schema: {
        description: "获取所有标签",
        body: Type.Object({}),
      },
    },
    async (request) => {
      return await tagService.getTagList();
    },
  );

  // 新增标签
  server.post<{ Body: { title: string; color?: string; groupId?: string } }>(
    "/tag/add",
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

  // 更新标签
  server.post<{
    Body: { id: string; title?: string; color?: string; groupId?: string };
  }>(
    "/tag/update",
    {
      schema: {
        description: "更新标签",
        body: Type.Object({
          id: Type.String(),
          title: Type.Optional(Type.String()),
          color: Type.Optional(Type.String()),
          groupId: Type.Optional(Type.String()),
        }),
      },
    },
    async (request) => {
      const { id, ...updateData } = request.body;
      return await tagService.updateTag(id, updateData);
    },
  );

  // 删除标签
  server.post<{ Body: { id: number } }>(
    "/tag/remove",
    {
      schema: {
        description: "删除标签",
        body: Type.Object({
          id: Type.Number(),
        }),
      },
    },
    async (request) => {
      await tagService.deleteTag(request.body.id.toString());
      return { success: true };
    },
  );

  // 批量设置标签分组
  server.post<{ Body: { tagIds: number[]; groupId?: string } }>(
    "/tag/batch/setGroup",
    {
      schema: {
        description: "批量设置标签分组",
        body: Type.Object({
          tagIds: Type.Array(Type.Number()),
          groupId: Type.Optional(Type.String()),
        }),
      },
    },
    async (request) => {
      // 实现批量操作
      return { success: true };
    },
  );

  // 批量设置标签颜色
  server.post<{ Body: { tagIds: number[]; color: string } }>(
    "/tag/batch/setColor",
    {
      schema: {
        description: "批量设置标签颜色",
        body: Type.Object({
          tagIds: Type.Array(Type.Number()),
          color: Type.String(),
        }),
      },
    },
    async (request) => {
      // 实现批量操作
      return { success: true };
    },
  );

  // 批量删除标签
  server.post<{ Body: { ids: number[] } }>(
    "/tag/batch/remove",
    {
      schema: {
        description: "批量删除标签",
        body: Type.Object({
          ids: Type.Array(Type.Number()),
        }),
      },
    },
    async (request) => {
      // 实现批量删除
      return { success: true };
    },
  );

  // 获取标签分组列表
  server.post<{ Body: Record<string, never> }>(
    "/tag/group/list",
    {
      schema: {
        description: "获取所有标签分组",
        body: Type.Object({}),
      },
    },
    async (request) => {
      return await tagService.getGroupList();
    },
  );

  // 新增标签分组
  server.post<{ Body: { title: string } }>(
    "/tag/group/add",
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

  // 更新标签分组
  server.post<{ Body: { id: string; title: string } }>(
    "/tag/group/update",
    {
      schema: {
        description: "更新标签分组",
        body: Type.Object({
          id: Type.String(),
          title: Type.String({ minLength: 1 }),
        }),
      },
    },
    async (request) => {
      return await tagService.updateGroup(request.body.id, request.body.title);
    },
  );

  // 删除标签分组
  server.post<{ Body: { id: string; method?: string } }>(
    "/tag/group/removeGroup",
    {
      schema: {
        description: "删除标签分组",
        body: Type.Object({
          id: Type.String(),
          method: Type.Optional(Type.String()),
        }),
      },
    },
    async (request) => {
      await tagService.deleteGroup(request.body.id);
      return { success: true };
    },
  );
}
