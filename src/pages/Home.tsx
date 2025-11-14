import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';
import ResultDisplay from '../components/ResultDisplay';

export default function Home() {
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = async (result: any) => {
    setUploadResult(result);
    setIsAnalyzing(true);
    
    try {
      // 模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 获取分析结果
      const response = await fetch(`/api/upload/analysis/${result.imageId}`);
      const analysisData = await response.json();
      
      if (analysisData.success) {
        setAnalysisResult(analysisData.data);
      }
    } catch (error) {
      console.error('分析失败:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🦷</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">智能牙齿分析系统</h1>
            </div>
            <nav className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900">首页</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">历史记录</a>
              <a href="/evolution" className="text-gray-600 hover:text-gray-900">自我进化</a>
              <a href="/pitchdeck" className="text-gray-600 hover:text-gray-900">项目展示</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">帮助</a>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!uploadResult ? (
          // 上传界面
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                上传牙齿照片，获取专业分析
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                使用先进的AI技术，自动识别牙齿问题，评估口腔健康状况，
                提供个性化的护理建议。
              </p>
            </div>
            
            <ImageUpload onImageUpload={handleImageUpload} />
          </div>
        ) : (
          // 结果界面
          <div className="space-y-8">
            {isAnalyzing ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-3 text-lg text-gray-600">
                  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>AI正在分析您的牙齿图像，请稍候...</span>
                </div>
              </div>
            ) : analysisResult ? (
              <ResultDisplay 
                result={analysisResult}
                originalImage={uploadResult.originalImage}
                processedImage={uploadResult.processedImage}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-red-600">分析失败，请重试</p>
              </div>
            )}
            
            {!isAnalyzing && (
              <div className="text-center">
                <button
                  onClick={() => {
                    setUploadResult(null);
                    setAnalysisResult(null);
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  重新上传
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 底部信息 */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              ⚠️ 重要提示：本系统提供的分析结果仅供参考，不能替代专业牙医的诊断。
            </p>
            <p className="text-sm text-gray-500">
              如有口腔问题，请及时咨询专业牙医。我们严格保护您的隐私，上传的图像仅用于分析。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}