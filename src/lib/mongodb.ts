import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

// 使用内存数据库替代
let mongoMemoryServer: MongoMemoryServer | null = null;
// 确保类型为 string，避免 TS 推断为 string | undefined
let mongoUri: string = process.env.MONGODB_URI ?? '';
const MONGODB_DB = process.env.MONGODB_DB || 'event-attendee-diff';
const DATA_DIR = path.join(process.cwd(), 'data');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');

interface MongoConnection {
  conn: {
    client: MongoClient;
    db: any;
  } | null;
  promise: Promise<{ client: MongoClient; db: any; }> | null;
}

// 在全局类型上添加mongo属性
declare global {
  var mongo: MongoConnection;
  var templates: any[];
}

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化全局模板数据
if (!global.templates) {
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      global.templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
      console.log('Loaded templates from file:', global.templates.length);
    } else {
      global.templates = [];
      fs.writeFileSync(TEMPLATES_FILE, JSON.stringify([], null, 2));
      console.log('Created empty templates file');
    }
  } catch (error) {
    console.error('Failed to load templates:', error);
    global.templates = [];
  }
}

// 保存模板到文件的函数
export const saveTemplatesToFile = () => {
  if (global.templates) {
    try {
      fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(global.templates, null, 2));
      console.log('Templates saved to file');
    } catch (error) {
      console.error('Failed to save templates to file:', error);
    }
  }
};

let cached: MongoConnection = global.mongo || { conn: null, promise: null };

if (!global.mongo) {
  global.mongo = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // 始终使用内存数据库以确保可靠性
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      mongoUri = mongoMemoryServer.getUri();
      console.log('Using MongoDB Memory Server:', mongoUri);
    } catch (error) {
      console.error('Failed to create MongoDB Memory Server:', error);
      throw error;
    }

    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any;

    try {
      cached.promise = MongoClient.connect(mongoUri, opts).then((client) => {
        return {
          client,
          db: client.db(MONGODB_DB),
        };
      }).catch(async (err) => {
        console.error('MongoDB连接错误，切换到内存数据库:', err);
        // 如果连接失败，尝试使用内存数据库
        if (!mongoMemoryServer) {
          mongoMemoryServer = await MongoMemoryServer.create();
          mongoUri = mongoMemoryServer.getUri();
          console.log('Using MongoDB Memory Server:', mongoUri);
        }
        
        return MongoClient.connect(mongoUri, opts).then((client) => {
          return {
            client,
            db: client.db(MONGODB_DB),
          };
        });
      });
    } catch (error) {
      console.error('MongoDB连接错误:', error);
      throw error;
    }
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  
  return cached.conn;
}