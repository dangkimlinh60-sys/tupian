import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "图片压缩",
      description: "快速压缩图片大小，保持高质量",
      icon: "📦",
      href: "/compress",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "抠图去背景",
      description: "智能识别主体，一键去除背景",
      icon: "✂️",
      href: "/remove-bg",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "图片识别",
      description: "AI识别图片内容，提取文字信息",
      icon: "🔍",
      href: "/recognize",
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "AI生图",
      description: "文字描述生成精美图片",
      icon: "🎨",
      href: "/generate",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            图片处理工具箱
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            一站式图片处理平台，提供压缩、抠图、识别、AI生图等多种功能
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative p-8">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Arrow Icon */}
                  <div className="mt-6 flex items-center text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
                    <span className="text-sm font-medium">开始使用</span>
                    <svg
                      className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            © 2025 图片处理工具箱 - 让图片处理更简单
          </p>
        </div>
      </footer>
    </div>
  );
}
