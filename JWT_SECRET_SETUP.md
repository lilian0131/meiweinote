# JWT_SECRET 配置说明

## 生成 JWT_SECRET

请在终端运行以下命令生成随机密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 或者使用在线工具生成

你也可以访问以下在线工具生成随机字符串：

- https://www.random.org/strings/
- https://www.uuidgenerator.net/guid
- https://passwordsgenerator.net/

## 配置步骤

1. 访问 Vercel Dashboard: https://vercel.com/dashboard
2. 选择 meiweinote 项目
3. 点击 "Settings" 标签
4. 找到 "Environment Variables" 部分
5. 点击 "Add New"
6. 添加环境变量：
   - Key: `JWT_SECRET`
   - Value: [上面生成的随机字符串]
   - Environment: 选择所有（Production, Preview, Development）
7. 点击 "Save"

## 注意事项

- JWT_SECRET 必须保密，不要泄露
- 建议使用至少 32 个字符的随机字符串
- 不要使用简单的密码或常用字符串
