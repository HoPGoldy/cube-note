import { ComponentType, lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Loading from "./layouts/loading";
import { LoginAuth } from "./layouts/login-auth";
import { AppContainer } from "./layouts/app-container";
import { Error403 } from "./pages/e403";
import Login from "./pages/login";
import { HostDetailModal } from "./pages/host-detail";
import { EndpointDetailModal } from "./pages/endpoint-detail";
import { NotificationChannelDetailModal } from "./pages/notification-channel-detail";

const lazyLoad = (
  compLoader: () => Promise<{ default: ComponentType<any> }>,
) => {
  const Comp = lazy(compLoader);
  return (
    <Suspense fallback={<Loading />}>
      <Comp />
    </Suspense>
  );
};

export const routes = createBrowserRouter(
  [
    {
      path: "/",
      children: [
        { index: true, element: <Navigate to="/home" /> },
        // 首页 - 监控服务列表
        {
          path: "/home",
          element: lazyLoad(() => import("./pages/home")),
        },
        // 监控服务详情
        {
          path: "/host-home/:hostId",
          element: lazyLoad(() => import("./pages/host-home")),
        },
        // 通知渠道管理
        {
          path: "/notification-channel",
          element: lazyLoad(() => import("./pages/notification-channel")),
        },
        // 通知记录
        {
          path: "/notification-log",
          element: lazyLoad(() => import("./pages/notification-log")),
        },
        // 探针环境变量
        {
          path: "/probe-env",
          element: lazyLoad(() => import("./pages/probe-env")),
        },
      ],
      element: (
        <LoginAuth>
          <AppContainer />
          <HostDetailModal />
          <EndpointDetailModal />
          <NotificationChannelDetailModal />
        </LoginAuth>
      ),
    },
    // 登录
    {
      path: "/login",
      element: <Login />,
    },
    { path: "/e403", element: <Error403 /> },
  ],
  {
    basename: APP_CONFIG.PATH_BASENAME,
  },
);
