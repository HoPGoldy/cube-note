import Koa from 'koa'
import { createApiRouter } from './apiRouter'
import historyApiFallback from 'koa2-connect-history-api-fallback'
import logger from 'koa-logger'
import bodyParser from 'koa-body'
import { serveStatic } from '@/server/lib/static'

interface Props {
  serverPort: number
}

export const runApp = async (props: Props) => {
    const { serverPort } = props
    const app = new Koa()

    const apiRouter = createApiRouter()

    app.use(logger())
        .use(bodyParser({ multipart: true }))
        .use(serveStatic)
        .use(apiRouter.routes())
        .use(apiRouter.allowedMethods())
        .use(historyApiFallback({ whiteList: ['/api'] }))
        .listen(serverPort, () => {
            console.log(`server is running at http://localhost:${serverPort}/`)
        })
}