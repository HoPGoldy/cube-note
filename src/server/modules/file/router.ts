import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { FileService } from './service'
import { UploadedFile } from '@/types/file'
import { getJwtPayload } from '@/server/lib/auth'
import { readFile } from 'fs-extra'

interface Props {
    service: FileService
}

export const createRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/file' })

    router.get('/content/:hashName', async ctx => {
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const { hashName } = ctx.params
        // 这个链接里可能会有后缀名，所以需要去掉
        const [hash] = hashName.split('.')
        const data = await service.readFile(hash, payload.userId)
        if (!data) {
            ctx.status = 404
            return
        }

        const { filename, type, size } = data.fileInfo
        ctx.set('Content-disposition', `attachment; filename=${encodeURIComponent(filename)}`)
        ctx.set('Content-Type', type)
        ctx.set('Content-Length', size.toString())
        ctx.body = await readFile(data.filePath)
    })

    router.post('/upload', async ctx => {
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const originFiles = ctx.request.files?.file || []
        const files = Array.isArray(originFiles) ? Array.from(originFiles) : [originFiles]

        const uploadedFiles: UploadedFile[] = files.map(f => ({
            filename: f.originalFilename || f.newFilename,
            type: f.mimetype || 'unknown',
            tempPath: f.filepath,
            size: f.size,
        }))

        const data = await service.uploadFile(uploadedFiles, payload.userId)
        response(ctx, { code: 200, data })
    })

    return router
}