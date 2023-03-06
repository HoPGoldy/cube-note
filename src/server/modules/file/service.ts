import { DatabaseAccessor } from '@/server/lib/sqlite'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { FileStorage, UploadedFile } from '@/types/file'
import { ensureDir, move } from 'fs-extra'
import { sqlInsertMany, sqlSelect } from '@/utils/sqlite'

interface Props {
    saveDir: string
    db: DatabaseAccessor
}

const getFileMd5 = async (filePath: string, fileName: string) => {
    return new Promise<string>((resolve, reject) => {
        const stream = fs.createReadStream(filePath)
        const hash = crypto.createHash('md5')
        hash.update(fileName)

        stream.on('data', chunk => hash.update(chunk as string, 'utf8'))
        stream.on('end', () => resolve(hash.digest('hex')))
        stream.on('error', reject)
    })
}

export const createService = (props: Props) => {
    const { saveDir } = props
    const { dbRun, dbGet, dbAll } = props.db

    const readFile = async (hash: string, createUserId: number) => {
        const fileInfo = await dbGet<FileStorage>(sqlSelect('files', { md5: hash, createUserId }))
        if (!fileInfo) return

        const filePath = path.resolve(saveDir, 'file', fileInfo.createUserId.toString(), fileInfo.filename)
        return { filePath, fileInfo }
    }

    const isFileExist = async (fileMd5s: string[]) => {
        const md5s = fileMd5s.map(item => `'${item}'`).join(',')
        const files = await dbAll<FileStorage>(sqlSelect('files', `md5 IN (${md5s})`))

        return files.reduce((existMap, f) => {
            existMap[f.md5] = f
            return existMap
        }, {} as Record<string, FileStorage>)
    }

    const uploadFile = async (files: UploadedFile[], userId: number) => {
        const filesWithMd5 = await Promise.all(files.map(async f => ({
            ...f,
            md5: await getFileMd5(f.tempPath, f.filename)
        })))

        const fileSavePath = path.resolve(saveDir, 'file', userId.toString())
        await ensureDir(fileSavePath)
        const existFiles = await isFileExist(filesWithMd5.map(f => f.md5))

        await Promise.all(filesWithMd5.map(async f => {
            if (existFiles[f.md5]) {
                console.log('文件已存在，跳过', f.filename, f.md5)
                return
            }
            const newFilePath = path.resolve(fileSavePath, f.filename)

            try {
                await move(f.tempPath, newFilePath)
            }
            catch (e) {
                // 如果是因为文件已存在，就不用管
                if (!e.message.includes('dest already exists')) throw e
            }
        }))

        const fileInfos = filesWithMd5.map(file => ({
            md5: file.md5,
            filename: file.filename,
            type: file.type,
            size: file.size,
            userId,
        }))
        const newFiles = fileInfos.filter(f => !existFiles[f.md5])

        if (newFiles.length > 0) {
            await dbRun(sqlInsertMany('files', newFiles))
        }

        return fileInfos
    }

    return { readFile, uploadFile }
}

export type FileService = ReturnType<typeof createService>