import Router from 'koa-router';
import { AppKoaContext } from '@/types/global';
import { middlewareJwt, middlewareJwtCatcher } from '../lib/auth';
import { createCheckReplayAttack } from '../lib/replayAttackDefense';
import { AUTH_EXCLUDE, REPLAY_ATTACK_EXCLUDE } from '@/config';
import { errorWapper } from '../utils';
import { buildApp } from './buildApp';
import { createArticleRouter } from '../modules/article/router';
import { createFileRouter } from '../modules/file/router';
import { createGlobalRouter } from '../modules/global/router';
import { createTagRouter } from '../modules/tag/router';
import { createUserRouter } from '../modules/user/router';
import { createUserManageRouter } from '../modules/userManage/router';

/**
 * 构建路由
 *
 * 会根据构建完成的 app 生成可访问的完整应用路由
 */
export const buildRouter = async () => {
  const { banLocker, loginLocker, ...services } = await buildApp();

  const apiRouter = new Router<unknown, AppKoaContext>();
  apiRouter
    .use(loginLocker.checkLoginDisable)
    .use(createCheckReplayAttack({ excludePath: REPLAY_ATTACK_EXCLUDE }))
    .use(middlewareJwtCatcher)
    .use(middlewareJwt.unless({ path: AUTH_EXCLUDE }))
    .use(banLocker.checkBanDisable);

  const globalRouter = createGlobalRouter({ service: services.globalService });
  const userRouter = createUserRouter({ service: services.userService });
  const tagRouter = createTagRouter({ service: services.tagService });
  const articleRouter = createArticleRouter({ service: services.articleService });
  const fileRouter = createFileRouter({ service: services.fileService });
  const userInviteRouter = createUserManageRouter({ service: services.userInviteService });
  const routes = [globalRouter, userRouter, tagRouter, articleRouter, fileRouter, userInviteRouter];

  routes.forEach((route) =>
    apiRouter.use('/api', errorWapper, route.routes(), route.allowedMethods()),
  );

  return apiRouter;
};
