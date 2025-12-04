import React, { useState } from "react";
import { logout, stateUserJwtData } from "@/store/user";
import {
  SmileOutlined,
  SettingOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { useGetNotificationStatusList } from "@/services/notification";

export interface SettingLinkItem {
  label: string;
  icon: React.ReactNode;
  onClick?: () => unknown;
}

export const useSettingMenu = () => {
  const userInfo = useAtomValue(stateUserJwtData);
  const navigate = useNavigate();
  /** 是否展示关于弹窗 */
  const [aboutVisible, setAboutVisible] = useState(false);

  const { data: statusData } = useGetNotificationStatusList();
  console.log("statusData", statusData);
  const statusList = (statusData?.data as any[]) ?? [];
  /** 启用的服务数量 */
  const enabledCount = statusList.filter((s) => s.hostEnabled).length;
  /** 正常运行的服务数量 */
  const upCount = statusList.filter(
    (s) => s.hostEnabled && s.currentStatus === "UP",
  ).length;

  const settingConfig = [
    {
      label: "环境变量管理",
      icon: <SettingOutlined />,
      onClick: () => {
        navigate("/probe-env");
      },
    },
    {
      label: "通知管理",
      icon: <BellOutlined />,
      onClick: () => {
        navigate("/notification-channel");
      },
    },
    {
      label: "关于",
      icon: <SmileOutlined />,
      onClick: () => setAboutVisible(true),
    },
  ].filter(Boolean) as SettingLinkItem[];

  const onLogout = () => {
    logout();
  };

  const userName = userInfo?.username || "---";

  return {
    userName,
    onLogout,
    aboutVisible,
    setAboutVisible,
    settingConfig,
    enabledCount,
    upCount,
  };
};
