import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import crypto from 'crypto';

interface Data {
  users: User[];
  records: FoodRecord[];
}

export interface User {
  id: number;
  username: string;
  password: string;
  createdAt: string;
}

export interface FoodRecord {
  id: number;
  userId: number;
  shopName: string;
  address: string;
  dishName: string;
  cuisineTags: string;
  regionTags: string;
  createdAt: string;
}

const dbPath = path.join(__dirname, '../db.json');
const adapter = new JSONFile<Data>(dbPath);
const defaultData: Data = { users: [], records: [] };
const db = new Low<Data>(adapter, defaultData);

export const initDb = async () => {
  await db.read();
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  }
};

export const getNextUserId = (): number => {
  if (!db.data || db.data.users.length === 0) {
    return 1;
  }
  return Math.max(...db.data.users.map(u => u.id)) + 1;
};

export const getNextRecordId = (): number => {
  if (!db.data || db.data.records.length === 0) {
    return 1;
  }
  return Math.max(...db.data.records.map(r => r.id)) + 1;
};

export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export default db;
