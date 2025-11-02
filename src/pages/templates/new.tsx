import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { NameListTemplateInput } from '../../models/NameListTemplate';
import { processNameList } from '../../utils/api';

export default function NewTemplatePage() {
  const router = useRouter();
  const [template, setTemplate] = useState<NameListTemplateInput>({
    name: '',
    description: '',
    category: '',
    names: []
  });
  const [nameListText, setNameListText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleNameListChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNameListText(e.target.value);
    // 实时处理名单
    const processedNames = processNameList(e.target.value);
    setTemplate(prev => ({ ...prev, names: processedNames }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!template.name || !template.category || template.names.length === 0) {
      setError('请填写模板名称、分类并添加至少一个人名');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '创建模板失败');
      }
      
      router.push('/templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建模板失败');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>创建名单模板 - 活动人员对比工具</title>
      </Head>
      
      <div className="mb-6">
        <Link href="/templates" className="text-blue-500 hover:underline">← 返回模板列表</Link>
        <h1 className="text-2xl font-bold mt-2">创建名单模板</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            模板名称 *
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            name="name"
            value={template.name}
            onChange={handleChange}
            placeholder="输入模板名称"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
            分类 *
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="category"
            type="text"
            name="category"
            value={template.category}
            onChange={handleChange}
            placeholder="输入分类（如：部门、班级、项目组）"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            描述
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            name="description"
            value={template.description}
            onChange={handleChange}
            placeholder="输入模板描述（可选）"
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nameList">
            人员名单 *
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="nameList"
            value={nameListText}
            onChange={handleNameListChange}
            placeholder="输入人员名单，使用逗号、空格或换行分隔"
            rows={6}
            required
          />
          <p className="text-sm text-gray-600 mt-1">
            已识别 {template.names.length} 人
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? '保存中...' : '保存模板'}
          </button>
          <Link href="/templates" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
              取消
            </Link>
        </div>
      </form>
    </div>
  );
}