import { Type } from "typebox";
import { TagService } from "./service";
import { AppInstance } from "@/types";

interface RegisterOptions {
  server: AppInstance;
  tagService: TagService;
}

export async function registerTagController(options: RegisterOptions) {
  const { server, tagService } = options;

  // 获取标签详情
  server.get<{ Params: { id: string } }>(
    "/tag/:id",
    { schema: { description: "获取标签详情" } },
    async (request) => {
      return await tagService.getTagById(request.params.id);
    },
  );

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
  server.post(
    "/tag/add",
    {
      schema: {
        description: "创建标签",
        body: Type.Object({
          title: Type.String({ minLength: 1 }),
          color: Type.Optional(Type.String()),
        }),
      },
    },
    async (request) => {
      const result = await tagService.createTag(
        request.body.title,
        request.body.color,
      );

      return result.id;
    },
  );

  // 更新标签
  server.post(
    "/tag/update",
    {
      schema: {
        description: "更新标签",
        body: Type.Object({
          id: Type.String(),
          title: Type.Optional(Type.String()),
          color: Type.Optional(Type.String()),
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
          id: Type.String(),
        }),
      },
    },
    async (request) => {
      await tagService.deleteTag(request.body.id.toString());
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
          tagIds: Type.Array(Type.String()),
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
          ids: Type.Array(Type.String()),
        }),
      },
    },
    async (request) => {
      // 实现批量操作
      return { success: true };
    },
  );
}
