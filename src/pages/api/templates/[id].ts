import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase, saveTemplatesToFile } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NameListTemplate } from '@/models/NameListTemplate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '无效的模板ID' });
  }
  
  try {
    // 确保ID格式正确
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ error: '无效的模板ID格式' });
    }
    
    // 尝试从数据库操作
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('templates');
      
      switch (req.method) {
        case 'GET':
          const template = await collection.findOne({ _id: objectId });
          
          if (!template) {
            // 尝试从文件获取
            if (global.templates) {
              const fileTemplate = global.templates.find(t => t._id === id);
              if (fileTemplate) {
                return res.status(200).json(fileTemplate);
              }
            }
            return res.status(404).json({ error: '未找到模板' });
          }
          
          return res.status(200).json(template);
          
        case 'PUT':
          const { name, description, category, names } = req.body;
          
          if (!name || !Array.isArray(names)) {
            return res.status(400).json({ error: '名称和人员名单为必填项' });
          }
          
          const updateData = {
            name,
            description,
            category,
            names,
            updatedAt: new Date()
          };
          
          const updateResult = await collection.updateOne(
            { _id: objectId },
            { $set: updateData }
          );
          
          // 同步更新文件中的模板
          if (global.templates) {
            const templateIndex = global.templates.findIndex(t => t._id === id);
            if (templateIndex >= 0) {
              global.templates[templateIndex] = { ...global.templates[templateIndex], ...updateData };
              saveTemplatesToFile();
            }
          }
          
          if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: '未找到模板' });
          }
          
          return res.status(200).json({ success: true, message: '模板已更新' });
          
        case 'DELETE':
          const deleteResult = await collection.deleteOne({ _id: objectId });
          
          // 同步删除文件中的模板
          if (global.templates) {
            const initialLength = global.templates.length;
            global.templates = global.templates.filter(t => t._id !== id);
            if (global.templates.length < initialLength) {
              saveTemplatesToFile();
            }
          }
          
          if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: '未找到模板' });
          }
          
          return res.status(200).json({ success: true, message: '模板已删除' });
          
        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).json({ error: '方法不允许' });
      }
    } catch (error) {
      console.error('数据库操作失败，尝试从文件操作:', error);
      
      // 如果数据库操作失败，尝试从文件操作
      if (req.method === 'GET' && global.templates) {
        const fileTemplate = global.templates.find(t => t._id === id);
        if (fileTemplate) {
          return res.status(200).json(fileTemplate);
        }
      } else if (req.method === 'DELETE' && global.templates) {
        const initialLength = global.templates.length;
        global.templates = global.templates.filter(t => t._id !== id);
        if (global.templates.length < initialLength) {
          saveTemplatesToFile();
          return res.status(200).json({ success: true, message: '模板已删除' });
        }
      }
      
      throw error; // 重新抛出错误以便被外层捕获
    }
  } catch (error) {
    console.error('模板操作错误:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}