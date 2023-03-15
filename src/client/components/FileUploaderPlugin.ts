import type { BytemdPlugin } from 'bytemd'
import { uploadFiles } from '@/client/services/base'
import { STATUS_CODE } from '@/config'
import { messageError } from '@/client/utils/message'
import { UploadedFile } from '@/types/file'

const getFileUrl = (file: UploadedFile) => {
    // 后缀名
    const [name, suffix] = file.filename.split('.')
    const isImg = ['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(suffix?.toLocaleLowerCase())
    return `\n${isImg ? '!' : ''}[${file.filename}](/api/file/get?hash=${file.md5}&suffix=${suffix})`
}

const uploadFunc = async (cm: CodeMirror.Editor, files: FileList) => {
    const resp = await uploadFiles(files)
    if (resp.code !== STATUS_CODE.SUCCESS || !resp.data) {
        messageError(resp.msg || '上传失败')
        return
    }

    const insertFileText = resp.data.map(getFileUrl).join('\n')
    console.log('🚀 ~ file: FileUploaderPlugin.ts:22 ~ uploadFunc ~ insertFileText:', insertFileText)
    cm.replaceSelection(insertFileText)
}

const pasteFileCallback = async (cm: CodeMirror.Editor, e: ClipboardEvent) => {
    if (!e.clipboardData?.files) return
    uploadFunc(cm, e.clipboardData?.files)
}

const dropFileCallback = async (cm: CodeMirror.Editor, e: DragEvent) => {
    if (!e.dataTransfer?.files) return
    uploadFunc(cm, e.dataTransfer?.files)
}

export const fileUploader = (): BytemdPlugin => {
    return {
        editorEffect: (ctx) => {
            console.log('🚀 ~ 重载', ctx)
            ctx.editor.off('paste' as any, pasteFileCallback)
            ctx.editor.on('paste' as any, pasteFileCallback)
            ctx.editor.off('drop', dropFileCallback)
            ctx.editor.on('drop', dropFileCallback)
        }
    }
}