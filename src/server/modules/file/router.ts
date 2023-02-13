import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response, validate } from '@/server/utils'
import { FileService } from './service'
import Joi from 'joi'
import fs from 'fs'

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
    router.get('/uploaded/count', async ctx => {
        const query = validate(ctx, queryCountSchema)
        if (!query) return

        const data = await service.getUploadedCount(query.hash)
        response(ctx, { code: 200, data })
    })

    const uploadSchema = Joi.object<{ fileName: string }>({
        fileName: Joi.string().required(),
    })

    router.post('/upload', async (ctx, next) => {
        const body = validate(ctx, uploadSchema)
        if (!body) return

        const file = ctx.request.files?.chunk // 获取上传文件
        if (!file || Array.isArray(file)) {
            response(ctx, { code: 400, msg: '文件规格不符' })
            return
        }
        console.log('🚀 ~ file: router.ts:40 ~ router.post ~ file', file)
        response(ctx, { code: 200, data: { hash: '123', index: 1 } })

        // const {
        //   filename,
        // } = ctx.request.body;
        // const reader = fs.createReadStream(file.path);
        // const [hash, suffix] = filename.split('_');
        // const folder = uploadDir + hash;
        // !fs.existsSync(folder) && fs.mkdirSync(folder);
        // const filePath =  `${folder}/${filename}`;
        // const upStream = fs.createWriteStream(filePath);
        // reader.pipe(upStream);
        // ctx.body = await new Promise((resolve, reject) => {
        //   reader.on('error', () => {
        //     reject({
        //       code: 0,
        //       massage: '上传失败',
        //     })
        //   })
        //   reader.on('close', () => {    
        //     resolve({
        //       code: 1,
        //       massage: '上传成功',
        //       data: {
        //         hash,
        //         index: Number(suffix.split('.')[0])
        //       }
        //     })
        //   })
        // })
        
    })

    return router
}