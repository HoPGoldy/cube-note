import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response, validate } from '@/server/utils'
import { FileService } from './service'
import Joi from 'joi'
import fs from 'fs'
import { UploadedFile } from '@/types/file'

interface Props {
    service: FileService
}

export const createRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/file' })

    const queryCountSchema = Joi.object<{ hash: string }>({
        hash: Joi.string().required(),
    })

    /**
     * 查询当前文章上传到哪个分片了
     */
    // router.get('/uploaded/count', async ctx => {
    //     const query = validate(ctx, queryCountSchema)
    //     if (!query) return

    //     const data = await service.getUploadedCount(query.hash)
    //     response(ctx, { code: 200, data })
    // })

    router.post('/upload', async ctx => {
        const originFiles = ctx.request.files?.file || []
        const files = Array.isArray(originFiles) ? Array.from(originFiles) : [originFiles]

        const uploadedFiles: UploadedFile[] = files.map(f => ({
            filename: f.originalFilename || f.newFilename,
            type: f.mimetype || 'unknown',
            tempPath: f.filepath
        }))

        const data = await service.uploadFile(uploadedFiles)
        response(ctx, { code: 200, data })
    })

    return router
}