"use client";

import { useState } from "react";
import Link from "next/link";

export default function RemoveBgPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedUrl("");
    }
  };

  const removeBackground = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    // 模拟处理过程
    setTimeout(() => {
      // 实际应用中，这里应该调用后端 API 或使用第三方服务
      // 例如 remove.bg API 或本地 AI 模型
      setProcessedUrl(previewUrl); // 临时使用原图
      setIsProcessing(false);
    }, 2000);
  };

  const downloadProcessed = () => {
    if (!processedUrl) return;

    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `no-bg_${selectedFile?.name || "image.png"}`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
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
            ✂️ 抠图去背景
          </h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Info Banner */}
          <div className="bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4 mb-8">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              💡 提示：此功能需要集成第三方 API（如 remove.bg）或本地 AI 模型才能实现真实的背景移除功能。当前为演示版本。
            </p>
          </div>

          {/* Upload Area */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  点击或拖拽上传图片
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  支持 JPG、PNG 等格式
                </p>
              </label>
            </div>
          </div>

          {/* Process Button */}
          {selectedFile && !processedUrl && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
              <button
                onClick={removeBackground}
                disabled={isProcessing}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? "处理中..." : "开始去除背景"}
              </button>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  原始图片
                </h3>
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>

              {/* Processed */}
              {processedUrl && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    去除背景后
                  </h3>
                  <div className="relative">
                    {/* Checkered background to show transparency */}
                    <div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                        backgroundSize: "20px 20px",
                        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                      }}
                    ></div>
                    <img
                      src={processedUrl}
                      alt="Processed"
                      className="relative w-full rounded-lg"
                    />
                  </div>
                  <button
                    onClick={downloadProcessed}
                    className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    下载处理后图片
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                智能识别
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI 自动识别主体和背景
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                快速处理
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                几秒钟完成背景移除
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                高质量输出
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                保持边缘细节清晰
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
