import React from 'react';

interface ResultDisplayProps {
  expectedNames: string[];
  actualNames: string[];
  absentees: string[];
  isVisible: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  expectedNames,
  actualNames,
  absentees,
  isVisible,
}) => {
  if (!isVisible) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const attendanceRate = expectedNames.length > 0
    ? Math.round((actualNames.length / expectedNames.length) * 100)
    : 0;

  return (
    <div className="card mt-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">比对结果</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">预期参加人数</p>
          <p className="text-3xl font-bold text-blue-600">{expectedNames.length}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">实际参加人数</p>
          <p className="text-3xl font-bold text-green-600">{actualNames.length}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">缺席人数</p>
          <p className="text-3xl font-bold text-red-600">{absentees.length}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">出勤率</h3>
          <span className="text-lg font-semibold">{attendanceRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${attendanceRate >= 80 ? 'bg-green-600' : attendanceRate >= 60 ? 'bg-yellow-400' : 'bg-red-600'}`} 
            style={{ width: `${attendanceRate}%` }}
          ></div>
        </div>
      </div>
      
      {absentees.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">缺席人员名单</h3>
            <button 
              onClick={() => copyToClipboard(absentees.join('、'))}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              复制名单
            </button>
          </div>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200 max-h-[200px] overflow-y-auto">
            {absentees.length > 0 ? (
              <p className="text-gray-800">
                {absentees.join('、')}
              </p>
            ) : (
              <p className="text-gray-500 italic">无缺席人员</p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">全员到齐！</p>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;