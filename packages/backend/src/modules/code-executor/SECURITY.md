# 代码执行器安全机制说明

## vm2 的安全保护原理

### 1. 隔离的 V8 上下文

vm2 创建了一个完全独立的 JavaScript 执行环境，与宿主 Node.js 进程隔离：

```javascript
const vm = new VM({
  timeout: 5000,
  sandbox: {
    /* 沙箱对象 */
  },
  eval: false, // 禁用 eval
  wasm: false, // 禁用 WebAssembly
});
```

### 2. Proxy 包装机制

**vm2 如何保证 sandbox 传入的属性是安全的？**

vm2 使用 JavaScript 的 `Proxy` 对象包装所有传入 sandbox 的对象：

```javascript
// 简化的原理示例
function wrapObject(obj) {
  return new Proxy(obj, {
    get(target, prop) {
      // 拦截所有属性访问
      if (prop === "constructor") {
        // 阻止访问构造函数
        throw new Error("Access denied");
      }
      return target[prop];
    },
  });
}
```

#### 关键保护点：

1. **阻止原型链访问**

   ```javascript
   // 被阻止
   http.get.__proto__.constructor.constructor("return process")();
   ```

2. **阻止构造函数逃逸**

   ```javascript
   // 被阻止
   http.get.constructor.constructor("return process")();
   ```

3. **限制反射 API**
   ```javascript
   // Reflect 可用但不能逃逸沙箱
   Reflect.get(http.get, "constructor"); // 返回被包装的函数
   ```

### 3. 我们的额外安全措施

#### (1) 最小化暴露面

**只返回必要的数据，不暴露完整的 axios response：**

```typescript
// ❌ 不安全：暴露整个 axios response
return axios.get(url);

// ✅ 安全：只返回必要字段
const response = await axios.get(url);
return {
  data: response.data,
  status: response.status,
  statusText: response.statusText,
  headers: response.headers,
};
```

**为什么这样做？**

- axios response 对象包含 `config`、`request` 等内部对象
- 这些内部对象可能包含对 Node.js 底层对象的引用
- 限制返回字段减少潜在的攻击面

#### (2) 使用闭包隔离

```typescript
private createHttpFunction() {
  const makeRequest = async (...) => {
    // 使用闭包，避免暴露 this
    this.validateUrl(url);
    // ...
  };

  return {
    get: async (url, config) => makeRequest("GET", url, undefined, config),
    // ...
  };
}
```

#### (3) 域名白名单

```typescript
allowedDomains: [
  "api.example.com", // 精确匹配
  "*.trusted.com", // 通配符匹配
];
```

## 已验证的安全测试

### ✅ 沙箱逃逸防护

1. **构造函数逃逸** - 被阻止 ✅

   ```javascript
   http.get.constructor.constructor("return process")();
   ```

2. **原型链攻击** - 被阻止 ✅

   ```javascript
   http.get.__proto__.constructor.constructor("return this")();
   ```

3. **Context 对象逃逸** - 被阻止 ✅

   ```javascript
   data.constructor.constructor("return process")();
   ```

4. **axios 内部对象访问** - 被隔离 ✅
   - 只能访问 `data`, `status`, `statusText`, `headers`
   - 无法访问 `config`, `request` 等内部对象

### ✅ 代码注入防护

1. **eval 执行** - 被阻止 ✅

   ```javascript
   eval("malicious code");
   ```

2. **Function 构造器** - 被阻止 ✅
   ```javascript
   new Function("return process")();
   ```

### ✅ 资源限制

1. **超时控制**
   - 默认 5 秒，最大 30 秒
   - 无限循环会被终止

2. **递归深度**
   - Stack overflow 自动捕获

## 已知限制

### vm2 的局限性

1. **不防护 CPU 密集型计算**
   - 虽然有超时，但 CPU 会被占用直到超时
   - 建议在生产环境中使用独立进程

2. **内存限制依赖 V8**
   - vm2 本身不限制内存
   - 需要依赖 Node.js 的内存限制

3. **同步执行的限制**
   - 超时只能在执行时检测
   - 无法在执行前预测资源消耗

### 生产环境建议

1. **使用独立进程**

   ```typescript
   // 使用 worker_threads 或 child_process
   // 隔离执行，防止影响主进程
   ```

2. **添加监控**
   - 监控执行时间
   - 监控内存使用
   - 设置执行频率限制

3. **审计日志**
   - 记录所有执行的代码
   - 记录 HTTP 请求目标
   - 监控异常模式

## 安全配置示例

### 开发环境（宽松）

```typescript
new CodeExecutorService({
  enableHttp: true,
  httpTimeout: 30000,
  // 不限制域名
});
```

### 生产环境（严格）

```typescript
new CodeExecutorService({
  enableHttp: true,
  httpTimeout: 10000,
  allowedDomains: ["api.yourcompany.com", "*.trusted-partner.com"],
});
```

### 高安全环境（禁用 HTTP）

```typescript
new CodeExecutorService({
  enableHttp: false, // 完全禁用 HTTP
});
```

## 参考资料

- [vm2 GitHub](https://github.com/patriksimek/vm2)
- [vm2 安全警告](https://github.com/patriksimek/vm2#security)
- [Node.js VM 模块](https://nodejs.org/api/vm.html)
- [JavaScript Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

## 安全披露

如果发现安全漏洞，请负责任地披露：

1. 不要在公开场合讨论漏洞细节
2. 联系项目维护者
3. 等待修复后再公开
