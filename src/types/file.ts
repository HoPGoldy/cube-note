export interface FileStorage {
    md5: string
    filename: string
    username: string
    size: number
    type: string
}

export interface UploadedFile {
    filename: string
    type: string
    tempPath: string
    size: number
    md5?: string
}