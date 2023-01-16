/**
 * 获取指定参数
 */
export const getRunArg = (argName: string) => {
    const fullArg = process.argv.slice(2).find(arg => {
        return arg.startsWith(`--${argName}`) || arg.startsWith(`-${argName}`)
    })
    
    return fullArg?.replace(`--${argName}=`, '').replace(`-${argName}=`, '')
}

/**
 * 获取服务开放端口
 */
export const getServePort = () => {
    const userPort = Number(getRunArg('port'))

    if (userPort) return userPort
    // 开发环境默认端口
    if (process.env.NODE_ENV === 'development') return 3600
    // 生产环境默认端口
    else return 3700
}

/**
 * 打开一个新标签页
 * 因为 window.open 会被浏览器拦截，打开多个标签页的话，老的标签页会被新的替换掉
 * 导致最多只能打开一个新标签页，所以需要用这种方式来打开多个标签页
 */
export const openNewTab = (href: string) => {
    const a = document.createElement('a')
    a.setAttribute('href', href)
    a.setAttribute('target', '_blank')
    a.setAttribute('id', 'startTelMedicine')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}