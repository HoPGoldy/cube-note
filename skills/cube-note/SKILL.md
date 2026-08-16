---
name: cube-note
description: 用户要求读取、写入、搜索或管理 cube-note 笔记、标签及附件时使用。
---

# cube-note

## 一、使用这个 Skill 需要了解的知识

- 通过 `oac` 调用 cube-note，不手写 HTTP 请求。
- 文档中的 `<service>` 表示已经配置好的服务名，通常是 `cube-note`。
- 文章通过 `id` 定位，ID 来自接口返回，不要猜测或编造。
- 写入前必须读取目标文章已有内容；已有内容且用户没有明确要求覆盖时，询问是追加、替换还是精确编辑。
- 删除文章、批量删除标签是破坏性操作，执行前必须向用户确认；删除有子文章的文章时确认是否 `force`。
- Access Token 是敏感信息，不在回复、日志或示例中展示真实值。
- OpenAPI 更新后命令名或参数可能变化；命令失败时读取 [`troubleshoot.md`](troubleshoot.md)。

## 二、任务目录

1. 当用户要求读取文章内容、搜索文章、查看文章树、收藏列表或统计时，阅读 [`references/read-and-search.md`](references/read-and-search.md)。
2. 当用户要求创建、更新、精确编辑、删除或收藏文章时，阅读 [`references/write-article.md`](references/write-article.md)。
3. 当用户要求上传、嵌入、查询或下载附件时，阅读 [`references/attachments.md`](references/attachments.md)。
4. 当用户要求管理标签（创建、更新、删除、批量操作）或按标签筛选文章时，阅读 [`references/tags.md`](references/tags.md)。
5. 当命令、配置、认证或 Schema 出现问题时，阅读 [`troubleshoot.md`](troubleshoot.md)。
