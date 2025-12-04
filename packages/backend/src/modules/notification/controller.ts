import { Type } from "typebox";
import { AppInstance } from "@/types";
import { NotificationService } from "./service";
import {
  SchemaChannelCreate,
  SchemaChannelUpdate,
  SchemaChannelDelete,
  SchemaChannelDetail,
  SchemaChannelTest,
  SchemaLogList,
  SchemaLogDetail,
  createChannelDetailVo,
  createLogDetailVo,
} from "./schema";
import {
  DINGTALK_TEMPLATE,
  FEISHU_TEMPLATE,
  WECOM_TEMPLATE,
  GENERIC_WEBHOOK_TEMPLATE,
} from "./template";

interface ControllerOptions {
  server: AppInstance;
  notificationService: NotificationService;
}

export const registerController = async (options: ControllerOptions) => {
  const { server, notificationService } = options;

  // ==================== Channel APIs ====================

  server.post(
    "/notification/channel/create",
    {
      schema: {
        description: "创建通知渠道",
        body: SchemaChannelCreate,
        response: {
          200: SchemaChannelDetail,
        },
      },
    },
    async (req) => {
      const result = await notificationService.createChannel(req.body);
      return createChannelDetailVo(result);
    },
  );

  server.post(
    "/notification/channel/update",
    {
      schema: {
        description: "更新通知渠道",
        body: SchemaChannelUpdate,
        response: {
          200: SchemaChannelDetail,
        },
      },
    },
    async (req) => {
      const result = await notificationService.updateChannel(req.body);
      return createChannelDetailVo(result);
    },
  );

  server.post(
    "/notification/channel/delete",
    {
      schema: {
        description: "删除通知渠道",
        body: SchemaChannelDelete,
        response: {
          200: Type.Object({
            success: Type.Boolean(),
          }),
        },
      },
    },
    async (req) => {
      await notificationService.deleteChannel(req.body.id);
      return { success: true };
    },
  );

  server.post(
    "/notification/channel/list",
    {
      schema: {
        description: "获取通知渠道列表",
        response: {
          200: Type.Array(SchemaChannelDetail),
        },
      },
    },
    async () => {
      const result = await notificationService.listChannels();
      return result.map(createChannelDetailVo);
    },
  );

  server.post(
    "/notification/channel/get",
    {
      schema: {
        description: "获取通知渠道详情",
        body: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: SchemaChannelDetail,
        },
      },
    },
    async (req) => {
      const result = await notificationService.getChannelById(req.body.id);
      if (!result) {
        throw new Error("Channel not found");
      }
      return createChannelDetailVo(result);
    },
  );

  server.post(
    "/notification/channel/test",
    {
      schema: {
        description: "发送测试通知",
        body: SchemaChannelTest,
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            error: Type.Optional(Type.String()),
          }),
        },
      },
    },
    async (req) => {
      const result = await notificationService.testChannel(req.body.id);
      return result;
    },
  );

  server.post(
    "/notification/channel/templates",
    {
      schema: {
        description: "获取预置模板列表",
        response: {
          200: Type.Array(
            Type.Object({
              name: Type.String(),
              description: Type.String(),
              template: Type.String(),
            }),
          ),
        },
      },
    },
    async () => {
      return [
        {
          name: "钉钉",
          description: "钉钉机器人 Markdown 消息格式",
          template: DINGTALK_TEMPLATE,
        },
        {
          name: "飞书",
          description: "飞书机器人文本消息格式",
          template: FEISHU_TEMPLATE,
        },
        {
          name: "企业微信",
          description: "企业微信机器人 Markdown 消息格式",
          template: WECOM_TEMPLATE,
        },
        {
          name: "通用 Webhook",
          description: "通用 JSON 格式，适用于自定义接收端",
          template: GENERIC_WEBHOOK_TEMPLATE,
        },
      ];
    },
  );

  // ==================== Log APIs ====================

  server.post(
    "/notification/log/list",
    {
      schema: {
        description: "获取通知记录列表",
        body: SchemaLogList,
        response: {
          200: Type.Array(SchemaLogDetail),
        },
      },
    },
    async (req) => {
      const result = await notificationService.listLogs(req.body);
      return result.map(createLogDetailVo);
    },
  );

  // ==================== Status APIs ====================

  server.post(
    "/notification/status/list",
    {
      schema: {
        description: "获取所有 Host 的通知状态",
        response: {
          200: Type.Array(
            Type.Object({
              hostId: Type.String(),
              hostName: Type.String(),
              hostEnabled: Type.Boolean(),
              currentStatus: Type.Union([
                Type.Literal("UP"),
                Type.Literal("DOWN"),
              ]),
              lastNotifiedAt: Type.Union([
                Type.String({ format: "date-time" }),
                Type.Null(),
              ]),
              failedEndpoints: Type.Array(
                Type.Object({
                  endpointId: Type.String(),
                  endpointName: Type.String(),
                  consecutiveFailures: Type.Integer(),
                }),
              ),
            }),
          ),
        },
      },
    },
    async () => {
      const result = await notificationService.getAllHostStatus();
      return result.map((item) => ({
        ...item,
        lastNotifiedAt: item.lastNotifiedAt?.toISOString() || null,
      }));
    },
  );
};
