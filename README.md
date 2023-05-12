## cube-note

一个简单扁平的桌面 / 移动端记事本。基于 react / koa2 / typescript / antd。

## 特性

- 🚫 无广告、无收费、完全开源，自己的数据自己掌握
- 📝 支持 MarkDown 语法，支持实时预览、自动保存
- 🔗 支持笔记内图片、文件上传
- 📱 桌面端 / 移动端全站响应式设计
- 🎯 支持关键字、标签搜索
- 🧩 支持笔记嵌套、管理、收藏、颜色标记
- 🤖 支持多用户使用
- 🌙 黑夜模式

## 部署

*请确保已安装了 node 16+*

```bash
# 安装项目
npm install -g cube-note
# 启动项目
cube-note run
```

服务将默认开启在端口 3700 上，可以通过 `cube-note run --port=3701` 修改端口。

*使用 `-h` 参数查看更多配置*

## 数据迁移

所有数据均默认保存在应用目录下的 `.storage` 文件夹里，所以直接将其打包然后复制到其他地方即可。

## 贡献

本项目系本人自用开发，如果你觉得有些功能不够完善，欢迎 PR / issue。

## 许可

本项目源码基于 GPL v3 许可开源，[点此](https://github.com/HoPGoldy/cube-note/blob/master/LICENSE) 查看更多信息。