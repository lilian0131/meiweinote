import express, { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

let pool: Pool | null = null;
let tablesCreated = false;

const initPool = () => {
  if (!pool) {
    console.log('初始化连接池...');
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? '已配置' : '未配置');
    
    if (!process.env.POSTGRES_URL) {
      console.error('错误：POSTGRES_URL 环境变量未配置');
      throw new Error('数据库连接字符串未配置');
    }
    
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    console.log('连接池创建成功');
  }
  return pool;
};

const createTables = async () => {
  if (tablesCreated) {
    console.log('表已创建，跳过');
    return;
  }

  const currentPool = initPool();
  if (!currentPool) {
    throw new Error('连接池未初始化');
  }

  const client = await currentPool.connect();
  try {
    console.log('开始创建表...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('users 表创建成功');
    
    await client.query(`
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
    `);
    
    console.log('food_records 表创建成功');
    tablesCreated = true;
  } catch (error) {
    console.error('创建表失败:', error);
    throw error;
  } finally {
    client.release();
  }
};

const app = express();
app.use(cors());
app.use(express.json());

const verifyToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    (req as any).userId = decoded.userId;
    (req as any).username = decoded.username;
    next();
  } catch (error) {
    res.status(401).json({ error: '无效的认证令牌' });
  }
};

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const currentPool = initPool();
  if (!currentPool) {
    return res.status(500).json({ error: '数据库连接失败' });
  }

  const client = await currentPool.connect();
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为6位' });
    }

    const result = await client.query('SELECT id FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertResult = await client.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, hashedPassword]
    );
    
    const newUser = insertResult.rows[0];
    const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: newUser.id,
        username: newUser.username
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  } finally {
    client.release();
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const currentPool = initPool();
  if (!currentPool) {
    return res.status(500).json({ error: '数据库连接失败' });
  }

  const client = await currentPool.connect();
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  } finally {
    client.release();
  }
});

app.get('/api/records', verifyToken, async (req: Request, res: Response) => {
  const currentPool = initPool();
  if (!currentPool) {
    return res.status(500).json({ error: '数据库连接失败' });
  }

  const client = await currentPool.connect();
  try {
    const userId = (req as any).userId;
    const result = await client.query(
      'SELECT * FROM food_records WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json(result.rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      shopName: r.shop_name,
      address: r.address,
      dishName: r.dish_name,
      cuisineTags: r.cuisine_tags,
      regionTags: r.region_tags,
      createdAt: r.created_at
    })));
  } catch (error) {
    console.error('获取记录失败:', error);
    res.status(500).json({ error: '获取记录失败' });
  } finally {
    client.release();
  }
});

app.get('/api/records/:id', verifyToken, async (req: Request, res: Response) => {
  const currentPool = initPool();
  if (!currentPool) {
    return res.status(500).json({ error: '数据库连接失败' });
  }

  const client = await currentPool.connect();
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const result = await client.query(
      'SELECT * FROM food_records WHERE id = $1 AND user_id = $2',
      [parseInt(id), userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    const r = result.rows[0];
    res.json({
      id: r.id,
      userId: r.user_id,
      shopName: r.shop_name,
      address: r.address,
      dishName: r.dish_name,
      cuisineTags: r.cuisine_tags,
      regionTags: r.region_tags,
      createdAt: r.created_at
    });
  } catch (error) {
    console.error('获取记录失败:', error);
    res.status(500).json({ error: '获取记录失败' });
  } finally {
    client.release();
  }
});

app.post('/api/records', verifyToken, async (req: Request, res: Response) => {
  const currentPool = initPool();
  if (!currentPool) {
    return res.status(500).json({ error: '数据库连接失败' });
  }

  const client = await currentPool.connect();
  try {
    const { shopName, address, dishName, cuisineTags, regionTags } = req.body;
    const userId = (req as any).userId;
    
    if (!shopName || !address || !dishName) {
      return res.status(400).json({ error: '店名、地址和菜名不能为空' });
    }

    const result = await client.query(
      'INSERT INTO food_records (user_id, shop_name, address, dish_name, cuisine_tags, region_tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, shopName, address, dishName, cuisineTags || '', regionTags || '']
    );
    
    const r = result.rows[0];
    res.status(201).json({
      id: r.id,
      userId: r.user_id,
      shopName: r.shop_name,
      address: r.address,
      dishName: r.dish_name,
      cuisineTags: r.cuisine_tags,
      regionTags: r.region_tags,
      createdAt: r.created_at
    });
  } catch (error) {
    console.error('创建记录失败:', error);
    res.status(500).json({ error: '创建记录失败' });
  } finally {
    client.release();
  }
});

app.put('/api/records/:id', verifyToken, async (req: Request, res: Response) => {
  const currentPool = initPool();
  if (!currentPool) {
    return res.status(500).json({ error: '数据库连接失败' });
  }

  const client = await currentPool.connect();
  try {
    const { id } = req.params;
    const { shopName, address, dishName, cuisineTags, regionTags } = req.body;
    const userId = (req as any).userId;
    
    if (!shopName || !address || !dishName) {
      return res.status(400).json({ error: '店名、地址和菜名不能为空' });
    }

    const result = await client.query(
      'UPDATE food_records SET shop_name = $1, address = $2, dish_name = $3, cuisine_tags = $4, region_tags = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
      [shopName, address, dishName, cuisineTags || '', regionTags || '', parseInt(id), userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    const r = result.rows[0];
    res.json({
      id: r.id,
      userId: r.user_id,
      shopName: r.shop_name,
      address: r.address,
      dishName: r.dish_name,
      cuisineTags: r.cuisine_tags,
      regionTags: r.region_tags,
      createdAt: r.created_at
    });
  } catch (error) {
    console.error('更新记录失败:', error);
    res.status(500).json({ error: '更新记录失败' });
  } finally {
    client.release();
  }
});

app.delete('/api/records/:id', verifyToken, async (req: Request, res: Response) => {
  const currentPool = initPool();
  if (!currentPool) {
    return res.status(500).json({ error: '数据库连接失败' });
  }

  const client = await currentPool.connect();
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    
    const result = await client.query(
      'DELETE FROM food_records WHERE id = $1 AND user_id = $2 RETURNING id',
      [parseInt(id), userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除记录失败:', error);
    res.status(500).json({ error: '删除记录失败' });
  } finally {
    client.release();
  }
});

export default app;
