import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import { convertImageToBase64, processNameList } from '@/utils/api';
import axios from 'axios';

interface NameListInputProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const NameListInput: React.FC<NameListInputProps> = ({
  title,
  value,
  onChange,
  placeholder = '请输入人员名单，可用逗号、空格或回车分隔',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameCount, setNameCount] = useState(0);

  // 当值变化时更新名单计数
  useEffect(() => {
    const names = processNameList(value);
    setNameCount(names.length);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setError(null);
  };

  const handleFileSelect = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // 将图片转换为Base64
      const base64 = await convertImageToBase64(file);
      
      // 调用API进行图像识别
      const response = await axios.post('/api/recognize-image', { imageBase64: base64 });
      
      if (response.data.success) {
        // 更新名单
        onChange(response.data.data);
      } else {
        throw new Error(response.data.error || '识别失败');
      }
    } catch (err: any) {
      console.error('图片处理失败:', err);
      setError(err.message || '图片处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      <div className="mb-4">
        <FileUpload 
          onFileSelect={handleFileSelect} 
          label="上传含有人名的图片" 
          isLoading={isProcessing}
        />
      </div>
      
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor={`${title}-input`} className="text-sm font-medium text-gray-700">
            人员名单
          </label>
          <span className="text-sm text-gray-500">{nameCount} 人</span>
        </div>
        
        <textarea
          id={`${title}-input`}
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="input-field flex-grow min-h-[150px]"
          disabled={isProcessing}
        />
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default NameListInput;