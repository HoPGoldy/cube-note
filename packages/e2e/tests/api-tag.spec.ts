import { test, expect, authHeader, BASE } from "../fixtures/api";
import { test as rawTest } from "@playwright/test";

test.describe("Tag API - 增删改查", () => {
  let createdTagId: string;

  test("POST /api/tag/add 创建标签", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/tag/add`, {
      data: { title: "e2e-api-test-tag", color: "#ff5500" },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(typeof body.data).toBe("string");

    createdTagId = body.data;
  });

  test("POST /api/tag/list 列表包含已创建的标签", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/tag/list`, {
      data: {},
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);

    const found = body.data.find((t: { id: string }) => t.id === createdTagId);
    expect(found).toBeDefined();
    expect(found.title).toBe("e2e-api-test-tag");
    expect(found.color).toBe("#ff5500");
  });

  test("GET /api/tag/:id 获取标签详情", async ({ request, jwt }) => {
    const resp = await request.get(`${BASE}/tag/${createdTagId}`, {
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdTagId);
    expect(body.data.title).toBe("e2e-api-test-tag");
  });

  test("POST /api/tag/update 更新标签", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/tag/update`, {
      data: { id: createdTagId, title: "e2e-updated-tag", color: "#00cc66" },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    // 验证更新
    const detailResp = await request.get(`${BASE}/tag/${createdTagId}`, {
      headers: authHeader(jwt),
    });
    const detailBody = await detailResp.json();
    expect(detailBody.data.title).toBe("e2e-updated-tag");
    expect(detailBody.data.color).toBe("#00cc66");
  });

  test("POST /api/tag/remove 删除标签", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/tag/remove`, {
      data: { id: createdTagId },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    // 验证删除后列表中不存在
    const listResp = await request.post(`${BASE}/tag/list`, {
      data: {},
      headers: authHeader(jwt),
    });
    const listBody = await listResp.json();
    const found = listBody.data.find(
      (t: { id: string }) => t.id === createdTagId,
    );
    expect(found).toBeUndefined();
  });
});

test.describe("Tag API - 批量操作", () => {
  const tagIds: string[] = [];

  test("批量创建标签", async ({ request, jwt }) => {
    for (const name of ["batch-tag-1", "batch-tag-2", "batch-tag-3"]) {
      const resp = await request.post(`${BASE}/tag/add`, {
        data: { title: name },
        headers: authHeader(jwt),
      });
      const body = await resp.json();
      tagIds.push(body.data);
    }
    expect(tagIds.length).toBe(3);
  });

  test("POST /api/tag/batch/setColor 批量设置颜色", async ({
    request,
    jwt,
  }) => {
    const resp = await request.post(`${BASE}/tag/batch/setColor`, {
      data: { tagIds, color: "#0066ff" },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    // 验证颜色已更新
    const listResp = await request.post(`${BASE}/tag/list`, {
      data: {},
      headers: authHeader(jwt),
    });
    const listBody = await listResp.json();
    for (const id of tagIds) {
      const tag = listBody.data.find((t: { id: string }) => t.id === id);
      expect(tag?.color).toBe("#0066ff");
    }
  });

  test("POST /api/tag/batch/remove 批量删除标签", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/tag/batch/remove`, {
      data: { ids: tagIds },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    // 验证删除
    const listResp = await request.post(`${BASE}/tag/list`, {
      data: {},
      headers: authHeader(jwt),
    });
    const listBody = await listResp.json();
    for (const id of tagIds) {
      const found = listBody.data.find((t: { id: string }) => t.id === id);
      expect(found).toBeUndefined();
    }
  });
});

rawTest.describe("Tag API - 未认证拦截", () => {
  rawTest("未登录获取标签列表返回 401", async ({ request }) => {
    const resp = await request.post(`${BASE}/tag/list`, { data: {} });
    expect(resp.status()).toBe(401);
  });

  rawTest("未登录创建标签返回 401", async ({ request }) => {
    const resp = await request.post(`${BASE}/tag/add`, {
      data: { title: "should-fail" },
    });
    expect(resp.status()).toBe(401);
  });
});
