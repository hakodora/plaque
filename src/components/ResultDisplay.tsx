import { useState } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AnalysisResult {
  imageId: string;
  segmentation: {
    teethCount: number;
    gumArea: number;
    segmentationMask: string;
  };
  teethDetection: Array<{
    id: string;
    number: string;
    name: string;
    position: { x: number; y: number; width: number; height: number };
    confidence: number;
  }>;
  diseaseAnalysis: {
    plaqueLevel: 'low' | 'moderate' | 'high';
    plaquePercentage: number;
    cariesRisk: 'low' | 'moderate' | 'high';
    tartarLevel: 'minimal' | 'moderate' | 'severe';
    gumInflammation: 'none' | 'mild' | 'moderate' | 'severe';
    overallScore: number;
    recommendations: string[];
  };
  timestamp: string;
}

interface ResultDisplayProps {
  result: AnalysisResult;
  originalImage: string;
  processedImage: string;
}

export default function ResultDisplay({ result, originalImage, processedImage }: ResultDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'teeth' | 'disease'>('overview');

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': case 'minimal': case 'none':
        return 'text-green-600 bg-green-50';
      case 'moderate': case 'mild':
        return 'text-yellow-600 bg-yellow-50';
      case 'high': case 'severe':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 图像对比 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">图像对比</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">原始图像</h4>
            <img 
              src={originalImage} 
              alt="原始牙齿图像" 
              className="w-full h-64 object-contain rounded-lg border"
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">处理后图像</h4>
            <img 
              src={processedImage} 
              alt="处理后牙齿图像" 
              className="w-full h-64 object-contain rounded-lg border"
            />
          </div>
        </div>
      </div>

      {/* 总体评分 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">口腔健康评分</h3>
            <p className="text-sm text-gray-600">基于AI分析的综合评估</p>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(result.diseaseAnalysis.overallScore)}`}>
            {result.diseaseAnalysis.overallScore}/10
          </div>
        </div>
        
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              result.diseaseAnalysis.overallScore >= 8 ? 'bg-green-500' :
              result.diseaseAnalysis.overallScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${result.diseaseAnalysis.overallScore * 10}%` }}
          />
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: '总览' },
              { id: 'teeth', label: '牙齿检测' },
              { id: 'disease', label: '疾病分析' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* 总览标签 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.segmentation.teethCount}</div>
                  <div className="text-sm text-gray-600">检测到的牙齿</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.segmentation.gumArea}%</div>
                  <div className="text-sm text-gray-600">牙龈覆盖率</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{result.diseaseAnalysis.plaquePercentage}%</div>
                  <div className="text-sm text-gray-600">牙菌斑覆盖</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{result.teethDetection.length}</div>
                  <div className="text-sm text-gray-600">识别牙齿数</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">健康建议</h4>
                <div className="space-y-2">
                  {result.diseaseAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 牙齿检测标签 */}
          {activeTab === 'teeth' && (
            <div className="space-y-4">
              <h4 className="font-semibold">检测到的牙齿 ({result.teethDetection.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.teethDetection.map((tooth) => (
                  <div key={tooth.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{tooth.name}</span>
                      <span className="text-sm text-gray-500">#{tooth.number}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>置信度: {(tooth.confidence * 100).toFixed(1)}%</div>
                      <div>位置: ({tooth.position.x}, {tooth.position.y})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 疾病分析标签 */}
          {activeTab === 'disease' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">风险评估</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">牙菌斑等级</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(result.diseaseAnalysis.plaqueLevel)}`}>
                        {result.diseaseAnalysis.plaqueLevel === 'low' ? '低' :
                         result.diseaseAnalysis.plaqueLevel === 'moderate' ? '中' : '高'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">龋齿风险</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(result.diseaseAnalysis.cariesRisk)}`}>
                        {result.diseaseAnalysis.cariesRisk === 'low' ? '低' :
                         result.diseaseAnalysis.cariesRisk === 'moderate' ? '中' : '高'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">牙结石程度</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(result.diseaseAnalysis.tartarLevel)}`}>
                        {result.diseaseAnalysis.tartarLevel === 'minimal' ? '轻微' :
                         result.diseaseAnalysis.tartarLevel === 'moderate' ? '中等' : '严重'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">牙龈炎症</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(result.diseaseAnalysis.gumInflammation)}`}>
                        {result.diseaseAnalysis.gumInflammation === 'none' ? '无' :
                         result.diseaseAnalysis.gumInflammation === 'mild' ? '轻度' :
                         result.diseaseAnalysis.gumInflammation === 'moderate' ? '中度' : '重度'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">详细数据</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">牙菌斑覆盖率</span>
                      <span className="font-medium">{result.diseaseAnalysis.plaquePercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-900">专业建议</h5>
                    <p className="text-sm text-blue-800 mt-1">
                      基于AI分析结果，建议您咨询专业牙医进行进一步检查和诊断。
                      本分析结果仅供参考，不能替代专业医疗建议。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}