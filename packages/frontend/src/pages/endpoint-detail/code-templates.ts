// 代码示例模板
export const codeTemplates = [
  {
    name: "简单 GET 请求",
    description: "发送简单的 GET 请求并检查状态码",
    code: `// 简单 GET 请求示例
(async () => {
  const response = await http.get("https://api.example.com/health");

  return {
    result: {
      success: response.status === 200,
      message: \`状态码: \${response.status}\`,
      status: response.status,
    },
  };
})();`,
  },
  {
    name: "带认证的请求",
    description: "使用环境变量中的 Token 发送请求",
    code: `// 带认证的请求示例
(async () => {
  const response = await http.get("https://api.example.com/protected", {
    headers: {
      Authorization: \`Bearer \${env.API_TOKEN}\`,
    },
  });

  return {
    result: {
      success: response.status === 200,
      message: response.data?.message || "请求成功",
      status: response.status,
    },
  };
})();`,
  },
  {
    name: "POST 请求",
    description: "发送 POST 请求并检查响应",
    code: `// POST 请求示例
(async () => {
  const response = await http.post("https://api.example.com/data", {
    key: "value",
    timestamp: Date.now(),
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    result: {
      success: response.status === 200 || response.status === 201,
      message: \`创建成功，ID: \${response.data?.id}\`,
      status: response.status,
    },
  };
})();`,
  },
  {
    name: "响应内容检查",
    description: "检查响应内容是否包含特定数据",
    code: `// 响应内容检查示例
(async () => {
  const response = await http.get("https://api.example.com/status");

  const isHealthy = response.data?.status === "healthy";
  const version = response.data?.version || "unknown";

  return {
    result: {
      success: isHealthy,
      message: isHealthy 
        ? \`服务正常，版本: \${version}\` 
        : \`服务异常: \${response.data?.error || "未知错误"}\`,
      status: response.status,
    },
  };
})();`,
  },
  {
    name: "Token 自动刷新",
    description: "检测 Token 过期并自动刷新",
    code: `// Token 自动刷新示例
(async () => {
  // 先尝试用当前 token 请求
  let response = await http.get("https://api.example.com/user", {
    headers: { Authorization: \`Bearer \${env.ACCESS_TOKEN}\` },
  });

  // 如果 401 则刷新 token
  if (response.status === 401) {
    const refreshResp = await http.post("https://api.example.com/refresh", {
      refresh_token: env.REFRESH_TOKEN,
    });
    
    if (refreshResp.status === 200) {
      const newToken = refreshResp.data.access_token;
      
      // 用新 token 重试
      response = await http.get("https://api.example.com/user", {
        headers: { Authorization: \`Bearer \${newToken}\` },
      });
      
      return {
        result: {
          success: response.status === 200,
          message: "Token 已刷新",
          status: response.status,
        },
        env: { ACCESS_TOKEN: newToken }, // 更新环境变量
      };
    }
  }

  return {
    result: {
      success: response.status === 200,
      message: response.data?.username || "请求成功",
      status: response.status,
    },
  };
})();`,
  },
];
