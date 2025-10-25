"use client";

import { useState } from "react";
import Link from "next/link";

interface RecognitionResult {
  labels: string[];
  text: string;
  objects: string[];
}

export default function RecognizePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
    }
  };

  const recognizeImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    // 模拟识别过程
    setTimeout(() => {
      // 实际应用中，这里应该调用后端 API 或使用 AI 模型
      // 例如 Google Vision API、Azure Computer Vision 等
      const mockResult: RecognitionResult = {
        labels: ["风景", "自然", "天空", "山脉", "户外"],
        text: "这是一段从图片中识别出的文字内容示例。\n实际应用中需要集成 OCR 服务。",
        objects: ["树木", "建筑物", "道路"],
      };
      setResult(mockResult);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
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
            🔍 图片识别
          </h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Info Banner */}
          <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-8">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              💡 提示：此功能需要集成 AI 视觉识别 API（如 Google Vision、Azure Computer Vision）才能实现真实的图片识别功能。当前为演示版本。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Upload & Preview */}
            <div>
              {/* Upload Area */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-orange-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      点击或拖拽上传图片
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      支持 JPG、PNG 等格式
                    </p>
                  </label>
                </div>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    预览图片
                  </h3>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full rounded-lg mb-4"
                  />
                  {!result && (
                    <button
                      onClick={recognizeImage}
                      disabled={isProcessing}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? "识别中..." : "开始识别"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Results */}
            {result && (
              <div className="space-y-6">
                {/* Labels */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">🏷️</span>
                    图片标签
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.labels.map((label, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Objects */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">🎯</span>
                    识别对象
                  </h3>
                  <ul className="space-y-2">
                    {result.objects.map((obj, index) => (
                      <li
                        key={index}
                        className="flex items-center text-gray-700 dark:text-gray-300"
                      >
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Text Recognition (OCR) */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">📝</span>
                    文字识别 (OCR)
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {result.text}
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.text)}
                    className="mt-3 w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    复制文字
                  </button>
                </div>

                {/* Re-analyze Button */}
                <button
                  onClick={() => {
                    setResult(null);
                    setPreviewUrl("");
                    setSelectedFile(null);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  识别新图片
                </button>
              </div>
            )}
          </div>

          {/* Features */}
          {!previewUrl && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🏷️</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  标签识别
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  自动识别图片内容标签
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  物体检测
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  识别图片中的物体
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  文字提取
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  OCR 识别图片文字
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🌐</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  多语言支持
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  支持多种语言识别
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
