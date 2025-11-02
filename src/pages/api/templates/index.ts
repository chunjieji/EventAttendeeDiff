import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase, saveTemplatesToFile } from '@/lib/mongodb';
import { NameListTemplate } from '@/models/NameListTemplate';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // 尝试从数据库获取
      try {
        const { db } = await connectToDatabase();
        const { category, search } = req.query;
        
        let query: any = {};
        
        if (category && category !== 'all') {
          query.category = category;
        }
        
        if (search) {
          query.name = { $regex: search, $options: 'i' };
        }
        
        const templates = await db
          .collection('templates')
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        
        // 同步到全局变量
        global.templates = templates;
        saveTemplatesToFile();
        
        return res.status(200).json(templates);
      } catch (error) {
        console.error('从数据库获取模板失败，使用文件数据:', error);
        
        // 如果数据库获取失败，使用文件数据
        let templates = global.templates || [];
        const { category, search } = req.query;
        
        if (category && category !== 'all') {
          templates = templates.filter(t => t.category === category);
        }
        
        if (search) {
          const searchRegex = new RegExp(String(search), 'i');
          templates = templates.filter(t => searchRegex.test(t.name));
        }
        
        return res.status(200).json(templates);
      }
    } catch (error) {
      console.error('获取模板失败:', error);
      return res.status(500).json({ error: '获取模板失败' });
    }
  } else if (req.method === 'POST') {
    try {
      const data: NameListTemplateInput = req.body;
      
      // 验证必填字段
      if (!data.name) {
        return res.status(400).json({ error: '模板名称是必填项' });
      }
      
      if (!data.names || data.names.length === 0) {
        return res.status(400).json({ error: '人员名单不能为空' });
      }
      
      const now = new Date();
      const template = {
        ...data,
        _id: new ObjectId().toString(),
        createdAt: now,
        updatedAt: now,
      };
      
      try {
        // 尝试保存到数据库
        const { db } = await connectToDatabase();
        await db.collection('templates').insertOne(template);
      } catch (error) {
        console.error('保存到数据库失败，仅保存到文件:', error);
      }
      
      // 无论数据库是否成功，都保存到文件
      if (!global.templates) global.templates = [];
      global.templates.push(template);
      saveTemplatesToFile();
      
      return res.status(201).json(template);
    } catch (error) {
      console.error('创建模板失败:', error);
      return res.status(500).json({ error: '创建模板失败' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}