import { DatabaseAccessor } from '@/server/lib/mongodb'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { FileStorage, UploadedFile } from '@/types/file'
import { ensureDir, move } from 'fs-extra'
import { WithId } from 'mongodb'

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
    const { getFileCollection } = props.db

    // const getUploadedCount = async (fileHash: string) => {
    //     const filePath = path.resolve(uploadTempDir, fileHash)
    //     const fileList = (fs.existsSync(filePath) && fs.readdirSync(filePath)) || []

    //     return fileList.length
    // }

    const isFileExist = async (fileMd5s: string[]) => {
        const collection = await getFileCollection()
        const files = await collection.find({ md5: { $in: fileMd5s } }).toArray()

        return files.reduce((existMap, f) => {
            existMap[f.md5] = f
            return existMap
        }, {} as Record<string, WithId<FileStorage>>)
    }

    const uploadFile = async (files: UploadedFile[]) => {
        const filesWithMd5 = await Promise.all(files.map(async f => ({
            ...f,
            md5: await getFileMd5(f.tempPath, f.filename)
        })))

        const fileSavePath = path.resolve(saveDir, 'file')
        await ensureDir(fileSavePath)
        const existFiles = await isFileExist(filesWithMd5.map(f => f.md5))

        await Promise.all(filesWithMd5.map(async f => {
            if (existFiles[f.md5]) {
                console.log('文件已存在，跳过', f.filename, f.md5)
                return
            }
            const newFilePath = path.resolve(fileSavePath, f.md5)

            try {
                await move(f.tempPath, newFilePath)
            }
            catch (e) {
                // 如果是因为文件已存在，就不用管
                if (!e.message.includes('dest already exists')) throw e
            }
        }))

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fileWithoutTempPath = filesWithMd5.map(({ tempPath, ...file }) => file)
        const newFiles = fileWithoutTempPath.filter(f => !existFiles[f.md5])

        if (newFiles.length > 0) {
            const fileCollection = await getFileCollection()
            await fileCollection.insertMany(newFiles)
        }

        return fileWithoutTempPath
    }

    return { uploadFile }
}

export type FileService = ReturnType<typeof createService>