import { test, expect } from "../fixtures/auth";

test.describe("标签管理", () => {
  test("标签管理页可以正常打开", async ({ page }) => {
    await page.goto("/tags");
    await expect(page).toHaveURL(/\/tags/);
  });

  test("标签管理页正常渲染", async ({ page }) => {
    await page.goto("/tags");

    // 页面容器存在
    await expect(page.getByTestId("tag-manager-container")).toBeVisible({
      timeout: 8000,
    });
  });
});
