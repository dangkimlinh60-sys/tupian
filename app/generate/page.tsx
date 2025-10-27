"use client";

import { useState } from "react";
import Link from "next/link";

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export default function GeneratePage() {
  const [prompt, setPrompt] = useState<string>("");
  const [style, setStyle] = useState<string>("realistic");
  const [size, setSize] = useState<string>("2K");
  const [error, setError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const styles = [
    { value: "realistic", label: "写实风格", icon: "📷" },
    { value: "anime", label: "动漫风格", icon: "🎨" },
    { value: "oil-painting", label: "油画风格", icon: "🖼️" },
    { value: "watercolor", label: "水彩风格", icon: "🎭" },
    { value: "sketch", label: "素描风格", icon: "✏️" },
    { value: "3d", label: "3D渲染", icon: "🎲" },
  ];

  const sizes = [
    { value: "1K", label: "1K" },
    { value: "2K", label: "2K" },
    { value: "4K", label: "4K" },
  ];

  const examplePrompts = [
    "一只可爱的橘猫坐在窗台上看着外面的雨",
    "未来科技城市的夜景，霓虹灯闪烁",
    "宁静的湖边小屋，日落时分",
    "宇宙中的星云和行星",
  ];

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          size: size,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生图失败");
      }

      // 处理火山引擎 API 返回的数据
      if (data.data && data.data.length > 0) {
        const newImages = data.data.map((item: any) => ({
          url: item.url,
          prompt: prompt,
          timestamp: Date.now(),
        }));
        setGeneratedImages([...newImages, ...generatedImages]);
      } else {
        throw new Error("未返回图片数据");
      }
    } catch (err) {
      console.error("生图错误:", err);
      setError(err instanceof Error ? err.message : "生图失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, prompt: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-generated-${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎨 AI 生图
          </h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Info Banner */}
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              💡 提示：使用火山引擎 AI 生图 API，请确保已配置 ARK_API_KEY 环境变量。
            </p>
          </div>

          {/* Warning Banner for Model Configuration */}
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ 模型配置说明
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              如果遇到"模型不支持图片生成"错误，请确保：
            </p>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 list-disc list-inside mt-2 space-y-1">
              <li>在火山引擎控制台创建支持<strong>图片生成</strong>的推理接入点</li>
              <li>将推理接入点 ID 配置到 app/api/generate/route.ts 文件的 model 参数中</li>
              <li>查看项目根目录的 AI_GENERATE_SETUP.md 文件了解详细配置步骤</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8">
              <p className="text-sm text-red-800 dark:text-red-200">
                ❌ 错误：{error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Input */}
            <div className="lg:col-span-1 space-y-6">
              {/* Prompt Input */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  描述你想要的图片
                </h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="例如：一只可爱的橘猫坐在窗台上..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />

                {/* Example Prompts */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    示例提示词：
                  </p>
                  <div className="space-y-2">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(example)}
                        className="w-full text-left text-sm px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Style Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  选择风格
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {styles.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        style === s.value
                          ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                          : "border-gray-200 dark:border-gray-600 hover:border-green-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {s.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  图片尺寸
                </h3>
                <div className="space-y-2">
                  {sizes.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSize(s.value)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        size === s.value
                          ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                          : "border-gray-200 dark:border-gray-600 hover:border-green-300"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {s.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
              >
                {isGenerating ? "生成中..." : "生成图片"}
              </button>
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-2">
              {isGenerating && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    AI 正在创作中...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    这可能需要几秒钟时间
                  </p>
                </div>
              )}

              {!isGenerating && generatedImages.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    开始创作你的 AI 艺术作品
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    输入描述，选择风格和尺寸，然后点击生成按钮
                  </p>
                </div>
              )}

              {generatedImages.length > 0 && !isGenerating && (
                <div className="space-y-6">
                  {generatedImages.map((image, index) => (
                    <div
                      key={image.timestamp}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
                    >
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full"
                      />
                      <div className="p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <span className="font-medium">提示词：</span>
                          {image.prompt}
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => downloadImage(image.url, image.prompt)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            下载图片
                          </button>
                          <button
                            onClick={() => setPrompt(image.prompt)}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            再次生成
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          {generatedImages.length === 0 && !isGenerating && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  多种风格
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  支持写实、动漫、油画等多种风格
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  快速生成
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  几秒钟即可生成高质量图片
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  精准控制
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  通过详细描述控制生成效果
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">📐</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  多种尺寸
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  支持方形、横版、竖版等尺寸
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
