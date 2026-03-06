import { test, expect } from "../fixtures/auth";

test.describe("笔记", () => {
  test("首页自动跳转到根笔记详情页", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/article\//);
  });

  test("笔记详情页正常渲染标题", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/article\//);
    // 标题输入框存在
    await expect(page.getByTestId("article-title-input")).toBeVisible({
      timeout: 10000,
    });
  });

  test("点击编辑按钮可进入编辑模式", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/article\//);

    // 点击编辑按钮
    await page.getByTestId("article-edit-btn").click();

    // 编辑器区域存在
    await expect(page.getByTestId("article-editor-area")).toBeVisible({
      timeout: 10000,
    });
  });

  test("编辑后点击保存无报错弹窗", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/article\//);

    // 进入编辑模式
    await page.getByTestId("article-edit-btn").click();

    // 等待编辑器可用
    const editorArea = page.locator(".w-md-editor-text-input");
    await editorArea.waitFor({ timeout: 10000 });
    await editorArea.click({ force: true });
    await page.keyboard.type(" ");

    // 点击保存
    await page.getByTestId("article-save-btn").click();

    // 页面上不应出现 error 级别的 antd message
    await expect(page.locator(".ant-message-error")).not.toBeVisible();
  });
});
