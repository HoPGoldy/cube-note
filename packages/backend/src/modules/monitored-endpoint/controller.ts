import {
  SchemaEndPointCreate,
  SchemaEndPointUpdate,
  SchemaEndPointDetail,
  createEndPointDetailVo,
} from "./schema";
import { EndPointService } from "./service";
import { AppInstance } from "@/types";
import Type from "typebox";

interface ControllerOptions {
  server: AppInstance;
  endPointService: EndPointService;
}

export const registerController = async (options: ControllerOptions) => {
  const { server, endPointService } = options;

  server.post(
    "/endpoint/create",
    {
      schema: {
        description: "Create a new endpoint",
        body: SchemaEndPointCreate,
        response: {
          200: SchemaEndPointDetail,
        },
      },
    },
    async (req) => {
      const result = await endPointService.createEndPoint(req.body);
      const vo = createEndPointDetailVo(result);
      return vo;
    },
  );

  server.post(
    "/endpoint/get",
    {
      schema: {
        description: "Get endpoint by ID",
        body: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: SchemaEndPointDetail,
        },
      },
    },
    async (req) => {
      const { id } = req.body;
      const result = await endPointService.getEndPointById(id);
      if (!result) {
        throw new Error("Endpoint not found");
      }

      const vo = createEndPointDetailVo(result);
      return vo;
    },
  );

  server.post(
    "/endpoint/list",
    {
      schema: {
        description: "Get all endpoints, optionally filtered by hostId",
        body: Type.Object({
          hostId: Type.Optional(Type.String({ description: "Host ID" })),
        }),
        response: {
          200: Type.Array(SchemaEndPointDetail),
        },
      },
    },
    async (req) => {
      const { hostId } = req.body;
      const results = await endPointService.getAllEndPoints(hostId);
      return results.map(createEndPointDetailVo);
    },
  );

  server.post(
    "/endpoint/update",
    {
      schema: {
        description: "Update an endpoint",
        body: SchemaEndPointUpdate,
        response: {
          200: SchemaEndPointDetail,
        },
      },
    },
    async (req) => {
      const result = await endPointService.updateEndPoint(req.body);
      return createEndPointDetailVo(result);
    },
  );

  server.post(
    "/endpoint/delete",
    {
      schema: {
        description: "Delete an endpoint",
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
      await endPointService.deleteEndPoint(id);
      return { success: true };
    },
  );

  server.post(
    "/endpoint/copy",
    {
      schema: {
        description: "Copy an endpoint",
        body: Type.Object({
          id: Type.String({ description: "要复制的端点ID" }),
        }),
        response: {
          200: SchemaEndPointDetail,
        },
      },
    },
    async (req) => {
      const { id } = req.body;
      const result = await endPointService.copyEndPoint(id);
      return createEndPointDetailVo(result);
    },
  );
};
