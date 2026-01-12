import { postgres } from '@vercel/postgres';

const db = postgres({
  connectionString: process.env.POSTGRES_URL,
});

async function initDatabase() {
  console.log('开始初始化数据库...');

  try {
    await db`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ users 表创建成功');

    await db`
      CREATE TABLE IF NOT EXISTS food_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        shop_name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        dish_name TEXT NOT NULL,
        cuisine_tags VARCHAR(255),
        region_tags VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ food_records 表创建成功');

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

initDatabase();
