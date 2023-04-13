import Koa from 'koa'
import path from 'path'
import { createApiRouter } from './apiRouter'
import historyApiFallback from 'koa2-connect-history-api-fallback'
import logger from 'koa-logger'
import bodyParser from 'koa-body'
import serve from 'koa-static'
import { getStoragePath, setBaseStoragePath, setConfigPath } from '../lib/fileAccessor'
import { ensureDir } from 'fs-extra'

interface Props {
  servePort: number
  storagePath: string
  configPath: string
  fontentPath: string
}

export const runApp = async (props: Props) => {
    const { servePort } = props
    setConfigPath(props.configPath)
    setBaseStoragePath(props.storagePath)
    await ensureDir(getStoragePath())

    const app = new Koa()
    const apiRouter = createApiRouter()

    console.log(path.resolve('../../dist/client'))
    console.log(path.resolve(__dirname, '../../dist/client'))

    app.use(logger())
        .use(bodyParser({ multipart: true }))
        .use(historyApiFallback({ whiteList: ['/api'] }))
        .use(serve(props.fontentPath))
        .use(apiRouter.routes())
        .use(apiRouter.allowedMethods())
        .listen(servePort, () => {
            console.log(`server is running at http://localhost:${servePort}/`)
        })
}