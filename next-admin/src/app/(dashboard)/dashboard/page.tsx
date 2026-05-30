export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">首页</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">用户数量</h3>
          <p className="text-3xl font-bold text-blue-500">1,024</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">在线用户</h3>
          <p className="text-3xl font-bold text-green-500">128</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">今日访问</h3>
          <p className="text-3xl font-bold text-purple-500">3,456</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">系统消息</h3>
          <p className="text-3xl font-bold text-orange-500">12</p>
        </div>
      </div>
    </div>
  );
}