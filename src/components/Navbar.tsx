import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  
  return (
    <nav className="bg-white shadow-sm mb-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                活动人员对比工具
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                router.pathname === '/' 
                  ? 'border-blue-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}>
                主页
              </Link>
              <Link href="/templates" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                router.pathname.startsWith('/templates') 
                  ? 'border-blue-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}>
                名单管理
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}