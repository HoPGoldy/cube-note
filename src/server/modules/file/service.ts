import { DatabaseAccessor } from '@/server/lib/mongodb'
import { AppConfig, AppConfigResp, UserDataInfoResp } from '@/types/appConfig'
import { ObjectId } from 'mongodb'
import fs from 'fs'
import path from 'path'

interface Props {
    uploadTempDir: string
}

export const createService = (props: Props) => {
    const { uploadTempDir } = props

    const getUploadedCount = async (fileHash: string) => {
        const filePath = path.resolve(uploadTempDir, fileHash)
        const fileList = (fs.existsSync(filePath) && fs.readdirSync(filePath)) || []

        return fileList.length
    }

    return { getUploadedCount }
}

export type FileService = ReturnType<typeof createService>