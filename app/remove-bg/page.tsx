"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

export default function RemoveBgPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedUrl("");
      setProcessedBlob(null);
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

  const removeBackground = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image_file", selectedFile);
      formData.append("size", "auto");

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": "vYri9ZKsy7UDEfBtqNb7UbSL",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.title || `API 错误: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setProcessedBlob(blob);
    } catch (err) {
      console.error("去除背景失败:", err);
      setError(err instanceof Error ? err.message : "去除背景失败，请重试");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProcessed = () => {
    if (!processedBlob || !selectedFile) return;

    const a = document.createElement("a");
    a.href = processedUrl;

    // 保持原始文件名，添加 no-bg 前缀
    const originalName = selectedFile.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    a.download = `no-bg_${nameWithoutExt}.png`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setProcessedUrl("");
    setProcessedBlob(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8">
              <p className="text-sm text-red-800 dark:text-red-200">
                ❌ {error}
              </p>
            </div>
          )}

          {/* Upload Area */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-purple-400"
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
                  {dragActive ? "📥" : "🖼️"}
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {dragActive ? "松开鼠标上传" : "点击或拖拽上传图片"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  支持 JPG、PNG、WebP 等格式
                </p>
                {selectedFile && (
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                    已选择: {selectedFile.name}
                  </p>
                )}
              </label>
            </div>
          </div>

          {/* Process Button */}
          {selectedFile && !processedUrl && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  准备就绪
                </h2>
                <button
                  onClick={resetAll}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  重新选择
                </button>
              </div>
              <button
                onClick={removeBackground}
                disabled={isProcessing}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    处理中...
                  </>
                ) : (
                  <>
                    <span>✂️</span>
                    开始去除背景
                  </>
                )}
              </button>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>📷</span>
                    原始图片
                  </h3>
                </div>
                <div className="p-6">
                  <div className="relative mb-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">文件名</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate ml-2">
                        {selectedFile?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">文件类型</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedFile?.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processed */}
              {processedUrl && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>✨</span>
                      去除背景后
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="relative mb-4 rounded-lg overflow-hidden">
                      {/* Checkered background to show transparency */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                          backgroundSize: "20px 20px",
                          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                        }}
                      ></div>
                      <img
                        src={processedUrl}
                        alt="Processed"
                        className="relative w-full h-auto"
                      />
                    </div>

                    {/* Success Message */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎉</span>
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          背景去除成功！
                        </span>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        图片背景已成功移除，现在可以下载透明背景的图片了
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={downloadProcessed}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <span>⬇️</span>
                        下载透明背景图片
                      </button>
                      <button
                        onClick={resetAll}
                        className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      >
                        处理新图片
                      </button>
                    </div>
                  </div>
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
