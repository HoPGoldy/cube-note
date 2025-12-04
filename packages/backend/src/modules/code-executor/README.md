# Code Executor 模块

一个安全的代码执行服务，使用 vm2 在沙箱环境中执行前端传入的 JavaScript 代码。

## 功能特性

- ✅ 安全的沙箱环境（基于 vm2）
- ✅ 超时控制（默认 5 秒，最大 30 秒）
- ✅ 上下文变量传递
- ✅ Console 输出捕获
- ✅ 代码语法验证
- ✅ 禁用 eval 和 WebAssembly
- ✅ 完整的错误处理
- ✅ **HTTP 请求支持**（可选启用）
- ✅ 域名白名单限制

## API 接口

### 1. 执行代码

**POST** `/api/code-executor/execute`

执行传入的 JavaScript 代码并返回结果。

#### 请求参数

```json
{
  "code": "string", // 要执行的 JavaScript 代码（必填）
  "timeout": 5000, // 超时时间（毫秒），可选，默认 5000ms
  "context": {
    // 上下文变量，可选
    "key": "value"
  }
}
```

#### 响应示例

```json
{
  "success": true,
  "result": "执行结果",
  "executionTime": 15,
  "logs": ["console.log 输出1", "console.log 输出2"]
}
```

#### 使用示例

```javascript
// 简单计算
{
  "code": "1 + 1"
}
// 返回: { "success": true, "result": 2, "executionTime": 1, "logs": [] }

// 带上下文变量
{
  "code": "a + b",
  "context": { "a": 10, "b": 20 }
}
// 返回: { "success": true, "result": 30, "executionTime": 1, "logs": [] }

// 数组操作
{
  "code": "[1, 2, 3].map(x => x * 2)"
}
// 返回: { "success": true, "result": [2, 4, 6], "executionTime": 1, "logs": [] }

// 带 console.log
{
  "code": "console.log('Hello'); console.log('World'); 'Done'"
}
// 返回: { "success": true, "result": "Done", "executionTime": 1, "logs": ["Hello", "World"] }

// 复杂对象操作
{
  "code": "user.scores.reduce((acc, score) => acc + score, 0) / user.scores.length",
  "context": {
    "user": {
      "name": "张三",
      "scores": [80, 90, 85]
    }
  }
}
// 返回: { "success": true, "result": 85, "executionTime": 2, "logs": [] }
```

### HTTP 请求示例（需启用 HTTP 功能）

```javascript
// GET 请求
{
  "code": "(async () => { const res = await http.get('https://api.example.com/data'); return res.data; })()"
}

// POST 请求
{
  "code": `
    (async () => {
      const response = await http.post(
        'https://api.example.com/users',
        { name: '张三', age: 25 }
      );
      return response.data;
    })()
  `
}

// 带请求头
{
  "code": `
    (async () => {
      const response = await http.get(
        'https://api.example.com/protected',
        { headers: { 'Authorization': 'Bearer token123' } }
      );
      return response.data;
    })()
  `
}
```

### 2. 验证代码语法

**POST** `/api/code-executor/validate`

验证代码语法是否正确，但不执行代码。

#### 请求参数

```json
{
  "code": "const x = 1 + 1;"
}
```

#### 响应示例

```json
{
  "valid": true
}
```

或

```json
{
  "valid": false,
  "error": "Unexpected token ;"
}
```

## 安全限制

### ✅ 已实现的安全保护

1. **禁用 eval**：不允许使用 `eval()` 函数
2. **禁用 WebAssembly**：不支持 WASM 执行
3. **超时限制**：最大执行时间 30 秒
4. **沙箱隔离**：完全隔离的执行环境
5. **内存限制**：由 vm2 控制内存使用

### 🚫 被阻止的访问

- **文件系统**：无法访问 `require('fs')`，不能读写文件
- **进程控制**：无法访问 `process` 对象，不能执行 `process.exit()`
- **网络请求**：无法访问 `http`、`https`、`net` 等网络模块
- **子进程**：无法执行 `child_process`
- **系统命令**：无法执行任何系统级命令

### ⚠️ 安全说明

- 沙箱中的代码有自己独立的 `global` 对象，不会污染宿主环境
- 即使在沙箱内修改 `global`，也不会影响 Node.js 的真实全局对象
- **本服务不支持文件写入操作**，所有代码执行都在内存中完成
- HTTP 功能默认关闭，需要在初始化服务时显式启用

## HTTP 功能配置

### 启用 HTTP 请求

在创建 `CodeExecutorService` 时配置：

```typescript
const service = new CodeExecutorService({
  enableHttp: true, // 启用 HTTP 功能
  httpTimeout: 10000, // HTTP 请求超时（毫秒）
  allowedDomains: [
    // 可选：限制允许的域名
    "api.example.com",
    "*.github.com", // 支持通配符
  ],
});
```

### HTTP API

当启用 HTTP 功能后，代码中可以使用 `http` 对象：

```javascript
// GET 请求
const response = await http.get(url, config);

// POST 请求
const response = await http.post(url, data, config);

// PUT 请求
const response = await http.put(url, data, config);

// DELETE 请求
const response = await http.delete(url, config);

// 通用请求
const response = await http.request(config);
```

### 域名白名单

如果配置了 `allowedDomains`，只有白名单中的域名可以访问：

```typescript
allowedDomains: [
  "api.example.com", // 精确匹配
  "*.example.com", // 通配符，匹配所有子域名
];
```

如果不配置 `allowedDomains`，则允许访问任何域名。

## 错误处理

### 超时错误

当代码执行时间超过指定的 `timeout` 时，会抛出 `CodeExecutionTimeoutError`：

```json
{
  "statusCode": 408,
  "message": "代码执行超时（5000ms）"
}
```

### 执行错误

代码运行时错误会在响应中返回：

```json
{
  "success": false,
  "error": "ReferenceError: x is not defined",
  "executionTime": 2,
  "logs": []
}
```

### 语法错误

代码语法错误也会在响应中返回：

```json
{
  "success": false,
  "error": "Unexpected token",
  "executionTime": 1,
  "logs": []
}
```

## 代码编写注意事项

1. **不要使用 return 语句**

   在沙箱中直接执行的代码不应包含 `return`，最后一行的表达式值会自动作为结果返回。

   ```javascript
   // ❌ 错误
   "return 1 + 1";

   // ✅ 正确
   "1 + 1";
   ```

2. **返回对象时需要加括号**

   ```javascript
   // ❌ 错误
   "{ foo: 'bar' }";

   // ✅ 正确
   "({ foo: 'bar' })";
   ```

3. **多语句代码块**

   最后一个表达式的值会作为结果：

   ```javascript
   `
   const x = 10;
   const y = 20;
   x + y
   `;
   // 返回 30
   ```

## 测试

运行测试用例：

```bash
pnpm test
```

运行测试并查看覆盖率：

```bash
pnpm test:coverage
```

使用 UI 界面运行测试：

```bash
pnpm test:ui
```

## 技术实现

- **vm2**：提供安全的 JavaScript 沙箱环境
- **TypeBox**：用于请求/响应的 Schema 验证
- **Fastify**：HTTP 框架
- **Vitest**：测试框架

## 文件结构

```
src/modules/code-executor/
├── controller.ts       # API 路由控制器
├── service.ts          # 核心业务逻辑
├── schema.ts           # 请求/响应 Schema
├── error.ts            # 自定义错误类
└── __tests__/
    └── service.test.ts # 单元测试
```
