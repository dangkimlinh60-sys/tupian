"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

export default function RecognizePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult("");
      setError("");
    } else {
      setError("请上传有效的图片文件！");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 拖拽处理
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  // 将图片转换为 Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // 移除 data:image/xxx;base64, 前缀
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const recognizeImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError("");

    try {
      // 转换图片为 Base64
      const base64Image = await fileToBase64(selectedFile);

      // 获取图片格式
      const imageFormat = selectedFile.type.split('/')[1]; // 例如: jpeg, png, webp

      // 调用后端 API
      const response = await fetch('/api/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          imageFormat: imageFormat
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API 错误: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.content) {
        setResult(data.content);
      } else {
        throw new Error('无法获取识别结果');
      }

    } catch (err) {
      console.error("识别失败:", err);
      setError(err instanceof Error ? err.message : "识别失败，请重试");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setResult("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8">
              <p className="text-sm text-red-800 dark:text-red-200">
                ❌ {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Upload & Preview */}
            <div>
              {/* Upload Area */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    dragActive
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-orange-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="text-6xl mb-4">
                      {dragActive ? "📥" : "📷"}
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {dragActive ? "松开鼠标上传" : "点击或拖拽上传图片"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      支持 JPG、PNG、WebP 等格式
                    </p>
                    {selectedFile && (
                      <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                        已选择: {selectedFile.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>📷</span>
                      预览图片
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="relative mb-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-auto"
                      />
                    </div>
                    {!result && (
                      <div className="space-y-3">
                        <button
                          onClick={recognizeImage}
                          disabled={isProcessing}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              识别中...
                            </>
                          ) : (
                            <>
                              <span>🔍</span>
                              开始识别
                            </>
                          )}
                        </button>
                        <button
                          onClick={resetAll}
                          className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                          重新选择
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Results */}
            {result && (
              <div className="space-y-6">
                {/* AI Recognition Result */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>✨</span>
                      AI 识别结果
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {result}
                      </p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(result)}
                      className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span>📋</span>
                      复制识别结果
                    </button>
                  </div>
                </div>

                {/* Re-analyze Button */}
                <button
                  onClick={resetAll}
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
