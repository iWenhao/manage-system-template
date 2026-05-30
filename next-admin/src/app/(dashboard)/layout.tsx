'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { appConfig } from '@/config/app';

const menuItems = [
  { path: '/dashboard', label: '首页', icon: '🏠' },
  {
    label: '系统管理',
    icon: '⚙️',
    children: [
      { path: '/system/user', label: '用户管理' },
      { path: '/system/role', label: '角色管理' },
      { path: '/system/menu', label: '菜单管理' },
      { path: '/system/dept', label: '部门管理' },
    ],
  },
  {
    label: '系统监控',
    icon: '📊',
    children: [
      { path: '/monitor/online', label: '在线用户' },
      { path: '/monitor/server', label: '服务监控' },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { userInfo, setUserInfo, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = Cookies.get('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      setUserInfo(JSON.parse(stored));
    }
  }, [router, setUserInfo]);

  if (!mounted) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* 侧边栏 */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex-shrink-0">
          <h1 className={`text-xl font-bold ${!sidebarOpen && 'hidden'}`}>{appConfig.title}</h1>
        </div>
        <nav className="mt-4 flex-1 overflow-y-auto">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.children ? (
                <div>
                  <div className="px-4 py-2 text-gray-400 text-sm">{sidebarOpen ? item.label : item.icon}</div>
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      href={child.path}
                      className={`block px-8 py-2 text-sm hover:bg-gray-700 ${pathname === child.path ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  href={item.path}
                  className={`block px-4 py-2 hover:bg-gray-700 ${pathname === item.path ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
                >
                  {sidebarOpen ? item.label : item.icon}
                </Link>
              )}
            </div>
          ))}
        </nav>
        {/* 折叠/展开按钮 */}
        <div
          className="h-12 flex items-center justify-center bg-gray-900 cursor-pointer hover:bg-gray-700 transition-colors border-t border-gray-700 flex-shrink-0"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="text-lg">{sidebarOpen ? '◀' : '▶'}</span>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航 */}
        <header className="bg-white dark:bg-gray-800 shadow-sm h-14 flex items-center justify-between px-4">
          <div></div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">{userInfo?.nickname}</span>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
              退出
            </button>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}