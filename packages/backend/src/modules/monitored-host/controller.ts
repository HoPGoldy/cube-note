import {
  SchemaServiceCreate,
  SchemaServiceUpdate,
  SchemaServiceDetail,
  createServiceDetailVo,
} from "./schema";
import { MonitoredHostService } from "./service";
import { AppInstance } from "@/types";
import Type from "typebox";

interface ControllerOptions {
  server: AppInstance;
  monitoredHostService: MonitoredHostService;
}

export const registerController = async (options: ControllerOptions) => {
  const { server, monitoredHostService } = options;

  server.post(
    "/monitored-host/create",
    {
      schema: {
        description: "Create a new service",
        body: SchemaServiceCreate,
        response: {
          200: SchemaServiceDetail,
        },
      },
    },
    async (req) => {
      const result = await monitoredHostService.createService(req.body);
      const vo = createServiceDetailVo(result);
      return vo;
    },
  );

  server.post(
    "/monitored-host/get",
    {
      schema: {
        description: "Get service by ID",
        body: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: SchemaServiceDetail,
        },
      },
    },
    async (req) => {
      const { id } = req.body;
      const result = await monitoredHostService.getServiceById(id);
      if (!result) {
        throw new Error("Service not found");
      }

      const vo = createServiceDetailVo(result);
      return vo;
    },
  );

  server.post(
    "/monitored-host/list",
    {
      schema: {
        description: "Get all services",
        response: {
          200: Type.Array(SchemaServiceDetail),
        },
      },
    },
    async (req, reply) => {
      const results = await monitoredHostService.getAllServices();
      return results.map(createServiceDetailVo);
    },
  );

  server.post(
    "/monitored-host/update",
    {
      schema: {
        description: "Update a service",
        body: SchemaServiceUpdate,
        response: {
          200: SchemaServiceDetail,
        },
      },
    },
    async (req) => {
      const result = await monitoredHostService.updateService(req.body);
      return createServiceDetailVo(result);
    },
  );

  server.post(
    "/monitored-host/delete",
    {
      schema: {
        description: "Delete a service",
        body: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: Type.Object({ success: Type.Boolean() }),
        },
      },
    },
    async (req) => {
      const { id } = req.body;
      await monitoredHostService.deleteService(id);
      return { success: true };
    },
  );

  server.post(
    "/monitored-host/copy",
    {
      schema: {
        description: "Copy a service with all its endpoints",
        body: Type.Object({
          id: Type.String({ description: "要复制的服务ID" }),
        }),
        response: {
          200: SchemaServiceDetail,
        },
      },
    },
    async (req) => {
      const { id } = req.body;
      const result = await monitoredHostService.copyService(id);
      if (!result) {
        throw new Error("Copy failed");
      }
      return createServiceDetailVo(result);
    },
  );
};
