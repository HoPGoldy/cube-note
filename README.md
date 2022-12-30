## cube-note

一个简单扁平的桌面 / 移动端记事本。基于 react / koa2 / typescript / vant。

## 部署

*请确保已安装了 node 16+*

```bash
# 安装依赖
yarn install
# 打包项目
yarn build
# 启动项目
yarn start
```

服务将默认开启在端口 3700 上，可以通过 `yarn start --port=3701` 修改端口。

## 数据迁移

所有数据均保存在应用目录下的 `.storage` 文件夹里，所以直接将其打包然后复制到其他地方即可。

## 贡献

本项目系本人自用开发，如果你觉得有些功能不够完善，欢迎 PR / issue。

## 许可

本项目源码基于 GPL v3 许可开源，[点此](https://github.com/HoPGoldy/cube-note/blob/master/LICENSE) 查看更多信息。