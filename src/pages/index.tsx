import React, { useState, useEffect } from 'react';
import NameListInput from '@/components/NameListInput';
import ResultDisplay from '@/components/ResultDisplay';
import { processNameList, findAbsentees } from '@/utils/api';

export default function Home() {
  const [expectedList, setExpectedList] = useState('');
  const [actualList, setActualList] = useState('');
  const [expectedNames, setExpectedNames] = useState<string[]>([]);
  const [actualNames, setActualNames] = useState<string[]>([]);
  const [absentees, setAbsentees] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

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

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">活动人员对比工具</h1>
        <p className="text-gray-600">快速比对预期参加人员与实际参加人员，识别缺席人员</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <NameListInput
          title="预期参加人员"
          value={expectedList}
          onChange={setExpectedList}
          placeholder="请输入预期参加人员名单，可用逗号、空格或回车分隔"
        />
        
        <NameListInput
          title="实际参加人员"
          value={actualList}
          onChange={setActualList}
          placeholder="请输入实际参加人员名单，可用逗号、空格或回车分隔"
        />
      </div>

      <div className="flex justify-center gap-4 mb-6">
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

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} 活动人员对比工具 | 基于智谱GLM-4V-Flash API</p>
      </footer>
    </main>
  );
}