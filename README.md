# 美味记录本 - 部署指南

这是一个全栈美食记录应用，支持用户注册、登录，以及创建、编辑、删除自己的美食记录。

## 🚀 部署到 Vercel

### 前置要求

- [x] Node.js 18+
- [x] Git 账号
- [x] Vercel 账号

### 部署步骤

#### 1. 准备代码仓库

将项目推送到 GitHub 仓库：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### 2. 在 Vercel 创建项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. Vercel 会自动检测项目配置

#### 3. 配置环境变量和数据库

在 Vercel 项目设置中添加以下环境变量：

- `JWT_SECRET`: 一个随机字符串（用于 JWT token 签名）
  - 生成方法：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**添加 Vercel Postgres 数据库：**

1. 在 Vercel 项目中，点击 "Storage" 标签
2. 点击 "Create Database"
3. 选择 "Postgres"
4. 创建数据库后，Vercel 会自动添加 `POSTGRES_URL` 环境变量
5. 数据库会自动创建表结构（首次访问时）

**数据库表结构：**

- `users` 表：存储用户信息（id, username, password, created_at）
- `food_records` 表：存储美食记录（id, user_id, shop_name, address, dish_name, cuisine_tags, region_tags, created_at）

#### 4. 部署

点击 "Deploy" 按钮，Vercel 会自动：
- 构建前端（Vite）
- 部署后端（Serverless Functions）
- 配置路由规则

部署完成后，你会获得一个类似 `https://meiweinote.vercel.app` 的 URL。

## 📁 项目结构

```
meiweinote/
├── api/                    # Vercel Serverless Functions
│   └── index.ts           # 后端 API 入口
├── backend/               # 本地开发后端
│   ├── src/
│   │   ├── auth.ts       # 认证逻辑
│   │   ├── database.ts   # 数据库配置
│   │   └── index.ts     # Express 服务器
│   └── db.json          # 数据库文件（仅本地）
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── components/   # Vue 组件
│   │   ├── composables/  # Vue composables
│   │   ├── api.ts       # API 客户端
│   │   └── main.ts      # 应用入口
│   └── package.json
├── vercel.json          # Vercel 配置
└── README.md           # 项目说明
```

## 🔧 本地开发

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 启动开发服务器

**终端 1 - 后端：**
```bash
cd backend
npm run dev
```

**终端 2 - 前端：**
```bash
cd frontend
npm run dev
```

访问 http://localhost:3000

## 🗄️ 数据库说明

- **本地开发**：使用 `backend/db.json` 文件存储数据
- **Vercel 部署**：使用 Vercel Postgres 数据库（推荐）

### Vercel Postgres 配置

项目已配置为使用 Vercel Postgres，这是生产环境的最佳选择：

**优势：**
- ✅ 免费层：512MB 存储
- ✅ 自动备份
- ✅ 全球边缘网络
- ✅ 与 Vercel 无缝集成
- ✅ 自动管理连接池

**配置步骤：**
1. 在 Vercel 项目中创建 Postgres 数据库
2. 环境变量 `POSTGRES_URL` 会自动添加
3. 首次部署时自动创建表结构

**本地开发使用 Postgres：**

如果你想本地也使用 Postgres：

1. 安装 PostgreSQL
2. 创建本地数据库
3. 设置环境变量 `POSTGRES_URL`
4. 运行初始化脚本：
   ```bash
   npx tsx scripts/init-db.ts
   ```

## 🔒 安全建议

1. **修改 JWT_SECRET**：使用强随机字符串
2. **HTTPS**：Vercel 自动提供 HTTPS
3. **环境变量**：不要在代码中硬编码敏感信息
4. **输入验证**：已在前端和后端实现
5. **密码加密**：使用 bcrypt 加密存储

## 📝 功能特性

- ✅ 用户注册和登录
- ✅ JWT token 认证
- ✅ 创建、编辑、删除美食记录
- ✅ 搜索功能（店名、菜名、标签）
- ✅ 响应式设计
- ✅ Toast 提示
- ✅ 用户数据隔离

## 🎨 技术栈

**前端：**
- Vue 3
- TypeScript
- Vite
- Axios

**后端：**
- Node.js
- Express
- TypeScript
- JWT
- bcryptjs
- Vercel Postgres

**部署：**
- Vercel
- Serverless Functions
- Vercel Postgres Database

## 📄 许可证

MIT License

## 👨‍💻 作者

美味记录本 - 记录你的美食体验
