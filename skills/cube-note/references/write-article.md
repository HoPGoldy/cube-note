# 写入文章

将 `<service>` 替换为已配置的服务名，通常是 `cube-note`。

## 新建文章

```bash
oac <service> post-api-article-add --body '{
  "title": "<标题>",
  "content": "<内容>",
  "parentId": "<父文章ID>"
}'
```

`title` 必填；`content` 和 `parentId` 可选。返回新建文章的 `id`，不要猜测或编造 ID。
`parentId` 决定文章的父级位置；不传则创建在根目录。

## 更新已有文章

1. 先读取目标文章已有内容：

   ```bash
   oac <service> post-api-article-get-content \
     --body '{"id":"<文章ID>"}'
   ```

2. 根据结果处理：
   - 没有已有内容：直接准备新内容。
   - 已有内容且用户要求追加：保留原文，在末尾追加新内容。
   - 已有内容且用户明确要求替换：使用新内容替换。
   - 已有内容但用户未说明：询问追加、替换还是局部编辑，不得默认覆盖。

3. 写入完整的最终内容（全量覆盖）：

   ```bash
   oac <service> post-api-article-update --body '{
     "id": "<文章ID>",
     "title": "<最终标题>",
     "content": "<最终完整内容>",
     "color": null,
     "favorite": false
   }'
   ```

`update` 是可选的字段更新，传什么改什么；构造 JSON 时正确转义换行、引号和反斜杠。

## 精确局部编辑（推荐用于小幅修改）

对文章内容做一组精确文本替换，比全量 `update` 更安全：

```bash
oac <service> post-api-article-edit --body '{
  "id": "<文章ID>",
  "edits": [
    {"oldText": "<原文中唯一匹配的片段>", "newText": "<替换后的文本>"}
  ],
  "baseUpdatedAt": "<getContent 返回的 updatedAt>"
}'
```

规则：
- 所有 `edits` 针对**原始内容**匹配；每个 `oldText` 必须在原文中唯一匹配，未找到或多处匹配都会报错。
- `edits` 之间不允许重叠；任一 edit 失败则整体不生效。
- `baseUpdatedAt` 可选，填入 `getContent` 返回的 `updatedAt` 可启用乐观锁，文章被他人修改后会拒绝本次编辑。

## 设置收藏

```bash
oac <service> post-api-article-set-favorite --body '{
  "id": "<文章ID>",
  "favorite": true
}'
```

## 删除文章

删除是破坏性操作，执行前必须向用户确认：

```bash
oac <service> post-api-article-remove --body '{
  "id": "<文章ID>",
  "force": true
}'
```

- 文章下有子文章时，`force` 为 `false`（或省略）会拒绝删除。
- 用户明确确认后，可传 `"force": true` 连同子文章一起删除。

## 写入后

向用户说明操作结果（新建、更新、编辑或删除）。不要在用户未要求时复述整篇私人笔记内容。
