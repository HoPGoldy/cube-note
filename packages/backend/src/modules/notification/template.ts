/**
 * 通知模板变量上下文
 */
export interface TemplateContext {
  eventType: "FAILURE" | "RECOVERY";
  endpoint: {
    id: string;
    name: string;
    url: string | null;
  };
  service: {
    id: string;
    name: string;
    url: string | null;
  };
  details: {
    status: number | null;
    responseTime: number | null;
    message: string | null;
    consecutiveFailures: number;
  };
  timestamp: string;
}

/**
 * 渲染模板，将 {{变量}} 替换为实际值
 * 支持嵌套变量如 {{endpoint.name}}
 */
export function renderTemplate(
  template: string,
  context: TemplateContext,
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const trimmedPath = path.trim();
    const value = getNestedValue(context, trimmedPath);

    // 如果值是 null 或 undefined，返回空字符串
    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  });
}

/**
 * 获取嵌套对象的值
 * 例如 getNestedValue({ endpoint: { name: 'test' } }, 'endpoint.name') => 'test'
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * 钉钉 Markdown 消息模板
 */
export const DINGTALK_TEMPLATE = JSON.stringify(
  {
    msgtype: "markdown",
    markdown: {
      title: "{{eventType}} - {{endpoint.name}}",
      text: "### {{eventType}}\n- **服务**: {{service.name}}\n- **端点**: {{endpoint.name}}\n- **URL**: {{endpoint.url}}\n- **状态码**: {{details.status}}\n- **响应时间**: {{details.responseTime}}ms\n- **消息**: {{details.message}}\n- **时间**: {{timestamp}}",
    },
  },
  null,
  2,
);

/**
 * 飞书文本消息模板
 */
export const FEISHU_TEMPLATE = JSON.stringify(
  {
    msg_type: "text",
    content: {
      text: "[{{eventType}}] {{service.name}} - {{endpoint.name}}\n{{details.message}}\n时间: {{timestamp}}",
    },
  },
  null,
  2,
);

/**
 * 企业微信 Markdown 消息模板
 */
export const WECOM_TEMPLATE = JSON.stringify(
  {
    msgtype: "markdown",
    markdown: {
      content:
        "### {{eventType}}\n> **服务**: {{service.name}}\n> **端点**: {{endpoint.name}}\n> **消息**: {{details.message}}\n> **时间**: {{timestamp}}",
    },
  },
  null,
  2,
);

/**
 * 通用 Webhook JSON 模板
 */
export const GENERIC_WEBHOOK_TEMPLATE = JSON.stringify(
  {
    event: "{{eventType}}",
    service: "{{service.name}}",
    endpoint: "{{endpoint.name}}",
    url: "{{endpoint.url}}",
    status: "{{details.status}}",
    responseTime: "{{details.responseTime}}",
    message: "{{details.message}}",
    consecutiveFailures: "{{details.consecutiveFailures}}",
    timestamp: "{{timestamp}}",
  },
  null,
  2,
);
