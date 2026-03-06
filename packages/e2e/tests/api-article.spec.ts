import { test, expect, authHeader, BASE } from "../fixtures/api";
import { test as rawTest } from "@playwright/test";

test.describe("Article API - 增删改查", () => {
  let createdArticleId: string;

  test("POST /api/article/add 新增文章", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/article/add`, {
      data: {
        title: "E2E API 测试文章",
        content: "# 测试\n\n这是一篇纯 API 测试创建的文章。",
      },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("id");
    expect(typeof body.data.id).toBe("string");

    createdArticleId = body.data.id;
  });

  test("POST /api/article/getContent 获取文章内容", async ({
    request,
    jwt,
  }) => {
    const resp = await request.post(`${BASE}/article/getContent`, {
      data: { id: createdArticleId },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdArticleId);
    expect(body.data.title).toBe("E2E API 测试文章");
    expect(body.data.content).toContain("纯 API 测试");
  });

  test("POST /api/article/update 更新文章", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/article/update`, {
      data: {
        id: createdArticleId,
        title: "E2E 更新后的标题",
        content: "更新后的内容",
        color: "#ff5500",
      },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
  });

  test("POST /api/article/getContent 更新后内容正确", async ({
    request,
    jwt,
  }) => {
    const resp = await request.post(`${BASE}/article/getContent`, {
      data: { id: createdArticleId },
      headers: authHeader(jwt),
    });
    const body = await resp.json();
    expect(body.data.title).toBe("E2E 更新后的标题");
    expect(body.data.content).toBe("更新后的内容");
    expect(body.data.color).toBe("#ff5500");
  });

  test("POST /api/article/getTree 获取文章树", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/article/getTree`, {
      data: {},
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("POST /api/article/getLink 获取文章链接信息", async ({
    request,
    jwt,
  }) => {
    const resp = await request.post(`${BASE}/article/getLink`, {
      data: { id: createdArticleId },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("childrenArticles");
    expect(Array.isArray(body.data.childrenArticles)).toBe(true);
  });

  test("POST /api/article/add 创建子文章", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/article/add`, {
      data: {
        title: "E2E 子文章",
        content: "子文章内容",
        parentId: createdArticleId,
      },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("id");

    // 验证父文章链接中包含子文章
    const linkResp = await request.post(`${BASE}/article/getLink`, {
      data: { id: createdArticleId },
      headers: authHeader(jwt),
    });
    const linkBody = await linkResp.json();
    const children = linkBody.data.childrenArticles;
    expect(children.some((c: { id: string }) => c.id === body.data.id)).toBe(
      true,
    );
  });

  test("POST /api/article/remove 删除文章", async ({ request, jwt }) => {
    // 先创建一篇用于删除的文章
    const addResp = await request.post(`${BASE}/article/add`, {
      data: { title: "待删除文章" },
      headers: authHeader(jwt),
    });
    const articleId = (await addResp.json()).data.id;

    const resp = await request.post(`${BASE}/article/remove`, {
      data: { id: articleId },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
  });
});

test.describe("Article API - 收藏", () => {
  let articleId: string;

  test("POST /api/article/setFavorite 设置收藏", async ({ request, jwt }) => {
    // 先创建文章
    const addResp = await request.post(`${BASE}/article/add`, {
      data: { title: "收藏测试文章" },
      headers: authHeader(jwt),
    });
    articleId = (await addResp.json()).data.id;

    const resp = await request.post(`${BASE}/article/setFavorite`, {
      data: { id: articleId, favorite: true },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);
  });

  test("POST /api/article/getFavorite 获取收藏列表", async ({
    request,
    jwt,
  }) => {
    const resp = await request.post(`${BASE}/article/getFavorite`, {
      data: {},
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);

    const found = body.data.find((a: { id: string }) => a.id === articleId);
    expect(found).toBeDefined();
  });

  test("POST /api/article/setFavorite 取消收藏", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/article/setFavorite`, {
      data: { id: articleId, favorite: false },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    // 验证取消后不在收藏列表
    const favResp = await request.post(`${BASE}/article/getFavorite`, {
      data: {},
      headers: authHeader(jwt),
    });
    const favBody = await favResp.json();
    const found = favBody.data.find((a: { id: string }) => a.id === articleId);
    expect(found).toBeUndefined();
  });
});

test.describe("Article API - 搜索", () => {
  test("POST /api/article/search 按关键字搜索", async ({ request, jwt }) => {
    // 先写入一篇有特殊关键字的文章
    const keyword = `e2e_search_${Date.now()}`;
    await request.post(`${BASE}/article/add`, {
      data: { title: keyword, content: `搜索测试：${keyword}` },
      headers: authHeader(jwt),
    });

    const resp = await request.post(`${BASE}/article/search`, {
      data: { keyword },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("total");
    expect(body.data).toHaveProperty("items");
    expect(body.data.total).toBeGreaterThanOrEqual(1);
  });

  test("POST /api/article/search 空关键字返回全部（分页）", async ({
    request,
    jwt,
  }) => {
    const resp = await request.post(`${BASE}/article/search`, {
      data: { keyword: "" },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("total");
    expect(Array.isArray(body.data.items)).toBe(true);
  });

  test("POST /api/article/search 分页参数生效", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/article/search`, {
      data: { keyword: "", page: 1, pageSize: 2 },
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.data.items.length).toBeLessThanOrEqual(2);
  });
});

test.describe("Article API - 统计", () => {
  test("POST /api/article/statistic 返回统计数据", async ({ request, jwt }) => {
    const resp = await request.post(`${BASE}/article/statistic`, {
      data: {},
      headers: authHeader(jwt),
    });
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.articleCount).toBe("number");
    expect(typeof body.data.articleLength).toBe("number");
    expect(body.data.articleCount).toBeGreaterThanOrEqual(0);
  });
});

rawTest.describe("Article API - 未认证拦截", () => {
  rawTest("未登录获取文章树返回 401", async ({ request }) => {
    const resp = await request.post(`${BASE}/article/getTree`, {
      data: {},
    });
    expect(resp.status()).toBe(401);
  });

  rawTest("未登录新增文章返回 401", async ({ request }) => {
    const resp = await request.post(`${BASE}/article/add`, {
      data: { title: "should-fail" },
    });
    expect(resp.status()).toBe(401);
  });
});
