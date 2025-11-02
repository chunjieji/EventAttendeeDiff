import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { NameListTemplate } from '../../models/NameListTemplate';
import { processNameList } from '../../utils/api';

export default function EditTemplatePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [template, setTemplate] = useState<NameListTemplate | null>(null);
  const [nameListText, setNameListText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 获取模板数据
  useEffect(() => {
    if (!id) return;
    
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${id}`);
        
        if (!response.ok) {
          throw new Error('获取模板失败');
        }
        
        const data = await response.json();
        setTemplate(data);
        setNameListText(data.names.join(', '));
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取模板失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplate();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!template) return;
    setTemplate({ ...template, [name]: value });
  };

  const handleNameListChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNameListText(e.target.value);
    // 实时处理名单
    const processedNames = processNameList(e.target.value);
    if (!template) return;
    setTemplate({ ...template, names: processedNames });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!template || !template.name || !template.category || template.names.length === 0) {
      setError('请填写模板名称、分类并添加至少一个人名');
      return;
    }
    
    try {
      setSaving(true);
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          category: template.category,
          names: template.names
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新模板失败');
      }
      
      router.push('/templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新模板失败');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2">加载中...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          模板不存在或已被删除
        </div>
        <div className="mt-4">
          <Link href="/templates" className="text-blue-500 hover:underline">返回模板列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>编辑名单模板 - 活动人员对比工具</title>
      </Head>
      
      <div className="mb-6">
        <Link href="/templates" className="text-blue-500 hover:underline">← 返回模板列表</Link>
        <h1 className="text-2xl font-bold mt-2">编辑名单模板</h1>
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
            value={template.description || ''}
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
            disabled={saving}
          >
            {saving ? '保存中...' : '保存更改'}
          </button>
          <Link href="/templates" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
              取消
            </Link>
        </div>
      </form>
    </div>
  );
}