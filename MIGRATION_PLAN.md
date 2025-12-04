# 老框架模块迁移指南# 老框架核心模块迁移计划（采用新架构登录方案）

## 快速概览## 目录

**迁移策略**：放弃迁移已有的模块（user, userManage, global），专注 3 个核心模块（Article, File, Tag）1. [概述](#概述)

2. [新架构登录方案](#新架构登录方案)

| 模块 | 功能 | 优先级 | 难度 | 状态 |3. [核心模块分析](#核心模块分析)

| --------- | ------------------------- | --------- | ----- | ---- |4. [分阶段迁移计划](#分阶段迁移计划)

| `article` | 笔记 CRUD、树形结构、搜索 | 🔴 **P0** | 🟡 中 | ⬜ 待迁移 |5. [数据库迁移策略](#数据库迁移策略)

| `file` | 文件上传、下载、MD5 去重 | 🔴 **P0** | 🟢 低 | ⬜ 待迁移 |6. [技术适配细节](#技术适配细节)

| `tag` | 标签管理、分组 | 🟡 **P1** | 🟢 低 | ⬜ 待迁移 |7. [风险评估](#风险评估)

8. [验证清单](#验证清单)

---

---

## Article 模块详解

## 概述

### 数据模型

本迁移计划采用**新架构的登录方案**（环境变量单一密码 + JWT），而不是迁移老的 `user` 和 `userManage` 多用户模块。

````prisma

model Article {### 迁移策略

  id           String   @id @default(uuid())

  createdAt    DateTime @default(now())**放弃迁移** ❌

  updatedAt    DateTime @updatedAt

- ~~user 模块~~ - 多用户系统 → 改用环境变量单一密码

  title        String- ~~userManage 模块~~ - 用户邀请系统 → 不需要

  content      String   @default("")- ~~global 模块~~ - 全局配置 → 改用新框架的 AppConfig 模块

  parentPath   String?  // 树形路径 "#1#2#3#"

  tagIds       String?  // 标签 ID 列表 "#1#2#3#"**需要迁移** ✅

  favorite     Boolean  @default(false)

| 模块      | 功能                      | 优先级    | 难度  |

  relations    ArticleRelation[]| --------- | ------------------------- | --------- | ----- |

| `article` | 笔记 CRUD、树形结构、搜索 | 🔴 **P0** | 🟡 中 |

  @@fulltext([title, content])  // SQLite FTS5| `file`    | 文件上传、下载、MD5 去重  | 🔴 **P0** | 🟢 低 |

}| `tag`     | 标签管理、分组            | 🟡 **P1** | 🟢 低 |



model ArticleRelation {### 时间估算

  fromId String

  toId   String| 阶段         | 模块            | 工期   | 总计       |

| ------------ | --------------- | ------ | ---------- |

  from   Article @relation("from", fields: [fromId], references: [id], onDelete: Cascade)| 1-2 周       | Article + File  | 2 周   |            |

  to     Article @relation("to", fields: [toId], references: [id], onDelete: Cascade)| 2-3 周       | Tag             | 3-4 天 |            |

| 3 周         | 前端适配 + 测试 | 1 周   |            |

  @@id([fromId, toId])| **预计总计** |                 |        | **3-4 周** |

}

```---



### 核心工具函数## 新架构登录方案



```typescript### 为什么不迁移 user、userManage、global 模块？

// packages/backend/src/modules/article/utils.ts

新架构采用**简化的单一管理员方案**，相比多用户系统的优势：

export const pathToArray = (path: string): string[] => {

  if (!path) return [];| 方面       | 老方案（多用户） | 新方案（单一管理员） | 收益            |

  return path.split("#").filter(Boolean);| ---------- | ---------------- | -------------------- | --------------- |

};| 认证方式   | 用户名 + 密码    | 环境变量密码         | ✅ 简化 70%     |

| 密码存储   | SHA256 + 盐      | SHA512 + bcryptjs    | ✅ 更安全       |

export const arrayToPath = (arr: string[]): string => {| 数据库     | User 表          | 无                   | ✅ 无需用户表   |

  return "#" + arr.join("#") + "#";| 全局配置   | Global 表        | AppConfig 表         | ✅ 已有现成模块 |

};| WebAuthn   | 不支持           | ✅ 支持              | ✅ 现代认证     |

| 实现复杂度 | 高               | 低                   | ✅ 开发快速     |

export const appendIdToPath = (parentPath: string, id: string): string => {

  return (parentPath || "") + id + "#";### 登录流程

};

````

export const getParentIdByPath = (path: string): string | undefined => {1. POST /auth/login { password }

const arr = pathToArray(path); ↓

return arr.length > 0 ? arr[arr.length - 1] : undefined;2. 验证密码 (bcrypt.compare)

}; - 从环境变量获取 BACKEND_LOGIN_PASSWORD

- 比较客户端密码与存储的哈希值

export const buildArticleTree = (articles: Article[]): TreeNode[] => { ↓

const map = new Map<string, TreeNode>();3. 生成 JWT (server.jwt.sign)

const roots: TreeNode[] = []; - 返回 { token }

↓

// 构建节点4. 客户端存储 token

for (const article of articles) { - localStorage.token = token

    map.set(article.id, { ...article, children: [] });   ↓

}5. 后续请求

- Authorization: Bearer <token>

// 建立父子关系 ↓

for (const article of articles) {6. 服务器验证 (preHandler 自动)

    const node = map.get(article.id)!;   - request.user = { id: "admin", username: "admin", role: "ADMIN" }

    const parentId = getParentIdByPath(article.parentPath);```



    if (parentId) {### 核心代码实现

      const parent = map.get(parentId);

      if (parent) {#### 环境变量配置 (.env)

        parent.children!.push(node);

      }```env

    } else {BACKEND_LOGIN_PASSWORD=your-secure-password

      roots.push(node);BACKEND_JWT_SECRET=your-jwt-secret

    }```

}

#### 密码处理

return roots;

};```typescript

````// packages/backend/src/lib/crypto/index.ts



### ArticleService 实现import CryptoJS from "crypto-js";

import bcrypt from "bcryptjs";

```typescript

// packages/backend/src/modules/article/service.ts// SHA512 + 盐

export const shaWithSalt = (str: string, saltValue: string) => {

export class ArticleService {  const salt = CryptoJS.SHA512(saltValue).toString(CryptoJS.enc.Hex);

  constructor(private prisma: PrismaClient) {}  const saltedMessage = salt + str;

  const hash = CryptoJS.SHA512(saltedMessage);

  async createArticle(  return hash.toString(CryptoJS.enc.Hex).toUpperCase();

    title: string,};

    content: string,

    parentId?: string,// bcrypt 摘要存储

  ): Promise<Article> {export const hashPassword = (password: string) => {

    let parentPath = "";  return bcrypt.hashSync(password, 10);

};

    if (parentId) {```

      const parent = await this.prisma.article.findUnique({

        where: { id: parentId },#### 登录端点 (已实现)

      });

      if (!parent) throw new ErrorNotFound("Parent article not found");```typescript

      parentPath = appendIdToPath(parent.parentPath || "", parentId);// packages/backend/src/modules/auth/controller.ts

    }

server.post(

    return await this.prisma.article.create({  "/auth/login",

      data: { title, content, parentPath },  {

    });    config: { disableAuth: true },

  }    schema: {

      body: Type.Object({ password: Type.String() }),

  async updateArticle(      response: { 200: Type.Object({ token: Type.String() }) },

    id: string,    },

    data: { title?: string; content?: string; tagIds?: string },  },

  ): Promise<Article> {  async (request) => {

    return await this.prisma.article.update({ where: { id }, data });    const { password } = request.body;

  }

    // 验证密码

  async deleteArticle(id: string, force: boolean = false): Promise<void> {    const isValid = await bcrypt.compare(

    const article = await this.prisma.article.findUnique({ where: { id } });      password,

    if (!article) return;      hashPassword(shaWithSalt(ENV_BACKEND_LOGIN_PASSWORD, "admin")),

    );

    const children = await this.prisma.article.findMany({    if (!isValid) throw new ErrorAuthFailed();

      where: { parentPath: { contains: `${article.parentPath}${id}#` } },

    });    // 生成 JWT

    const token = server.jwt.sign({

    if (children.length > 0 && !force) {      id: "admin",

      throw new Error("Cannot delete article with children");      username: "admin",

    }      role: "ADMIN",

    });

    if (force && children.length > 0) {

      await this.prisma.article.deleteMany({    return { token };

        where: { id: { in: children.map((c) => c.id) } },  },

      }););

    }```



    await this.prisma.article.delete({ where: { id } });#### 认证钩子 (已实现)

  }

```typescript

  async searchArticles(// 所有需要认证的路由自动验证

    keyword: string,server.addHook("preHandler", async (request) => {

    page: number = 1,  const { disableAuth, requireAdmin } = request.routeOptions.config;

    pageSize: number = 20,  if (!disableAuth) {

  ): Promise<{ items: Article[]; total: number }> {    try {

    const skip = (page - 1) * pageSize;      await request.jwtVerify();

    } catch (err) {

    const items = await this.prisma.article.findMany({      throw new ErrorUnauthorized();

      where: {    }

        OR: [

          { title: { contains: keyword } },    if (requireAdmin && request.user.role !== UserRole.ADMIN) {

          { content: { contains: keyword } },      throw new ErrorBanned();

        ],    }

      },  }

      skip,});

      take: pageSize,```

      orderBy: { updatedAt: "desc" },

    });### 在路由中使用



    const total = await this.prisma.article.count({```typescript

      where: {// 获取当前用户信息

        OR: [server.post(

          { title: { contains: keyword } },  "/article/create",

          { content: { contains: keyword } },  {

        ],    /* schema */

      },  },

    });  async (request) => {

    // request.user 自动获取

    return { items, total };    console.log(request.user.id); // "admin"

  }    console.log(request.user.username); // "admin"

    console.log(request.user.role); // "ADMIN"

  async getArticleTree(): Promise<TreeNode[]> {  },

    const articles = await this.prisma.article.findMany({);

      orderBy: { createdAt: "asc" },```

    });

    return buildArticleTree(articles);---

  }

## 核心模块分析

  async setFavorite(id: string, favorite: boolean): Promise<Article> {

    return await this.prisma.article.update({### 1. Article 模块 (🔴 P0 - 优先级最高)

      where: { id },

      data: { favorite },#### 老框架功能

    });

  }- `addArticle(title, content, userId, parentId)` - 创建笔记

- `removeArticle(id, force)` - 删除笔记

  async getArticleDetail(id: string): Promise<Article> {- `updateArticle(id, data)` - 更新笔记

    const article = await this.prisma.article.findUnique({ where: { id } });- `searchArticle(keyword, userId, page)` - 搜索笔记

    if (!article) throw new ErrorNotFound("Article not found");- `setFavorite(articleId, userId, favorite)` - 收藏/取消收藏

    return article;- `getArticleTree(userId)` - 获取笔记树

  }- `setArticleRelation()` - 设置笔记关系

}

```#### 迁移特点



### API 路由- 树形结构通过 `parentPath` 字符串存储（e.g., `#1#2#3#`）

- 标签通过 `tagIds` 字符串存储（e.g., `#1#2#3#`）

```typescript- 文章间可以相互关联（ArticleRelation）

// packages/backend/src/modules/article/controller.ts- 需要全文搜索支持



export const registerArticleController = (options: RegisterOptions) => {#### 迁移难度

  const { server, articleService } = options;

| 要点     | 难度  | 说明                   |

  // 创建文章| -------- | ----- | ---------------------- |

  server.post<{ Body: CreateArticleRequest }>(| 数据库   | 🟢 低 | 迁移 Knex 到 Prisma    |

    "/article/create",| 数据模型 | 🟢 低 | 新建 Article 等模型    |

    { schema: { body: Type.Object({ title: Type.String(), content: Type.String(), parentId: Type.Optional(Type.String()) }) } },| 路由     | 🟡 中 | 从 Koa 转换到 Fastify  |

    async (request) => {| 树形逻辑 | 🟡 中 | 需要重写 path 工具函数 |

      return await articleService.createArticle(request.body.title, request.body.content, request.body.parentId);| 搜索功能 | 🟡 中 | SQLite 全文搜索集成    |

    }

  );#### 新框架数据模型



  // 获取文章详情```prisma

  server.get<{ Params: { id: string } }>(model Article {

    "/article/:id",  id           String   @id @default(uuid())

    async (request) => {  createdAt    DateTime @default(now())

      return await articleService.getArticleDetail(request.params.id);  updatedAt    DateTime @updatedAt

    }

  );  title        String

  content      String   @default("")

  // 更新文章  parentPath   String?  // 树形路径 "#1#2#3#"

  server.put<{ Params: { id: string }; Body: UpdateArticleRequest }>(  tagIds       String?  // 标签 ID 列表 "#1#2#3#"

    "/article/:id",  favorite     Boolean  @default(false)

    async (request) => {

      return await articleService.updateArticle(request.params.id, request.body);  relations    ArticleRelation[]

    }

  );  @@fulltext([title, content])  // SQLite FTS5

}

  // 删除文章

  server.delete<{ Params: { id: string } }>(model ArticleRelation {

    "/article/:id",  fromId String

    async (request) => {  toId   String

      await articleService.deleteArticle(request.params.id, false);

      return { success: true };  from   Article @relation("from", fields: [fromId], references: [id], onDelete: Cascade)

    }  to     Article @relation("to", fields: [toId], references: [id], onDelete: Cascade)

  );

  @@id([fromId, toId])

  // 搜索文章}

  server.get<{ Querystring: { keyword: string; page?: string } }>(```

    "/article/search",

    async (request) => {#### 迁移步骤

      const page = request.query.page ? parseInt(request.query.page) : 1;

      return await articleService.searchArticles(request.query.keyword, page);**第1步：扩展 Prisma Schema**

    }

  );在 `schema.prisma` 中添加上述模型，然后运行迁移。



  // 获取文章树**第2步：创建迁移**

  server.get(

    "/article/tree",```bash

    async (request) => {pnpm prisma migrate dev --name add_article_models

      return await articleService.getArticleTree();```

    }

  );**第3步：实现工具函数**



  // 设置收藏```typescript

  server.post<{ Params: { id: string }; Body: { favorite: boolean } }>(// packages/backend/src/modules/article/utils.ts

    "/article/:id/favorite",

    async (request) => {export const pathToArray = (path: string): string[] => {

      return await articleService.setFavorite(request.params.id, request.body.favorite);  if (!path) return [];

    }  return path.split("#").filter(Boolean);

  );};

};

```export const arrayToPath = (arr: string[]): string => {

  return "#" + arr.join("#") + "#";

---};



## File 模块详解export const appendIdToPath = (parentPath: string, id: string): string => {

  return (parentPath || "") + id + "#";

### 数据模型};



```prismaexport const getParentIdByPath = (path: string): string | undefined => {

model Attachment {  const arr = pathToArray(path);

  id        String   @id @default(uuid())  return arr.length > 0 ? arr[arr.length - 1] : undefined;

  createdAt DateTime @default(now())};

  updatedAt DateTime @updatedAt

export const buildArticleTree = (articles: Article[]): TreeNode[] => {

  filename  String  const map = new Map<string, TreeNode>();

  md5       String   @unique  const roots: TreeNode[] = [];

  size      Int

  type      String   // MIME type  // 构建节点

  for (const article of articles) {

  @@index([md5])    map.set(article.id, { ...article, children: [] });

}  }

````

// 建立父子关系

### AttachmentService 实现 for (const article of articles) {

    const node = map.get(article.id)!;

````typescript const parentId = getParentIdByPath(article.parentPath);

// packages/backend/src/modules/attachment/service.ts

    if (parentId) {

import crypto from "crypto";      const parent = map.get(parentId);

import fs from "fs";      if (parent) {

import path from "path";        parent.children!.push(node);

      }

export class AttachmentService {    } else {

  private storageDir: string;      roots.push(node);

    }

  constructor(storageDir: string = "./storage") {  }

    this.storageDir = storageDir;

  }  return roots;

};

  private async calculateMd5(```

    filePath: string,

    fileName: string,**第4步：实现 ArticleService**

  ): Promise<string> {

    return new Promise((resolve, reject) => {```typescript

      const hash = crypto.createHash("md5");// packages/backend/src/modules/article/service.ts

      hash.update(fileName); // 加入文件名到哈希

export class ArticleService {

      const stream = fs.createReadStream(filePath);  constructor(private prisma: PrismaClient) {}

      stream.on("data", (chunk) => hash.update(chunk));

      stream.on("end", () => resolve(hash.digest("hex")));  async createArticle(

      stream.on("error", reject);    title: string,

    });    content: string,

  }    parentId?: string,

  ): Promise<Article> {

  async uploadFiles(    let parentPath = "";

    files: Array<{

      filepath: string;    if (parentId) {

      filename: string;      const parent = await this.prisma.article.findUnique({

      encoding: string;        where: { id: parentId },

      mimetype: string;      });

    }>,      if (!parent) throw new ErrorNotFound("Parent article not found");

  ): Promise<Attachment[]> {      parentPath = appendIdToPath(parent.parentPath || "", parentId);

    const storageDir = path.resolve(this.storageDir, "attachments");    }

    await fs.promises.mkdir(storageDir, { recursive: true });

    return await this.prisma.article.create({

    const uploadedFiles: Attachment[] = [];      data: { title, content, parentPath },

    });

    for (const file of files) {  }

      const md5 = await this.calculateMd5(file.filepath, file.filename);

  async updateArticle(

      // 检查文件是否已存在（MD5 去重）    id: string,

      let existing = await this.prisma.attachment.findUnique({    data: { title?: string; content?: string; tagIds?: string },

        where: { md5 },  ): Promise<Article> {

      });    return await this.prisma.article.update({ where: { id }, data });

  }

      if (existing) {

        uploadedFiles.push(existing);  async deleteArticle(id: string, force: boolean = false): Promise<void> {

        // 删除临时文件    const article = await this.prisma.article.findUnique({ where: { id } });

        await fs.promises.unlink(file.filepath);    if (!article) return;

        continue;

      }    const children = await this.prisma.article.findMany({

      where: { parentPath: { contains: `${article.parentPath}${id}#` } },

      // 新文件名（随机前缀 + 原名）    });

      const newFilename = `${crypto.randomBytes(8).toString("hex")}-${file.filename}`;

      const newFilePath = path.resolve(storageDir, newFilename);    if (children.length > 0 && !force) {

      throw new Error("Cannot delete article with children");

      // 移动文件    }

      await fs.promises.rename(file.filepath, newFilePath);

    if (force && children.length > 0) {

      // 保存到数据库      await this.prisma.article.deleteMany({

      const attachment = await this.prisma.attachment.create({        where: { id: { in: children.map((c) => c.id) } },

        data: {      });

          filename: newFilename,    }

          md5,

          size: (await fs.promises.stat(newFilePath)).size,    await this.prisma.article.delete({ where: { id } });

          type: file.mimetype,  }

        },

      });  async searchArticles(

    keyword: string,

      uploadedFiles.push(attachment);    page: number = 1,

    }    pageSize: number = 20,

  ): Promise<{ items: Article[]; total: number }> {

    return uploadedFiles;    const skip = (page - 1) * pageSize;

  }

    const items = await this.prisma.article.findMany({

  async downloadFile(attachmentId: string) {      where: {

    const attachment = await this.prisma.attachment.findUnique({        OR: [

      where: { id: attachmentId },          { title: { contains: keyword } },

    });          { content: { contains: keyword } },

        ],

    if (!attachment) {      },

      throw new ErrorNotFound("File not found");      skip,

    }      take: pageSize,

      orderBy: { updatedAt: "desc" },

    const filePath = path.resolve(    });

      this.storageDir,

      "attachments",    const total = await this.prisma.article.count({

      attachment.filename,      where: {

    );        OR: [

          { title: { contains: keyword } },

    if (!fs.existsSync(filePath)) {          { content: { contains: keyword } },

      throw new ErrorNotFound("File not found on disk");        ],

    }      },

    });

    return { filePath, attachment };

  }    return { items, total };

  }

  async deleteFile(attachmentId: string) {

    const attachment = await this.prisma.attachment.findUnique({  async getArticleTree(): Promise<TreeNode[]> {

      where: { id: attachmentId },    const articles = await this.prisma.article.findMany({

    });      orderBy: { createdAt: "asc" },

    });

    if (!attachment) {    return buildArticleTree(articles);

      throw new ErrorNotFound("File not found");  }

    }

  async setFavorite(id: string, favorite: boolean): Promise<Article> {

    const filePath = path.resolve(    return await this.prisma.article.update({

      this.storageDir,      where: { id },

      "attachments",      data: { favorite },

      attachment.filename,    });

    );  }

}

    if (fs.existsSync(filePath)) {```

      await fs.promises.unlink(filePath);

    }### 2. File 模块 (🔴 P0)



    await this.prisma.attachment.delete({ where: { id: attachmentId } });#### 老框架功能

  }

- `uploadFile(files, userId)` - 上传文件（带 MD5 去重）

  async getAttachmentsByIds(ids: string[]): Promise<Attachment[]> {- `readFile(hash, userId)` - 读取文件

    return await this.prisma.attachment.findMany({- `deleteFile(hash, userId)` - 删除文件

      where: { id: { in: ids } },- `isFileExist(md5Array)` - 检查文件是否存在

    });

  }#### 技术特点

}

```- MD5 去重：同一文件多个用户上传时只存一份

- 文件存储：按用户 ID 分目录

### API 路由- 文件路径：`storage/file/{userId}/{filename}`



```typescript#### 新框架数据模型

// packages/backend/src/modules/attachment/controller.ts

```prisma

export const registerAttachmentController = (options: RegisterOptions) => {model Attachment {

  const { server, attachmentService } = options;  id        String   @id @default(uuid())

  createdAt DateTime @default(now())

  // 上传文件  updatedAt DateTime @updatedAt

  server.post<{ Body: MultipartFile[] }>(

    "/attachment/upload",  filename  String

    { schema: { consumes: ["multipart/form-data"] } },  md5       String   @unique

    async (request, reply) => {  size      Int

      const files = await request.file();  type      String   // MIME type

      const uploadedFiles: Attachment[] = [];

  @@index([md5])

      for await (const file of files) {}

        const tempPath = path.join(os.tmpdir(), file.filename);```

        await fs.promises.writeFile(tempPath, await file.toBuffer());

#### 迁移难度：🟢 **低**

        const result = await attachmentService.uploadFiles([

          {主要是文件存储路径和上传处理的适配。

            filepath: tempPath,

            filename: file.filename,#### 迁移步骤

            encoding: file.encoding,

            mimetype: file.mimetype,**第1步：添加 Prisma 模型**

          },

        ]);在 `schema.prisma` 中添加上述模型。



        uploadedFiles.push(...result);**第2步：创建迁移**

      }

```bash

      return uploadedFiles;pnpm prisma migrate dev --name add_attachment_model

    }```

  );

**第3步：实现 AttachmentService**

  // 下载文件

  server.get<{ Params: { id: string } }>(```typescript

    "/attachment/:id/download",// packages/backend/src/modules/attachment/service.ts

    async (request, reply) => {

      const { filePath, attachment } = await attachmentService.downloadFile(request.params.id);import crypto from "crypto";

      reply.download(filePath, attachment.filename);import fs from "fs";

    }import path from "path";

  );

export class AttachmentService {

  // 删除文件  private storageDir: string;

  server.delete<{ Params: { id: string } }>(

    "/attachment/:id",  constructor(storageDir: string = "./storage") {

    async (request) => {    this.storageDir = storageDir;

      await attachmentService.deleteFile(request.params.id);  }

      return { success: true };

    }  private async calculateMd5(

  );    filePath: string,

};    fileName: string,

```  ): Promise<string> {

    return new Promise((resolve, reject) => {

---      const hash = crypto.createHash("md5");

      hash.update(fileName); // 加入文件名到哈希

## Tag 模块详解

      const stream = fs.createReadStream(filePath);

### 数据模型      stream.on("data", (chunk) => hash.update(chunk));

      stream.on("end", () => resolve(hash.digest("hex")));

```prisma      stream.on("error", reject);

model Tag {    });

  id        String   @id @default(uuid())  }

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt  async uploadFiles(

    files: Array<{

  title     String   @unique      filepath: string;

  color     String?      filename: string;

  groupId   String?      encoding: string;

      mimetype: string;

  group     TagGroup? @relation(fields: [groupId], references: [id], onDelete: SetNull)    }>,

  ): Promise<Attachment[]> {

  @@index([groupId])    const storageDir = path.resolve(this.storageDir, "attachments");

}    await fs.promises.mkdir(storageDir, { recursive: true });



model TagGroup {    const uploadedFiles: Attachment[] = [];

  id        String   @id @default(uuid())

  createdAt DateTime @default(now())    for (const file of files) {

  updatedAt DateTime @updatedAt      const md5 = await this.calculateMd5(file.filepath, file.filename);



  title     String   @unique      // 检查文件是否已存在

  tags      Tag[]      const existing = await this.prisma.attachment.findUnique({

}        where: { md5 },

```      });

      if (existing) {

### TagService 实现        uploadedFiles.push(existing);

        continue;

```typescript      }

// packages/backend/src/modules/tag/service.ts

      // 新文件名（随机前缀 + 原名）

export class TagService {      const newFilename = `${crypto.randomBytes(8).toString("hex")}-${file.filename}`;

  constructor(private prisma: PrismaClient) {}      const newFilePath = path.resolve(storageDir, newFilename);



  async createTag(title: string, color?: string, groupId?: string): Promise<Tag> {      // 移动文件

    return await this.prisma.tag.create({      await fs.promises.rename(file.filepath, newFilePath);

      data: { title, color, groupId },

    });      // 保存到数据库

  }      const attachment = await this.prisma.attachment.create({

        data: {

  async updateTag(id: string, data: { title?: string; color?: string; groupId?: string }): Promise<Tag> {          filename: newFilename,

    return await this.prisma.tag.update({ where: { id }, data });          md5,

  }          size: (await fs.promises.stat(newFilePath)).size,

          type: file.mimetype,

  async deleteTag(id: string): Promise<void> {        },

    await this.prisma.tag.delete({ where: { id } });      });

  }

      uploadedFiles.push(attachment);

  async getTagList(): Promise<Tag[]> {    }

    return await this.prisma.tag.findMany({

      include: { group: true },    return uploadedFiles;

      orderBy: { createdAt: "asc" },  }

    });

  }  async downloadFile(attachmentId: string) {

    const attachment = await this.prisma.attachment.findUnique({

  async createGroup(title: string): Promise<TagGroup> {      where: { id: attachmentId },

    return await this.prisma.tagGroup.create({ data: { title } });    });

  }

    if (!attachment) {

  async updateGroup(id: string, title: string): Promise<TagGroup> {      throw new ErrorNotFound("File not found");

    return await this.prisma.tagGroup.update({ where: { id }, data: { title } });    }

  }

    const filePath = path.resolve(

  async deleteGroup(id: string): Promise<void> {      this.storageDir,

    // 删除分组前，先将该分组下的标签清除关联      "attachments",

    await this.prisma.tag.updateMany({      attachment.filename,

      where: { groupId: id },    );

      data: { groupId: null },

    });    if (!fs.existsSync(filePath)) {

    await this.prisma.tagGroup.delete({ where: { id } });      throw new ErrorNotFound("File not found on disk");

  }    }

}

```    return { filePath, attachment };

  }

### API 路由

  async deleteFile(attachmentId: string) {

```typescript    const attachment = await this.prisma.attachment.findUnique({

// packages/backend/src/modules/tag/controller.ts      where: { id: attachmentId },

    });

export const registerTagController = (options: RegisterOptions) => {

  const { server, tagService } = options;    if (!attachment) {

      throw new ErrorNotFound("File not found");

  // 创建标签    }

  server.post<{ Body: CreateTagRequest }>(

    "/tag/create",    const filePath = path.resolve(

    async (request) => {      this.storageDir,

      return await tagService.createTag(request.body.title, request.body.color);      "attachments",

    }      attachment.filename,

  );    );



  // 更新标签    if (fs.existsSync(filePath)) {

  server.put<{ Params: { id: string }; Body: UpdateTagRequest }>(      await fs.promises.unlink(filePath);

    "/tag/:id",    }

    async (request) => {

      return await tagService.updateTag(request.params.id, request.body);    await this.prisma.attachment.delete({ where: { id: attachmentId } });

    }  }

  );}

````

// 删除标签

server.delete<{ Params: { id: string } }>(### 3. Tag 模块 (🟡 P1)

    "/tag/:id",

    async (request) => {#### 老框架功能

      await tagService.deleteTag(request.params.id);

      return { success: true };- `addTag(tag)` - 创建标签

    }- `removeTag(id)` - 删除标签

);- `updateTag(detail)` - 更新标签

- `getTagList()` - 获取标签列表

  // 获取所有标签- `addGroup(data)` - 创建标签分组

  server.get(- `removeGroup(id)` - 删除标签分组

  "/tag/list",

  async (request) => {#### 新框架数据模型

      return await tagService.getTagList();

  }```prisma

  );model Tag {

  id String @id @default(uuid())

  // 创建标签分组 createdAt DateTime @default(now())

  server.post<{ Body: { title: string } }>( updatedAt DateTime @updatedAt

  "/tag-group/create",

  async (request) => { title String @unique

      return await tagService.createGroup(request.body.title);  color     String?

  } groupId String?

  );

  group TagGroup? @relation(fields: [groupId], references: [id], onDelete: SetNull)

  // 更新标签分组

  server.put<{ Params: { id: string }; Body: { title: string } }>( @@index([groupId])

  "/tag-group/:id",}

  async (request) => {

      return await tagService.updateGroup(request.params.id, request.body.title);model TagGroup {

  } id String @id @default(uuid())

  ); createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  // 删除标签分组

  server.delete<{ Params: { id: string } }>( title String @unique

  "/tag-group/:id", tags Tag[]

  async (request) => {}

      await tagService.deleteGroup(request.params.id);```

      return { success: true };

  }#### 迁移难度：🟢 **低**

  );

};简单的 CRUD 操作。

````

---

---

## 分阶段迁移计划

## 数据迁移脚本

### 阶段 1：基础设施 (第1-2周)

```typescript

// packages/backend/scripts/migrate-old-data.ts**目标**：建立数据库模型和基础服务



import Database from "better-sqlite3";1. **扩展 Prisma Schema**

import { PrismaClient } from "@prisma/client";   - 添加 Article, ArticleRelation, Attachment, Tag, TagGroup 模型

   - 创建迁移：`pnpm prisma migrate dev --name add_old_models`

const oldDb = new Database("./old/storage/cube-note.db");

const prisma = new PrismaClient();2. **数据迁移脚本**

   - 创建 `scripts/migrate-old-data.ts`

export async function migrateArticles() {   - 从 SQLite (old) 导入到 SQLite (new)

  const articles = oldDb.prepare("SELECT * FROM article").all() as any[];   - 测试数据完整性



  for (const article of articles) {3. **基础类型定义**

    await prisma.article.create({   - 在 `src/types/` 下创建各模块的 TypeBox schema

      data: {

        id: article.id.toString(),### 阶段 2：核心服务 (第2-3周)

        title: article.title,

        content: article.content || "",**目标**：实现关键业务逻辑

        parentPath: article.parentPath,

        tagIds: article.tagIds,1. **ArticleService**

        createdAt: new Date(article.createTime),   - ✅ CRUD 操作

        updatedAt: new Date(article.updateTime),   - ✅ 树形结构处理

      },   - ✅ 搜索功能

    });

  }2. **AttachmentService**

}   - ✅ 文件上传（MD5 去重）

   - ✅ 文件下载

export async function migrateTags() {   - ✅ 文件删除

  const tags = oldDb.prepare("SELECT * FROM tag").all() as any[];

3. **TagService**

  for (const tag of tags) {   - ✅ 标签管理

    await prisma.tag.create({   - ✅ 标签分组

      data: {

        id: tag.id.toString(),### 阶段 3：API 控制器 (第3-4周)

        title: tag.title,

        color: tag.color,**目标**：实现 Fastify 路由和 API 端点

      },

    });1. **ArticleController**

  }   - POST `/article/create`

}   - PUT `/article/{id}`

   - DELETE `/article/{id}`

export async function migrateFiles() {   - GET `/article/search`

  const files = oldDb.prepare("SELECT * FROM file").all() as any[];   - GET `/article/tree`



  for (const file of files) {2. **AttachmentController**

    try {   - POST `/attachment/upload`

      await prisma.attachment.create({   - GET `/attachment/{id}/download`

        data: {   - DELETE `/attachment/{id}`

          id: file.id.toString(),

          filename: file.filename,3. **TagController**

          md5: file.md5,   - POST `/tag/create`

          size: file.size || 0,   - PUT `/tag/{id}`

          type: file.type || "unknown",   - DELETE `/tag/{id}`

          createdAt: new Date(file.createTime),   - GET `/tag/list`

        },

      });### 阶段 4：前端集成 (第4-5周)

    } catch (error) {

      console.warn(`Failed to migrate file ${file.id}:`, error);**目标**：更新前端 API 调用

    }

  }1. 更新 `packages/frontend/src/services/`

}2. 测试所有功能

3. 数据验证

async function main() {

  try {### 阶段 5：测试和优化 (第5周)

    console.log("Starting data migration...");

**目标**：完整测试和性能优化

    await migrateArticles();

    console.log("✓ Articles migrated");1. 单元测试（Vitest）

2. 集成测试

    await migrateTags();3. 性能基准测试

    console.log("✓ Tags migrated");4. 文档更新



    await migrateFiles();---

    console.log("✓ Files migrated");

## 数据库迁移策略

    console.log("✓ Migration completed!");

  } catch (error) {### 冷迁移（推荐）

    console.error("Migration failed:", error);

    process.exit(1);**适用**：非生产环境、开发阶段

  } finally {

    await prisma.$disconnect();```typescript

    oldDb.close();// scripts/migrate-old-data.ts

  }

}import Database from "better-sqlite3";

import { PrismaClient } from "@prisma/client";

main();

```const oldDb = new Database("./old/storage/cube-note.db");

const prisma = new PrismaClient();

**执行迁移**：

export async function migrateArticles() {

```bash  const articles = oldDb.prepare("SELECT * FROM article").all();

cd packages/backend

npx ts-node scripts/migrate-old-data.ts  for (const article of articles) {

```    await prisma.article.create({

      data: {

---        id: article.id.toString(),

        title: article.title,

## 实现检查清单        content: article.content,

        parentPath: article.parentPath,

### ✅ 准备阶段        tagIds: article.tagIds,

        createdAt: new Date(article.createTime),

- [ ] 在 `prisma/schema.prisma` 中添加 Article, ArticleRelation, Tag, TagGroup, Attachment 模型        updatedAt: new Date(article.updateTime),

- [ ] 运行 `pnpm prisma migrate dev --name add_old_modules`      },

- [ ] 生成 Prisma Client    });

  }

### ✅ Article 模块}



- [ ] 创建 `src/modules/article/utils.ts` - 树形结构工具函数export async function migrateTags() {

- [ ] 创建 `src/modules/article/service.ts` - ArticleService  const tags = oldDb.prepare("SELECT * FROM tag").all();

- [ ] 创建 `src/modules/article/controller.ts` - API 路由

- [ ] 测试树形结构逻辑  for (const tag of tags) {

- [ ] 测试搜索功能    await prisma.tag.create({

      data: { id: tag.id.toString(), title: tag.title, color: tag.color },

### ✅ File 模块    });

  }

- [ ] 创建 `src/modules/attachment/service.ts` - AttachmentService}

- [ ] 创建 `src/modules/attachment/controller.ts` - API 路由

- [ ] 测试 MD5 去重逻辑export async function migrateFiles() {

- [ ] 测试文件上传/下载  const files = oldDb.prepare("SELECT * FROM file").all();



### ✅ Tag 模块  for (const file of files) {

    await prisma.attachment.create({

- [ ] 创建 `src/modules/tag/service.ts` - TagService      data: {

- [ ] 创建 `src/modules/tag/controller.ts` - API 路由        id: file.id.toString(),

- [ ] 测试标签和分组管理        filename: file.filename,

        md5: file.md5,

### ✅ 数据迁移        size: file.size,

        type: file.type,

- [ ] 创建数据迁移脚本 `scripts/migrate-old-data.ts`        createdAt: new Date(file.createTime),

- [ ] 运行迁移脚本      },

- [ ] 验证数据完整性    });

  }

### ✅ 前端适配}



- [ ] 更新 API 服务调用async function main() {

- [ ] 测试所有功能端到端  try {

- [ ] 验证树形显示    await migrateArticles();

- [ ] 验证文件上传下载    console.log("✓ Articles migrated");

- [ ] 验证标签管理    await migrateTags();

    console.log("✓ Tags migrated");

---    await migrateFiles();

    console.log("✓ Files migrated");

## 快速参考    console.log("✓ Migration completed!");

  } catch (error) {

### 从旧框架迁移代码时的模式对比    console.error("Migration failed:", error);

  } finally {

| 需求 | 旧框架 (Koa + Knex) | 新框架 (Fastify + Prisma) |    await prisma.$disconnect();

| ---- | ------------------- | ------------------------- |    oldDb.close();

| 获取单条记录 | `db.article().where({id}).first()` | `prisma.article.findUnique({where: {id}})` |  }

| 获取多条记录 | `db.article().where({...})` | `prisma.article.findMany({where: {...}})` |}

| 模糊查询 | `whereLike('title', `%keyword%`)` | `{where: {title: {contains: 'keyword'}}}` |

| 创建记录 | `db.article().insert({...})` | `prisma.article.create({data: {...}})` |main();

| 更新记录 | `db.article().where({id}).update({...})` | `prisma.article.update({where: {id}, data: {...}})` |```

| 删除记录 | `db.article().where({id}).delete()` | `prisma.article.delete({where: {id}})` |

| 关联查询 | `leftJoin('tag', ...)` | `{include: {tags: true}}` |**执行**：

| 路由定义 | `router.post('/path', handler)` | `server.post('/path', {schema}, handler)` |

| 认证钩子 | `router.use(auth middleware)` | `server.addHook('preHandler', auth)` |```bash

| 密码验证 | `bcrypt.compare(plain, hash)` | `bcrypt.compare(plain, hash)` |cd packages/backend

npx ts-node scripts/migrate-old-data.ts

---```



## 注意事项---



1. **树形结构**：文章通过 `parentPath` 存储树形关系，不是递归外键## 技术适配细节

2. **MD5 去重**：文件以 MD5 唯一性约束，避免重复存储相同文件

3. **字符串存储**：标签 ID 通过 `tagIds` 字符串存储（用 `#` 分隔），可考虑后续迁移到关系表### 1. 密码处理的变化

4. **认证**：所有路由自动通过 preHandler 验证 JWT，无需显式检查

5. **错误处理**：使用自定义 Exception 类（如 ErrorNotFound, ErrorBanned 等）#### 旧框架



---```typescript

const sha = (str: string) =>

## 相关文档  crypto.createHash("sha256").update(str).digest("hex");

const passwordHash = sha(passwordSalt + password); // SHA256

- 新框架认证方案：见 `AGENTS.md` 中的 "Authentication System" 部分```

- Prisma 使用指南：`packages/backend/docs/prisma-usage.md`

- API 路由模式：`packages/backend/src/modules/*/controller.ts`#### 新框架


```typescript
import bcrypt from "bcryptjs";

const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
````

### 2. 路由定义的变化

#### 旧框架 (Koa)

```typescript
router.post("/login", async (ctx) => {
  const { username, password } = ctx.request.body;
  const resp = await service.login(username, password);
  ctx.body = resp;
});
```

#### 新框架 (Fastify)

```typescript
server.post<{ Body: LoginRequest }>(
  "/auth/login",
  {
    config: { disableAuth: true },
    schema: {
      body: Type.Object({ password: Type.String() }),
      response: { 200: Type.Object({ token: Type.String() }) },
    },
  },
  async (request, reply) => {
    const { password } = request.body;
    const resp = await authService.login(password);
    return resp;
  },
);
```

### 3. 数据库查询的变化

#### 旧框架 (Knex)

```typescript
const article = await db.article().select().where({ id }).first();
const articles = await db
  .article()
  .select()
  .whereLike("parentPath", `%#${id}#%`);
```

#### 新框架 (Prisma)

```typescript
const article = await prisma.article.findUnique({ where: { id } });
const articles = await prisma.article.findMany({
  where: { parentPath: { contains: `#${id}#` } },
});
```

---

## 风险评估

| 风险         | 等级  | 缓解方案                   |
| ------------ | ----- | -------------------------- |
| 数据完整性   | 🟡 中 | 详细的迁移验证，备份原数据 |
| 性能回归     | 🟡 中 | 性能基准测试，优化查询     |
| API 兼容性   | 🟡 中 | 前端同步更新，版本控制     |
| 文件存储路径 | 🟢 低 | 使用对称的存储方案         |
| 树形逻辑错误 | 🟡 中 | 单元测试覆盖路径工具函数   |

---

## 验证清单

### 数据迁移验证

- [ ] 文章数据完整性（数量、字段）
- [ ] 树形结构正确性
- [ ] 标签数据完整性
- [ ] 文件元数据完整性
- [ ] 关系数据完整性（ArticleRelation）

### 功能验证

- [ ] 文章创建、更新、删除正常
- [ ] 文章树形展示正确
- [ ] 文件上传和下载正常
- [ ] 标签管理正常
- [ ] 搜索功能正常

### 性能验证

- [ ] 文章列表加载速度 < 200ms
- [ ] 搜索响应 < 500ms
- [ ] 文件上传速度正常
- [ ] 数据库查询性能正常

### 测试覆盖

- [ ] 单元测试 (80% 覆盖率)
- [ ] 集成测试
- [ ] API 端点测试

---

## 实现时间估算

| 阶段     | 任务                   | 预计工期    | 难度  |
| -------- | ---------------------- | ----------- | ----- |
| 1        | 扩展 Schema + 数据迁移 | 2-3 天      | 🟢 低 |
| 2        | ArticleService 实现    | 5-7 天      | 🟡 中 |
| 2        | AttachmentService 实现 | 2-3 天      | 🟢 低 |
| 2        | TagService 实现        | 2-3 天      | 🟢 低 |
| 3        | 所有控制器实现         | 5-7 天      | 🟡 中 |
| 4        | 前端适配               | 3-5 天      | 🟡 中 |
| 5        | 测试和优化             | 2-3 天      | 🟡 中 |
| **总计** |                        | **23-31天** |       |

---

## 总结

这是一个**简化后的系统性迁移**，核心特点：

1. ✅ 采用环境变量单一密码，避免多用户系统复杂性（不迁移 user 模块）
2. ✅ 使用新框架的 AppConfig 模块，避免全局配置模块（不迁移 global 模块）
3. ✅ 重点放在 3 个核心模块（Article, File, Tag）
4. ✅ 使用 Prisma 提供类型安全
5. ✅ 详细的数据迁移脚本
6. ✅ 充分的测试验证

通过放弃迁移已有的模块，时间估算从原来的 **3-4 周** 进一步优化到 **3 周左右**，大幅降低迁移风险和复杂度。
