export interface FileStorage {
    md5: string
    filename: string
    type: string
}

export interface UploadedFile {
    filename: string
    type: string
    tempPath: string
    md5?: string
}