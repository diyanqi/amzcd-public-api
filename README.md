# Amzcd公益API

一个基于Next.js构建的免费、开源的公益API服务，提供天气查询和词典查询功能。

## 🚀 特性

- **天气查询API**: 基于用户IP自动获取当地天气信息
- **词典查询API**: 英文单词释义查询
- **双格式输出**: 支持JSON和图片格式返回
- **响应式设计**: 支持桌面和移动设备
- **免费开源**: 完全免费使用，无需API密钥

## 📱 在线访问

- 主页: `http://localhost:3000`
- API文档: `http://localhost:3000/docs`

## 🔧 本地开发

### 环境要求

- Node.js 18+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

## 📦 构建部署

```bash
pnpm build
pnpm start
```

或者使用其他平台如Vercel、Netlify等进行部署。

## 🛠️ API 接口

### 天气查询

```
GET /zz/weather?format=json|img
```

- **format**: 返回格式，默认为 `img`（SVG图片）
- 图片尺寸：700px宽，高度自适应

### 词典查询

```
GET /zz/dict/{word}?format=json|img
```

- **word**: 要查询的英文单词
- **format**: 返回格式，默认为 `img`（SVG图片）
- 图片尺寸：700px宽，高度自适应

## 🎨 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **路由**: Next.js Pages Router
- **图片生成**: SVG
- **HTTP客户端**: axios
- **包管理**: pnpm

## 📄 项目结构

```
src/
├── pages/
│   ├── _app.tsx          # App组件
│   ├── index.tsx         # 首页
│   ├── docs.tsx          # API文档页面
│   ├── 404.tsx           # 404页面
│   └── api/              # API路由
│       └── zz/
│           ├── weather.ts        # 天气API
│           └── dict/
│               └── [word].ts     # 词典API
└── styles/
    └── globals.css       # 全局样式
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 许可证

MIT License

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Canvas API 文档](https://github.com/Automattic/node-canvas)

---

**免责声明**: 此项目仅供学习和研究使用。天气和词典数据为模拟数据，实际使用时请替换为真实的数据源。
