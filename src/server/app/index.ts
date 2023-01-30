import Koa from 'koa'
import path from 'path'
import { createApiRouter } from './apiRouter'
import historyApiFallback from 'koa2-connect-history-api-fallback'
import logger from 'koa-logger'
import bodyParser from 'koa-body'
import serve from 'koa-static'
import { getAppConfig } from '../lib/appConfig'

interface Props {
  serverPort: number
}

export const runApp = async (props: Props) => {
    const { serverPort } = props
    const app = new Koa()

    const apiRouter = createApiRouter()

    getAppConfig()

    app.use(logger())
        .use(bodyParser({ multipart: true }))
        .use(historyApiFallback({ whiteList: ['/api'] }))
        .use(serve(path.resolve('./dist/client')))
        .use(apiRouter.routes())
        .use(apiRouter.allowedMethods())
        .listen(serverPort, () => {
            console.log(`server is running at http://localhost:${serverPort}/`)
        })
}