# EdgeOne Pages 部署指南

本项目已适配腾讯云EdgeOne Pages部署，包含静态网站和边缘函数。

## 项目结构

```
├── functions/           # EdgeOne Pages Functions
│   └── zz/
│       ├── weather.js   # 天气查询API
│       └── dict/
│           └── [word].js # 词典查询API (动态路由)
├── out/                # Next.js 静态导出文件 (构建后生成)
├── src/                # Next.js 源码
└── public/             # 静态资源
```

## 部署步骤

### 1. 安装 EdgeOne CLI

```bash
npm install -g edgeone
```

### 2. 构建静态网站

```bash
pnpm build
```

这将生成静态文件到 `out/` 目录。

### 3. 初始化 EdgeOne 项目

```bash
edgeone pages init
```

### 4. 关联项目

```bash
edgeone pages link
```

输入您的EdgeOne项目名称。

### 5. 本地开发调试

```bash
edgeone pages dev
```

这将启动本地代理服务器，可以测试Functions功能。

### 6. 部署

将代码推送到Git仓库，EdgeOne会自动构建和部署。

## API 端点

部署后，API将通过以下路径访问：

- `GET /zz/weather?format=json|img` - 天气查询
- `GET /zz/dict/{word}?format=json|img` - 词典查询

## EdgeOne Functions 特性

- **边缘计算**: 在全球3200+边缘节点运行
- **超低延迟**: 就近处理用户请求
- **自动缩放**: 根据请求量自动扩容
- **地理位置**: 自动获取用户地理位置信息

## 注意事项

1. EdgeOne Functions 使用标准的 Web API，不支持 Node.js 特定模块
2. 所有依赖必须通过 fetch API 或内置的 Web APIs 实现
3. Functions 运行在 V8 JavaScript 引擎上，支持 ES6+ 语法
4. 静态文件和Functions可以在同一个项目中部署
