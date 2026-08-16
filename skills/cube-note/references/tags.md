# 标签管理

将 `<service>` 替换为已配置的服务名，通常是 `cube-note`。

## 获取标签列表

```bash
oac <service> post-api-tag-list --body '{}'
```

返回标签数组，每项包含 `id`、`title` 和 `color`。标签 ID 来自接口返回，不要猜测或编造。

## 获取标签详情

```bash
oac <service> get-api-tag-id \
  --params '{"id":"<标签ID>"}'
```

## 创建标签

```bash
oac <service> post-api-tag-add --body '{
  "title": "<标签名>",
  "color": "#FF0000"
}'
```

`title` 必填；`color` 可选。

## 更新标签

```bash
oac <service> post-api-tag-update --body '{
  "id": "<标签ID>",
  "title": "<新标签名>",
  "color": "#00FF00"
}'
```

## 删除标签

删除是破坏性操作，执行前必须向用户确认：

```bash
oac <service> post-api-tag-remove --body '{
  "id": "<标签ID>"
}'
```

## 批量设置标签颜色

```bash
oac <service> post-api-tag-batch-set-color --body '{
  "tagIds": ["<标签ID1>", "<标签ID2>"],
  "color": "#FF0000"
}'
```

## 批量删除标签

删除是破坏性操作，执行前必须向用户确认：

```bash
oac <service> post-api-tag-batch-remove --body '{
  "ids": ["<标签ID1>", "<标签ID2>"]
}'
```

## 给文章设置标签

通过更新文章的 `tagIds` 字段实现（`tagIds` 为字符串形式的逗号分隔 ID 列表，或 `null` 清除）：

```bash
oac <service> post-api-article-update --body '{
  "id": "<文章ID>",
  "tagIds": "<标签ID1>,<标签ID2>"
}'
```

按标签筛选文章时，在搜索命令的 `tagIds` 字段中传入标签 ID 数组，参见 [`read-and-search.md`](read-and-search.md)。
