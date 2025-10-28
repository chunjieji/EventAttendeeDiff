import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type ResponseData = {
  success: boolean;
  data?: string;
  error?: string;
};

// 设置请求体大小限制
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // 设置最大请求体大小
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: '只允许POST请求' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: '缺少图片数据' });
    }

    // 调用智谱API
    const response = await axios.post(
      process.env.ZHIPU_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        model: 'glm-4v-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: '请识别图片中的所有人名，用逗号分隔输出' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ZHIPU_API_KEY || '75b627b72dd94af6ae7304f72c810263.ErWsFP01mMFjIMr0'}`
        }
      }
    );

    // 从API响应中提取人名文本
    const content = response.data.choices[0]?.message?.content || '';
    
    return res.status(200).json({ success: true, data: content.trim() });
  } catch (error: any) {
    console.error('图像识别API调用失败:', error);
    return res.status(500).json({ 
      success: false, 
      error: `图像识别失败: ${error.message || '未知错误'}` 
    });
  }
}