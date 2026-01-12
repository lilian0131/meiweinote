# 美味记录本 - 完整部署配置指南

## 🎉 部署状态

✅ **项目已成功部署到 Vercel！**

- **生产环境 URL**: https://meiweinote.vercel.app
- **预览环境 URL**: https://meiweinote-9mkz1wlp0-lilians-projects-bfb4e978.vercel.app

## 📋 完整配置清单

### 第一步：配置 Vercel Postgres 数据库 ⏳

1. **打开 Vercel Dashboard**
   - 访问：https://vercel.com/dashboard
   - 登录你的账户

2. **选择项目**
   - 点击 "meiweinote" 项目

3. **创建 Postgres 数据库**
   - 点击顶部菜单的 **"Storage"** 标签
   - 点击 **"Create Database"** 按钮
   - 选择 **"Postgres"**
   - 选择 **"Hobby"** 层（免费）
   - 点击 **"Create"**
   - 等待数据库创建完成（1-2 分钟）

4. **验证环境变量**
   - 创建完成后，点击 **"Settings"** 标签
   - 找到 **"Environment Variables"** 部分
   - 确认 `POSTGRES_URL` 已自动添加

### 第二步：配置 JWT_SECRET 环境变量 ⏳

1. **生成随机密钥**
   
   在终端运行：
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   或者使用在线工具：
   - https://www.random.org/strings/
   - https://www.uuidgenerator.net/guid

2. **添加环境变量**
   - 在 Vercel 项目中，点击 **"Settings"** 标签
   - 找到 **"Environment Variables"** 部分
   - 点击 **"Add New"**
   - 填写：
     - **Key**: `JWT_SECRET`
     - **Value**: [上面生成的随机字符串]
     - **Environment**: 选择所有（Production, Preview, Development）
   - 点击 **"Save"**

### 第三步：验证配置 ✅

1. **检查环境变量**
   - 在 Settings → Environment Variables 中确认：
     - ✅ `POSTGRES_URL` 存在（自动添加）
     - ✅ `JWT_SECRET` 存在（手动添加）

2. **等待自动重新部署**
   - 添加环境变量后，Vercel 会自动重新部署
   - 通常需要 1-2 分钟

3. **测试应用**
   - 访问：https://meiweinote.vercel.app
   - 尝试注册新账户
   - 登录并添加美食记录

## 🗄️ 数据库表结构

首次访问 API 时，会自动创建以下表：

### users 表
```sql
- id: SERIAL PRIMARY KEY
- username: VARCHAR(255) UNIQUE NOT NULL
- password: VARCHAR(255) NOT NULL
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### food_records 表
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER REFERENCES users(id) ON DELETE CASCADE
- shop_name: VARCHAR(255) NOT NULL
- address: VARCHAR(255) NOT NULL
- dish_name: TEXT NOT NULL
- cuisine_tags: VARCHAR(255)
- region_tags: VARCHAR(255)
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## 🔍 常用命令

### 查看部署日志
```bash
vercel inspect meiweinote.vercel.app --logs
```

### 查看部署信息
```bash
vercel inspect meiweinote.vercel.app
```

### 重新部署
```bash
vercel deploy --prod
```

### 查看环境变量
```bash
vercel env ls
```

### 添加环境变量（CLI 方式）
```bash
vercel env add JWT_SECRET
```

## 🎯 配置完成后的使用流程

1. **访问应用**
   - 打开：https://meiweinote.vercel.app

2. **注册账户**
   - 点击"立即注册"
   - 输入用户名和密码（至少 6 位）
   - 确认密码
   - 提交注册

3. **登录**
   - 使用注册的用户名和密码登录
   - 登录成功后进入主应用

4. **添加美食记录**
   - 填写店名、地址、菜名
   - 选择菜系标签和地区标签
   - 点击"添加记录"

5. **管理记录**
   - 查看所有记录（按时间倒序）
   - 搜索记录
   - 编辑或删除记录

## ⚠️ 常见问题

### Q: 注册时提示"注册失败"？
A: 检查 Vercel Dashboard 中的部署日志，可能是：
- 数据库未创建完成
- 环境变量未正确配置
- 数据库连接失败

### Q: 登录后看不到记录？
A: 这是正常的，新账户没有记录。添加一些记录试试。

### Q: 数据会丢失吗？
A: 不会。数据存储在 Vercel Postgres 中，永久保存。

### Q: 可以修改用户名吗？
A: 当前版本不支持修改用户名，需要注册新账户。

### Q: 可以删除账户吗？
A: 当前版本不支持删除账户，可以联系管理员。

## 📊 Vercel Postgres 免费层限制

- **存储**: 512 MB
- **连接**: 60 小时/月
- **计算**: 100 小时/月
- **行数**: 无限制
- **适合**: 个人使用和小型项目

## 🔒 安全建议

1. **不要泄露 JWT_SECRET**
   - 不要在代码中硬编码
   - 不要提交到 Git
   - 只在 Vercel 环境变量中配置

2. **使用强密码**
   - 至少 8 个字符
   - 包含大小写字母、数字、特殊字符

3. **定期更新密码**
   - 建议每 3-6 个月更新一次

## 🎊 部署完成！

完成上述配置后，你的美味记录本就可以：

- ✅ 全球访问
- ✅ 数据持久化存储
- ✅ 多用户支持
- ✅ 用户数据隔离
- ✅ 安全认证

## 📞 需要帮助？

如果遇到问题，可以：

1. 查看 Vercel 部署日志
2. 检查环境变量配置
3. 查看浏览器控制台错误
4. 联系技术支持

---

**祝你使用愉快！🎉**
