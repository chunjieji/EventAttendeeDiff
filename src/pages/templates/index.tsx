import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { NameListTemplate } from '../../models/NameListTemplate';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<NameListTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch all templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append('search', searchTerm);
        if (selectedCategory) queryParams.append('category', selectedCategory);
        
        const response = await fetch(`/api/templates?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        
        const data = await response.json();
        setTemplates(data);
        
        // 提取所有唯一的分类
        const uniqueCategories = Array.from(new Set(data.map((t: NameListTemplate) => t.category)));
        setCategories(uniqueCategories as string[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取模板失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [searchTerm, selectedCategory]);

  // 删除模板
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此模板吗？')) return;
    
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('删除模板失败');
      }
      
      // 更新模板列表
      setTemplates(templates.filter(template => template._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除模板失败');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>名单模板管理 - 活动人员对比工具</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">名单模板管理</h1>
        <div className="flex gap-2">
          <Link href="/" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
            返回主页
          </Link>
          <Link href="/templates/new" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            创建新模板
          </Link>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索模板..."
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="w-full p-2 border rounded"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">所有分类</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">加载中...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">暂无模板</p>
          <p className="mt-2">
            <Link href="/templates/new" className="text-blue-500 hover:underline">创建第一个模板</Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{template.name}</h2>
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {template.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {template.names.length} 人
                  </div>
                </div>
                
                {template.description && (
                  <p className="text-gray-600 mt-2 text-sm">{template.description}</p>
                )}
                
                <div className="mt-4 pt-3 border-t flex justify-between">
                  <div>
                    <button
                      onClick={() => router.push(`/templates/${template._id}`)}
                      className="text-blue-500 hover:text-blue-700 mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(template._id as string)}
                      className="text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </div>
                  <button
                    onClick={() => router.push(`/?templateId=${template._id}`)}
                    className="text-green-500 hover:text-green-700"
                  >
                    应用
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}