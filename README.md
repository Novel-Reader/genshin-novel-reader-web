# 原神背景小说阅读器 Genshin Novel Reader

## 项目声明与许可证

本项目是粉丝制作项目，与米哈游及《原神》官方无关，也未获其认可或赞助。本项目没有商业推广的需求。仓库中的 MIT License 仅适用于作者有权授权的项目原创代码和文档，不涵盖米哈游或第三方拥有的商标、素材、代码及其他内容；这些内容仍受各自权利和许可约束。MIT License 允许他人在遵守许可证条件的前提下商业使用受其覆盖的内容；本项目没有商业推广需求的说明，不会限制该许可证授予的权利。详见仓库根目录的 `LICENSE` 文件。

## 案例 Demo

[在线案例](https://michael18811380328.github.io/novel-demo/index.html)

[Live Demo](https://michael18811380328.github.io/novel-demo/index.html)

一个使用 React 和 Express 框架，结合 MySQL 数据库构建的图书阅读+查询系统。

实现本地小说阅读上传、在线小说阅读下载和管理流程，支持用户自定义阅读器的外观和功能。

A book reading and query system built using React and Express framework combined with MySQL database.

Realize the local novel reading, local novel upload, online novel reading, novel download and management process, and support users to customize the appearance and function of the reader.

![](./screenshots/0.7-06.png)

![](./screenshots/0.7-05.png)

## 文档 Docs

[文档网站](https://novel-reader.github.io/)

[v 1.0](https://novel-reader.github.io/v1/00-introduction/)

[v latest](https://novel-reader.github.io/latest/00-introduction/)

## 开发和使用 Development and use

安装依赖 Install dependencies:

```bash
npm install
```

启动客户端 Run the frontend:

```bash
npm run dev
```

运行单元测试 Run tests:

```bash
npm run test
```

在项目中使用

```js
import AppContainer from 'genshin-novel-reader';

const mode = "online"

const server = "127.0.0.1:8081"

<AppContainer mode={mode} server={server}>
```

## 说明 More

原神小说阅读器的每个组件在 Github 上有独立的源代码库。

- 小说阅读器（javascript版本）：https://github.com/Novel-Reader/Genshin-novel-reader
- 小说服务器：https://github.com/Novel-Reader/Genshin-novel-reader-express-server
- 小说阅读器（typescript 版）：https://github.com/Novel-Reader/novel-reader-ts
- 文档源代码：https://github.com/Novel-Reader/Genshin-novel-reader-doc
- 文档编译后代码：https://github.com/Novel-Reader/Novel-Reader.github.io

1.0 版本之前，服务器代码和阅读器代码都保存在一个存储库中，即 https://github.com/Novel-Reader/Genshin-novel-reader

1.0 之后，实现了前后端代码分离：

前端代码 https://github.com/Novel-Reader/Genshin-novel-reader

后端代码 https://github.com/Novel-Reader/Genshin-novel-reader-express-server

同时支持了前端 typescript 版本 https://github.com/Novel-Reader/novel-reader-ts
