import {
  SchemaProbeResultCreate,
  SchemaProbeResultDetail,
  createProbeResultDetailVo,
} from "./schema";
import { ResultService } from "./service";
import { AppInstance } from "@/types";
import Type from "typebox";

interface ControllerOptions {
  server: AppInstance;
  resultService: ResultService;
}

export const registerController = async (options: ControllerOptions) => {
  const { server, resultService } = options;

  server.post(
    "/probe-result/create",
    {
      schema: {
        description: "Create a new probe result",
        body: SchemaProbeResultCreate,
        response: {
          200: SchemaProbeResultDetail,
        },
      },
    },
    async (req) => {
      const result = await resultService.createProbeResult(req.body);
      const vo = createProbeResultDetailVo(result);
      return vo;
    },
  );

  server.post(
    "/probe-result/get",
    {
      schema: {
        description: "Get probe result by ID",
        body: Type.Object({
          id: Type.Integer(),
        }),
        response: {
          200: SchemaProbeResultDetail,
        },
      },
    },
    async (req) => {
      const { id } = req.body;
      const result = await resultService.getProbeResultById(id);
      if (!result) {
        throw new Error("Probe result not found");
      }

      const vo = createProbeResultDetailVo(result);
      return vo;
    },
  );

  server.post(
    "/probe-result/list",
    {
      schema: {
        description: "Get probe results with optional filters",
        body: Type.Optional(
          Type.Object({
            endPointId: Type.Optional(
              Type.String({ description: "筛选特定端点的结果" }),
            ),
            hostId: Type.Optional(
              Type.String({ description: "筛选特定 Host 的结果" }),
            ),
            limit: Type.Optional(
              Type.Integer({
                minimum: 1,
                maximum: 1000,
                description: "返回结果数量限制",
              }),
            ),
          }),
        ),
        response: {
          200: Type.Array(SchemaProbeResultDetail),
        },
      },
    },
    async (req) => {
      const { endPointId, hostId, limit } = req.body || {};
      const results = await resultService.getProbeResults({
        endPointId,
        hostId,
        limit,
      });
      return results.map(createProbeResultDetailVo);
    },
  );

  server.post(
    "/probe-result/latest",
    {
      schema: {
        description: "Get latest probe results for dashboard",
        response: {
          200: Type.Array(SchemaProbeResultDetail),
        },
      },
    },
    async (req) => {
      const results = await resultService.getLatestProbeResults();
      return results.map(createProbeResultDetailVo);
    },
  );

  server.post(
    "/probe-result/delete",
    {
      schema: {
        description: "Delete a probe result",
        body: Type.Object({
          id: Type.Integer(),
        }),
        response: {
          200: Type.Object({ success: Type.Boolean() }),
        },
      },
    },
    async (req) => {
      const { id } = req.body;
      await resultService.deleteProbeResult(id);
      return { success: true };
    },
  );
};
