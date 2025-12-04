# Code Executor 使用示例

## 基础示例

### 1. 简单计算

```bash
POST /api/code-executor/execute
{
  "code": "1 + 1"
}
```

响应：

```json
{
  "success": true,
  "code": 200,
  "data": {
    "success": true,
    "result": 2,
    "executionTime": 1,
    "logs": []
  }
}
```

### 2. 使用变量

```bash
POST /api/code-executor/execute
{
  "code": "name + ' is ' + age + ' years old'",
  "context": {
    "name": "张三",
    "age": 25
  }
}
```

### 3. 数组操作

```bash
POST /api/code-executor/execute
{
  "code": "numbers.filter(n => n > 10).map(n => n * 2)",
  "context": {
    "numbers": [5, 12, 8, 20, 15]
  }
}
```

响应：

```json
{
  "success": true,
  "result": [24, 40, 30]
}
```

### 4. 对象处理

```bash
POST /api/code-executor/execute
{
  "code": "({ fullName: user.firstName + ' ' + user.lastName, adult: user.age >= 18 })",
  "context": {
    "user": {
      "firstName": "张",
      "lastName": "三",
      "age": 25
    }
  }
}
```

## HTTP 请求示例

### 1. GET 请求

```bash
POST /api/code-executor/execute
{
  "code": "(async () => { const res = await http.get('https://jsonplaceholder.typicode.com/todos/1'); return res.data; })()",
  "timeout": 10000
}
```

### 2. POST 请求创建数据

```bash
POST /api/code-executor/execute
{
  "code": `
    (async () => {
      const response = await http.post(
        'https://jsonplaceholder.typicode.com/posts',
        {
          title: '我的文章',
          body: '文章内容',
          userId: 1
        }
      );
      return {
        id: response.data.id,
        title: response.data.title
      };
    })()
  `,
  "timeout": 10000
}
```

### 3. 带认证的请求

```bash
POST /api/code-executor/execute
{
  "code": `
    (async () => {
      const response = await http.get(
        'https://api.example.com/user/profile',
        {
          headers: {
            'Authorization': 'Bearer YOUR_TOKEN',
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    })()
  `,
  "timeout": 10000
}
```

### 4. 多个请求组合

```bash
POST /api/code-executor/execute
{
  "code": `
    (async () => {
      // 获取用户信息
      const user = await http.get('https://jsonplaceholder.typicode.com/users/1');

      // 获取用户的文章
      const posts = await http.get('https://jsonplaceholder.typicode.com/posts?userId=1');

      return {
        username: user.data.name,
        postCount: posts.data.length,
        firstPost: posts.data[0]?.title
      };
    })()
  `,
  "timeout": 15000
}
```

### 5. 错误处理

```bash
POST /api/code-executor/execute
{
  "code": `
    (async () => {
      try {
        const response = await http.get('https://api.example.com/data');
        return { success: true, data: response.data };
      } catch (error) {
        console.error('请求失败:', error.message);
        return { success: false, error: error.message };
      }
    })()
  `,
  "timeout": 10000
}
```

## 高级示例

### 1. 数据转换

```bash
POST /api/code-executor/execute
{
  "code": `
    users.map(user => ({
      id: user.id,
      name: user.name.toUpperCase(),
      email: user.email.toLowerCase(),
      isActive: user.status === 'active',
      joinedYear: new Date(user.createdAt).getFullYear()
    }))
  `,
  "context": {
    "users": [
      { "id": 1, "name": "zhang san", "email": "ZHANG@EXAMPLE.COM", "status": "active", "createdAt": "2023-01-15" },
      { "id": 2, "name": "li si", "email": "LI@EXAMPLE.COM", "status": "inactive", "createdAt": "2023-06-20" }
    ]
  }
}
```

### 2. 数据聚合

```bash
POST /api/code-executor/execute
{
  "code": `
    ({
      total: orders.reduce((sum, order) => sum + order.amount, 0),
      count: orders.length,
      average: orders.reduce((sum, order) => sum + order.amount, 0) / orders.length,
      maxOrder: Math.max(...orders.map(o => o.amount)),
      minOrder: Math.min(...orders.map(o => o.amount))
    })
  `,
  "context": {
    "orders": [
      { "id": 1, "amount": 100 },
      { "id": 2, "amount": 250 },
      { "id": 3, "amount": 80 }
    ]
  }
}
```

### 3. 条件逻辑

```bash
POST /api/code-executor/execute
{
  "code": `
    {
      const score = totalScore / maxScore * 100;
      let grade;

      if (score >= 90) grade = 'A';
      else if (score >= 80) grade = 'B';
      else if (score >= 70) grade = 'C';
      else if (score >= 60) grade = 'D';
      else grade = 'F';

      return {
        score: score.toFixed(2),
        grade: grade,
        passed: score >= 60
      };
    }
  `,
  "context": {
    "totalScore": 85,
    "maxScore": 100
  }
}
```

### 4. 日期处理

```bash
POST /api/code-executor/execute
{
  "code": `
    {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      return {
        date: date.toISOString(),
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        daysAgo: diffDays,
        weekday: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
      };
    }
  `,
  "context": {
    "dateString": "2024-01-15"
  }
}
```

### 5. 字符串处理

```bash
POST /api/code-executor/execute
{
  "code": `
    ({
      length: text.length,
      words: text.split(/\\s+/).length,
      uppercase: text.toUpperCase(),
      lowercase: text.toLowerCase(),
      reversed: text.split('').reverse().join(''),
      firstWord: text.split(/\\s+/)[0],
      lastWord: text.split(/\\s+/).pop()
    })
  `,
  "context": {
    "text": "Hello World from Code Executor"
  }
}
```

## Console 输出

```bash
POST /api/code-executor/execute
{
  "code": `
    console.log('开始处理');
    const sum = numbers.reduce((a, b) => a + b, 0);
    console.log('总和:', sum);
    console.warn('注意：数组长度为', numbers.length);
    sum
  `,
  "context": {
    "numbers": [1, 2, 3, 4, 5]
  }
}
```

响应：

```json
{
  "success": true,
  "result": 15,
  "executionTime": 2,
  "logs": ["开始处理", "总和: 15", "[WARN] 注意：数组长度为 5"]
}
```

## 错误处理示例

### 1. 语法错误

```bash
POST /api/code-executor/execute
{
  "code": "const x = ;"
}
```

响应：

```json
{
  "success": false,
  "error": "Unexpected token ;",
  "executionTime": 1,
  "logs": []
}
```

### 2. 运行时错误

```bash
POST /api/code-executor/execute
{
  "code": "undefinedVariable.toString()"
}
```

响应：

```json
{
  "success": false,
  "error": "undefinedVariable is not defined",
  "executionTime": 1,
  "logs": []
}
```

### 3. 超时错误

```bash
POST /api/code-executor/execute
{
  "code": "while(true) {}",
  "timeout": 1000
}
```

响应（HTTP 408）：

```json
{
  "statusCode": 408,
  "code": 40800,
  "message": "代码执行超时（1000ms）"
}
```

## 验证代码语法

```bash
POST /api/code-executor/validate
{
  "code": "const x = 1 + 1; console.log(x);"
}
```

响应：

```json
{
  "success": true,
  "code": 200,
  "data": {
    "valid": true
  }
}
```

## 探针环境变量

在 CODE 模式的探针任务中，可以通过 `env` 对象访问预先配置的环境变量。
这些变量可以在「环境变量」页面管理，支持敏感信息加密存储。

### 使用环境变量访问 API

```javascript
// env 对象由系统自动注入，包含所有配置的环境变量
const apiKey = env.API_KEY;
const baseUrl = env.SERVICE_BASE_URL;

const response = await http.get(`${baseUrl}/health`, {
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
});

return {
  result: {
    success: response.status === 200,
    message: `Status: ${response.status}`,
    responseTime: response.data.latency,
  },
};
```

### 多个环境变量组合使用

```javascript
// 从环境变量获取数据库连接信息
const dbHost = env.DB_HOST;
const dbPort = env.DB_PORT;
const dbUser = env.DB_USER;
const dbPassword = env.DB_PASSWORD;

// 使用环境变量构建请求
const response = await http.post(`${env.MONITOR_API}/check`, {
  target: `${dbHost}:${dbPort}`,
  credentials: {
    user: dbUser,
    password: dbPassword,
  },
});

return {
  result: {
    success: response.data.connected,
    message: response.data.message,
  },
};
```

### 环境变量命名规范

- 使用大写字母 + 下划线命名，如 `API_KEY`、`DB_PASSWORD`
- 敏感信息（如密码、Token）建议标记为「敏感」
- 敏感变量在管理页面不会显示实际值

### 探针执行后更新环境变量

探针可以在执行完成后更新已存在的环境变量，适用于以下场景：

- **Token 自动刷新** - 检测到 Token 过期后获取新 Token 并保存
- **状态传递** - 在探针之间传递状态信息
- **缓存远程配置** - 从远程获取配置并缓存到环境变量

使用返回格式：

```javascript
// 同时返回探针结果和环境变量更新
return {
  // 探针结果
  result: {
    success: true,
    message: "Token refreshed",
    status: 200,
  },
  // 环境变量更新（可选）
  // 注意：只能更新已存在的环境变量，不能创建新的
  env: {
    ACCESS_TOKEN: newToken,
    TOKEN_EXPIRES_AT: expiresAt.toString(),
  },
};
```

#### Token 自动刷新示例

```javascript
// 检查 Token 是否即将过期
const expiresAt = parseInt(env.TOKEN_EXPIRES_AT || "0");
const now = Date.now();
const needRefresh = expiresAt - now < 5 * 60 * 1000; // 5分钟内过期

if (needRefresh) {
  // 刷新 Token
  const response = await http.post(`${env.AUTH_URL}/refresh`, {
    refresh_token: env.REFRESH_TOKEN,
  });

  if (response.status === 200) {
    return {
      result: {
        success: true,
        message: "Token refreshed successfully",
      },
      env: {
        ACCESS_TOKEN: response.data.access_token,
        TOKEN_EXPIRES_AT: (now + response.data.expires_in * 1000).toString(),
      },
    };
  }
}

// Token 有效，正常检查
const healthResponse = await http.get(`${env.API_URL}/health`, {
  headers: { Authorization: `Bearer ${env.ACCESS_TOKEN}` },
});

return {
  result: {
    success: healthResponse.status === 200,
    message: `Health check: ${healthResponse.status}`,
  },
};
```

#### 注意事项

- **只能更新已存在的环境变量**，不存在的 key 会被跳过
- **值必须是字符串**，非字符串会被忽略
- **单个值最大长度 10,000 字符**，超出会报错
