"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

export default function CompressPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [compressedUrl, setCompressedUrl] = useState<string>("");
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setOriginalSize(file.size);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCompressedUrl("");
      setCompressedBlob(null);
      setCompressedSize(0);
    } else {
      alert("请上传有效的图片文件！");
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

  const compressImage = async () => {
    if (!selectedFile) return;

    setIsCompressing(true);

    try {
      // 创建 canvas 进行压缩
      const img = new Image();
      img.src = previewUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("无法创建 Canvas 上下文");
      }

      // 保持原始尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制图片
      ctx.drawImage(img, 0, 0);

      // 根据原始文件类型选择输出格式
      const outputFormat = selectedFile.type === "image/png" ? "image/png" : "image/jpeg";

      // 转换为 blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setCompressedUrl(url);
            setCompressedBlob(blob);
            setCompressedSize(blob.size);
          } else {
            alert("压缩失败，请重试！");
          }
          setIsCompressing(false);
        },
        outputFormat,
        quality / 100
      );
    } catch (error) {
      console.error("压缩失败:", error);
      alert("压缩失败: " + (error as Error).message);
      setIsCompressing(false);
    }
  };

  const downloadCompressed = () => {
    if (!compressedBlob || !selectedFile) return;

    const a = document.createElement("a");
    a.href = compressedUrl;

    // 保持原始文件扩展名
    const originalName = selectedFile.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    const ext = originalName.substring(originalName.lastIndexOf(".")) || ".jpg";
    a.download = `compressed_${nameWithoutExt}${ext}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setCompressedUrl("");
    setCompressedBlob(null);
    setCompressedSize(0);
    setOriginalSize(0);
    setQuality(80);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const compressionRate = originalSize && compressedSize
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
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
            📦 图片压缩
          </h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Upload Area */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
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
                  {dragActive ? "📥" : "📁"}
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {dragActive ? "松开鼠标上传" : "点击或拖拽上传图片"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  支持 JPG、PNG、GIF、WebP 等格式
                </p>
                {selectedFile && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    已选择: {selectedFile.name}
                  </p>
                )}
              </label>
            </div>
          </div>

          {/* Settings */}
          {selectedFile && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  压缩设置
                </h2>
                {compressedUrl && (
                  <button
                    onClick={resetAll}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    重新开始
                  </button>
                )}
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      压缩质量
                    </label>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>10% (最小)</span>
                    <span>50%</span>
                    <span>100% (最大)</span>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      💡 建议：80-90% 可获得较好的质量和压缩比平衡
                    </p>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    快速预设
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setQuality(60)}
                      className={`py-2 px-4 rounded-lg border-2 transition-all ${
                        quality === 60
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-600 hover:border-blue-300"
                      }`}
                    >
                      <div className="text-sm font-medium">高压缩</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">60%</div>
                    </button>
                    <button
                      onClick={() => setQuality(80)}
                      className={`py-2 px-4 rounded-lg border-2 transition-all ${
                        quality === 80
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-600 hover:border-blue-300"
                      }`}
                    >
                      <div className="text-sm font-medium">平衡</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">80%</div>
                    </button>
                    <button
                      onClick={() => setQuality(95)}
                      className={`py-2 px-4 rounded-lg border-2 transition-all ${
                        quality === 95
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-600 hover:border-blue-300"
                      }`}
                    >
                      <div className="text-sm font-medium">高质量</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">95%</div>
                    </button>
                  </div>
                </div>

                <button
                  onClick={compressImage}
                  disabled={isCompressing}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {isCompressing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      压缩中...
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      开始压缩
                    </>
                  )}
                </button>
              </div>
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
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">文件大小</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatSize(originalSize)}
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

              {/* Compressed */}
              {compressedUrl && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>✨</span>
                      压缩后
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="relative mb-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                      <img
                        src={compressedUrl}
                        alt="Compressed"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">文件大小</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatSize(compressedSize)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">压缩率</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {compressionRate}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">节省空间</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatSize(originalSize - compressedSize)}
                        </span>
                      </div>
                    </div>

                    {/* Compression Stats */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎉</span>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          压缩成功！
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        文件大小减少了 {compressionRate}%，从 {formatSize(originalSize)} 压缩到 {formatSize(compressedSize)}
                      </p>
                    </div>

                    <button
                      onClick={downloadCompressed}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span>⬇️</span>
                      下载压缩图片
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
