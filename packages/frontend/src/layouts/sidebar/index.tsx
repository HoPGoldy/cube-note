import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import s from "./styles.module.css";
import { Button, Flex } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useHostDetailAction } from "@/pages/host-detail/use-detail-action";
import { useHostStatus } from "@/utils/use-host-status";

interface MenuItem {
  path: string;
  name: string;
  hostId?: string;
}

export const Sidebar: FC = () => {
  const location = useLocation();
  const { hosts, getHostDisplayStatus, statusColorMap } = useHostStatus();

  const hostDetailActions = useHostDetailAction();

  // 先添加监控服务列表
  const menuItems: MenuItem[] = hosts.map((host: any) => ({
    path: `/host-home/${host.id}`,
    name: host.name,
    hostId: host.id,
  }));

  const renderMenuItem = (item: MenuItem) => {
    const className = [s.menuItem];
    if (item.path === location.pathname) className.push(s.menuItemActive);

    const displayStatus = item.hostId
      ? getHostDisplayStatus(item.hostId)
      : null;

    return (
      <Link to={item.path} key={item.path}>
        <div className={className.join(" ")} title={item.name}>
          <span className="truncate">{item.name}</span>
          {displayStatus && (
            <span
              className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${statusColorMap[displayStatus]}`}
            />
          )}
        </div>
      </Link>
    );
  };

  return (
    <section className={s.sideberBox}>
      <div className="flex flex-row flex-nowrap items-center justify-center">
        <div className="font-black text-lg">Cube Probe</div>
      </div>

      <div className="flex-grow flex-shrink overflow-y-auto noscrollbar overflow-x-hidden my-3">
        {menuItems.map(renderMenuItem)}
      </div>

      <Flex vertical gap={8}>
        <Button
          className={`${s.toolBtn} keep-antd-style`}
          icon={<PlusOutlined />}
          block
          onClick={hostDetailActions.onAdd}
        >
          创建监控服务
        </Button>
        <Link to="/home">
          <Button className={`${s.toolBtn} keep-antd-style`} block>
            主面板
          </Button>
        </Link>
      </Flex>
    </section>
  );
};
