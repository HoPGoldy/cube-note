# 读取、搜索与统计

将 `<service>` 替换为已配置的服务名，通常是 `cube-note`。

## 读取文章内容

```bash
oac <service> post-api-article-get-content \
  --body '{"id":"<文章ID>"}'
```

返回文章完整信息，包含 `title`、`content`、`parentPath`、`tagIds`、`favorite`、`color`、`listSubarticle`、`createdAt`、`updatedAt`。

## 搜索文章

```bash
oac <service> post-api-article-search --body '{
  "keyword": "<关键词>",
  "page": 1,
  "pageSize": 20,
  "colors": [],
  "tagIds": []
}'
```

返回 `{ items, total }`。当 `total` 大于已读取数量时继续翻页；只在用户需要完整汇总时读取全部页面。
`colors` 与 `tagIds` 为可选筛选条件；`tagIds` 需配合 [`tags.md`](tags.md) 中查询到的标签 ID 使用。

## 获取文章树

```bash
oac <service> post-api-article-get-tree \
  --body '{}'
```

返回嵌套的树形结构，每项包含 `id`、`title`、`parentPath`、`color` 和 `children`。可用于了解笔记的整体目录结构。

## 获取子文章

```bash
oac <service> post-api-article-get-link \
  --body '{"id":"<文章ID>"}'
```

返回 `{ parentArticleIds, parentArticleTitle, childrenArticles }`，`childrenArticles` 为直接子文章列表（`id`、`title`、`parentPath`、`color`）。

## 获取收藏列表

```bash
oac <service> post-api-article-get-favorite \
  --body '{}'
```

返回收藏的文章列表（`id`、`title`、`color`、`parentPath`）。

## 统计

```bash
oac <service> post-api-article-statistic --body '{}'
```

返回 `articleCount` 和 `articleLength`。
