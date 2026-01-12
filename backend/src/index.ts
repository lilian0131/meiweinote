import express, { Request, Response } from 'express';
import cors from 'cors';
import db, { FoodRecord, initDb, getNextRecordId } from './database';
import { register, login, verifyToken } from './auth';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

app.get('/api/records', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await db.read();
    const records = db.data?.records
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: '获取记录失败' });
  }
});

app.get('/api/records/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    await db.read();
    const record = db.data?.records.find(r => r.id === parseInt(id) && r.userId === userId);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: '获取记录失败' });
  }
});

app.post('/api/records', verifyToken, async (req: Request, res: Response) => {
  try {
    const { shopName, address, dishName, cuisineTags, regionTags }: Omit<FoodRecord, 'id' | 'createdAt' | 'userId'> = req.body;
    const userId = (req as any).userId;
    
    if (!shopName || !address || !dishName) {
      return res.status(400).json({ error: '店名、地址和菜名不能为空' });
    }

    await db.read();
    const newRecord: FoodRecord = {
      id: getNextRecordId(),
      userId,
      shopName,
      address,
      dishName,
      cuisineTags: cuisineTags || '',
      regionTags: regionTags || '',
      createdAt: new Date().toISOString()
    };

    db.data!.records.push(newRecord);
    await db.write();
    
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: '创建记录失败' });
  }
});

app.put('/api/records/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { shopName, address, dishName, cuisineTags, regionTags }: Omit<FoodRecord, 'id' | 'createdAt' | 'userId'> = req.body;
    const userId = (req as any).userId;
    
    if (!shopName || !address || !dishName) {
      return res.status(400).json({ error: '店名、地址和菜名不能为空' });
    }

    await db.read();
    const index = db.data!.records.findIndex(r => r.id === parseInt(id) && r.userId === userId);
    
    if (index === -1) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    db.data!.records[index] = {
      ...db.data!.records[index],
      shopName,
      address,
      dishName,
      cuisineTags: cuisineTags || '',
      regionTags: regionTags || ''
    };
    
    await db.write();
    res.json(db.data!.records[index]);
  } catch (error) {
    res.status(500).json({ error: '更新记录失败' });
  }
});

app.delete('/api/records/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    await db.read();
    const index = db.data!.records.findIndex(r => r.id === parseInt(id) && r.userId === userId);
    
    if (index === -1) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    db.data!.records.splice(index, 1);
    await db.write();
    
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除记录失败' });
  }
});

const startServer = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
};

startServer();
