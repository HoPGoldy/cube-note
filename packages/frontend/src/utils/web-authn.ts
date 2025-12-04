import { WebAuthnError } from "@simplewebauthn/browser";
import { messageError, messageWarning } from "./message";

export const handleWebAuthnBrowserError = (error: WebAuthnError) => {
  if (error.code === "ERROR_CEREMONY_ABORTED") {
    messageWarning("操作已取消");
    return;
  }

  if (
    error.code === "ERROR_INVALID_DOMAIN" ||
    error.code === "ERROR_INVALID_RP_ID"
  ) {
    messageError("网站配置错误，请联系管理员");
    return;
  }

  if (error.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED") {
    messageWarning("该设备已注册过安全密钥，无需重复操作");
    return;
  }

  if (error.code === "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT") {
    messageWarning(
      "您的设备不支持此安全验证方式（如指纹、面容ID），请尝试使用PIN码或更换设备",
    );
    return;
  }

  if (
    error.code === "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT"
  ) {
    messageWarning("您的安全密钥不支持无密码登录，请尝试输入用户名后登录");
    return;
  }

  if (error.code === "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY") {
    const originalError = error.cause as DOMException;

    if (originalError?.name === "NotAllowedError") {
      messageWarning("操作被拒绝或已超时，请重试");
      return;
    }

    if (originalError?.name === "SecurityError") {
      messageWarning("安全策略阻止了此操作，请检查网站配置是否为 HTTPS");
      return;
    }

    if (originalError?.name === "NotSupportedError") {
      messageWarning("您的浏览器或设备不支持此功能");
      return;
    }
  }

  console.error("Unhandled WebAuthn Error:", error);
  messageError(`注册失败：${error.message} (代码:${error.code})`);
};
