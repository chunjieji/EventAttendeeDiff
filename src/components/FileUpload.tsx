import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = 'image/jpeg, image/png, image/jpg',
  label = '上传图片',
  isLoading = false,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    // 调用父组件的回调
    onFileSelect(file);
    
    // 清空input的value，允许重复上传同一个文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          disabled={isLoading}
        />
        
        {isLoading ? (
          <div className="py-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
            <p className="text-gray-500">处理中...</p>
          </div>
        ) : preview ? (
          <div className="relative w-full h-40 mb-2">
            <Image 
              src={preview} 
              alt="预览" 
              fill 
              className="object-contain rounded-md" 
            />
          </div>
        ) : (
          <div className="py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0H8m12 0a4 4 0 01-4-4v-4m32 0v-4a4 4 0 00-4-4h-4m-12 4h.01M16 20h.01M21 20h.01M16 24h.01M21 24h.01M12 20h.01M12 24h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-xs text-gray-400">点击或拖拽图片到此处</p>
          </div>
        )}
      </div>
      
      {preview && !isLoading && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
          }}
          className="mt-2 text-sm text-red-500 hover:text-red-700"
        >
          移除图片
        </button>
      )}
    </div>
  );
};

export default FileUpload;