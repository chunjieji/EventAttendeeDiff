import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NameListInput from '@/components/NameListInput';
import ResultDisplay from '@/components/ResultDisplay';
import Navbar from '@/components/Navbar';
import { processNameList, findAbsentees } from '@/utils/api';
import { NameListTemplate } from '@/models/NameListTemplate';

export default function Home() {
  const router = useRouter();
  const { templateId } = router.query;
  
  const [expectedList, setExpectedList] = useState('');
  const [actualList, setActualList] = useState('');
  const [expectedNames, setExpectedNames] = useState<string[]>([]);
  const [actualNames, setActualNames] = useState<string[]>([]);
  const [absentees, setAbsentees] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [templates, setTemplates] = useState<NameListTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // 获取模板列表
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const response = await fetch('/api/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error('获取模板失败:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  // 如果URL中有templateId参数，加载该模板
  useEffect(() => {
    if (templateId && typeof templateId === 'string') {
      const loadTemplate = async () => {
        try {
          const response = await fetch(`/api/templates/${templateId}`);
          if (response.ok) {
            const template = await response.json();
            setExpectedList(template.names.join(', '));
          }
        } catch (error) {
          console.error('加载模板失败:', error);
        }
      };
      
      loadTemplate();
    }
  }, [templateId]);

  // 当名单变化时，更新处理后的名单数组
  useEffect(() => {
    setExpectedNames(processNameList(expectedList));
    setActualNames(processNameList(actualList));
  }, [expectedList, actualList]);

  const handleCompare = () => {
    if (expectedNames.length === 0) {
      alert('请先输入预期参加人员名单');
      return;
    }

    const absent = findAbsentees(expectedNames, actualNames);
    setAbsentees(absent);
    setShowResults(true);
  };

  const handleClear = () => {
    if (confirm('确定要清空所有数据吗？')) {
      setExpectedList('');
      setActualList('');
      setAbsentees([]);
      setShowResults(false);
    }
  };
  
  const handleSelectTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`);
      if (response.ok) {
        const template = await response.json();
        setExpectedList(template.names.join(', '));
      }
    } catch (error) {
      console.error('加载模板失败:', error);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">活动人员对比工具</h1>
          <p className="text-gray-600">快速比对预期参加人员与实际参加人员，识别缺席人员</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">预期参加人员</h2>
              <div className="relative">
                <select 
                  className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => e.target.value && handleSelectTemplate(e.target.value)}
                  disabled={loadingTemplates}
                >
                  <option value="">选择模板</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name} ({template.names.length}人)
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <NameListInput
              title=""
              value={expectedList}
              onChange={setExpectedList}
              placeholder="请输入预期参加人员名单，可用逗号、空格或回车分隔"
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">实际参加人员</h2>
            <NameListInput
              title=""
              value={actualList}
              onChange={setActualList}
              placeholder="请输入实际参加人员名单，可用逗号、空格或回车分隔"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-6 mt-8">
          <button 
            onClick={handleCompare}
            className="btn btn-primary"
            disabled={expectedNames.length === 0}
          >
            比对名单
          </button>
          
          <button 
            onClick={handleClear}
            className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            清空数据
          </button>
        </div>

        <ResultDisplay
          expectedNames={expectedNames}
          actualNames={actualNames}
          absentees={absentees}
          isVisible={showResults}
        />
      </div>

      <footer className="mt-12 text-center text-sm text-gray-500 pb-6">
        <p>© {new Date().getFullYear()} 活动人员对比工具 | 基于智谱GLM-4V-Flash API</p>
      </footer>
    </main>
  );
}