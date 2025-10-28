import axios from 'axios';

/**
 * 将图片转换为Base64格式
 */
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // 移除Data URL前缀 (例如: "data:image/jpeg;base64,")
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * 调用智谱GLM-4V-Flash API识别图片中的人名
 */
export const recognizeImage = async (imageBase64: string): Promise<string> => {
  try {
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
    return content.trim();
  } catch (error) {
    console.error('图像识别API调用失败:', error);
    throw new Error('图像识别失败，请重试');
  }
};

/**
 * 处理名单字符串，将其转换为标准化的数组
 */
export const processNameList = (nameString: string): string[] => {
  if (!nameString) return [];
  
  // 分割字符串，处理各种可能的分隔符（逗号、空格、换行等）
  return nameString
    .split(/[,，、\s\n]+/) // 匹配逗号、中文逗号、顿号、空格、换行
    .map(name => name.trim())
    .filter(name => name.length > 0); // 过滤空字符串
};

/**
 * 比较两个名单，找出缺席人员
 */
export const findAbsentees = (expectedNames: string[], actualNames: string[]): string[] => {
  // 创建实际参加人员的Set，用于快速查找
  const actualNamesSet = new Set(actualNames.map(name => name.trim().toLowerCase()));
  
  // 找出预期名单中不在实际名单中的人员
  return expectedNames
    .filter(name => {
      const normalizedName = name.trim().toLowerCase();
      return normalizedName && !actualNamesSet.has(normalizedName);
    });
};