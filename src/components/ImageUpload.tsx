import { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImageUpload: (result: any) => void;
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: '请上传图片文件' };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: '文件大小不能超过10MB' };
    }
    return { valid: true };
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success('图像上传成功！');
        onImageUpload(result.data);
      } else {
        toast.error(result.error || '上传失败');
      }
    } catch (error) {
      toast.error('上传失败，请重试');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validation = validateFile(file);
    
    if (!validation.valid) {
      toast.error(validation.error!);
      return;
    }

    await uploadImage(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    await handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-600">正在上传和处理图像...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                拖拽图片到此处，或点击选择文件
              </p>
              <p className="text-sm text-gray-500">
                支持 JPG、PNG、GIF 格式，文件大小不超过 10MB
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={isUploading}
            >
              选择文件
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">拍摄建议：</p>
            <ul className="space-y-1 text-blue-600">
              <li>• 确保光线充足，避免阴影</li>
              <li>• 嘴巴张开，尽量露出所有牙齿</li>
              <li>• 保持相机稳定，图像清晰</li>
              <li>• 正面拍摄，角度正确</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}