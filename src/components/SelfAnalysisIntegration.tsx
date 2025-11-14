import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, TrendingUp, AlertCircle, CheckCircle, 
  Clock, Zap, Settings, Play, Pause, RotateCcw,
  BarChart3, Activity, Cpu, Memory, Eye
} from 'lucide-react';
import PerformanceDashboard from './PerformanceDashboard';
import Enhanced3DVisualization from './Enhanced3DVisualization';
import RealTimeFeedbackPanel from './RealTimeFeedbackPanel';

interface SelfAnalysisIntegrationProps {
  performanceMonitor: any;
  modelEvaluator: any;
  feedbackSystem: any;
  continuousLearning: any;
}

export default function SelfAnalysisIntegration({ 
  performanceMonitor, 
  modelEvaluator, 
  feedbackSystem,
  continuousLearning
}: SelfAnalysisIntegrationProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'visualization' | 'feedback' | 'learning'>('overview');
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    performance: { status: 'healthy', score: 95 },
    models: { status: 'healthy', score: 88 },
    learning: { status: 'healthy', score: 92 },
    overall: { status: 'healthy', score: 91 }
  });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [optimizationMetrics, setOptimizationMetrics] = useState({
    totalImprovements: 0,
    accuracyGain: 0,
    speedImprovement: 0,
    memoryReduction: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSystemActive) {
      startSystem();
    } else {
      stopSystem();
    }
  }, [isSystemActive]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startSystem = () => {
    // 启动所有子系统
    if (performanceMonitor) performanceMonitor.start();
    if (modelEvaluator) modelEvaluator.start();
    if (feedbackSystem) feedbackSystem.start();
    if (continuousLearning) continuousLearning.start();

    // 定期更新系统状态
    intervalRef.current = setInterval(() => {
      updateSystemStatus();
    }, 10000);

    // 立即更新一次状态
    updateSystemStatus();
  };

  const stopSystem = () => {
    // 停止所有子系统
    if (performanceMonitor) performanceMonitor.stop();
    if (modelEvaluator) modelEvaluator.stop();
    if (feedbackSystem) feedbackSystem.stop();
    if (continuousLearning) continuousLearning.stop();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const updateSystemStatus = () => {
    // 更新性能状态
    const performanceReport = performanceMonitor?.getPerformanceReport();
    const performanceScore = calculatePerformanceScore(performanceReport);
    
    // 更新模型状态
    const modelHealth = modelEvaluator?.getEvaluationHistory() || [];
    const modelScore = calculateModelScore(modelHealth);
    
    // 更新学习状态
    const learningStats = continuousLearning?.getLearningStatistics() || {};
    const learningScore = calculateLearningScore(learningStats);
    
    // 计算总体状态
    const overallScore = Math.round((performanceScore + modelScore + learningScore) / 3);

    setSystemStatus({
      performance: {
        status: getStatusFromScore(performanceScore),
        score: performanceScore
      },
      models: {
        status: getStatusFromScore(modelScore),
        score: modelScore
      },
      learning: {
        status: getStatusFromScore(learningScore),
        score: learningScore
      },
      overall: {
        status: getStatusFromScore(overallScore),
        score: overallScore
      }
    });

    // 更新最近的警报
    updateRecentAlerts();
    
    // 更新优化指标
    updateOptimizationMetrics();
  };

  const calculatePerformanceScore = (report: any): number => {
    if (!report) return 0;
    
    let score = 100;
    
    // 基于响应时间扣分
    if (report.operations) {
      const avgResponseTime = Object.values(report.operations as any)
        .reduce((sum: number, op: any) => sum + op.avgDuration, 0) / Object.keys(report.operations).length;
      
      if (avgResponseTime > 1000) score -= 20;
      else if (avgResponseTime > 500) score -= 10;
    }
    
    // 基于内存使用扣分
    if (report.models?.avgMemoryUsage > 500) score -= 15;
    else if (report.models?.avgMemoryUsage > 300) score -= 8;
    
    return Math.max(0, score);
  };

  const calculateModelScore = (evaluations: any[]): number => {
    if (!evaluations || evaluations.length === 0) return 0;
    
    const recentEvaluations = evaluations.slice(-10);
    const avgAccuracy = recentEvaluations.reduce((sum, eval) => sum + eval.accuracy, 0) / recentEvaluations.length;
    
    return Math.round(avgAccuracy * 100);
  };

  const calculateLearningScore = (stats: any): number => {
    if (!stats || !stats.totalSamples) return 0;
    
    let score = 100;
    
    // 基于平均准确率
    if (stats.avgAccuracy < 0.7) score -= 30;
    else if (stats.avgAccuracy < 0.8) score -= 15;
    
    // 基于样本数量
    if (stats.totalSamples < 100) score -= 20;
    else if (stats.totalSamples < 500) score -= 10;
    
    return Math.max(0, score);
  };

  const getStatusFromScore = (score: number): 'healthy' | 'warning' | 'critical' => {
    if (score >= 80) return 'healthy';
    if (score >= 60) return 'warning';
    return 'critical';
  };

  const updateRecentAlerts = () => {
    if (!feedbackSystem) return;
    
    const messages = feedbackSystem.getFeedbackMessages(undefined, 'high', 5);
    setRecentAlerts(messages);
  };

  const updateOptimizationMetrics = () => {
    // 模拟优化指标的累积
    setOptimizationMetrics(prev => ({
      totalImprovements: prev.totalImprovements + Math.floor(Math.random() * 3),
      accuracyGain: Math.min(15, prev.accuracyGain + Math.random() * 0.5),
      speedImprovement: Math.min(25, prev.speedImprovement + Math.random() * 1),
      memoryReduction: Math.min(20, prev.memoryReduction + Math.random() * 0.8)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'critical': return <AlertCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="w-8 h-8 mr-3 text-blue-500" />
                AI自我分析与优化系统
              </h1>
              <p className="text-gray-600 mt-2">
                智能监控、实时反馈、持续学习与自动优化
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 总体系统状态 */}
              <div className={`px-4 py-3 rounded-lg border ${getStatusColor(systemStatus.overall.status)}`}>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.overall.status)}
                  <div>
                    <div className="font-semibold">系统状态</div>
                    <div className="text-sm">{systemStatus.overall.score}%</div>
                  </div>
                </div>
              </div>
              
              {/* 系统控制 */}
              <button
                onClick={() => setIsSystemActive(!isSystemActive)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isSystemActive 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isSystemActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isSystemActive ? '停止系统' : '启动系统'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 系统状态概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${getStatusColor(systemStatus.performance.status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                性能状态
              </h3>
              <span className="text-2xl font-bold">{systemStatus.performance.score}%</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>响应时间</span>
                <span className={systemStatus.performance.score > 80 ? 'text-green-600' : 'text-red-600'}>
                  {systemStatus.performance.score > 80 ? '正常' : '需优化'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>内存使用</span>
                <span className={systemStatus.performance.score > 70 ? 'text-green-600' : 'text-yellow-600'}>
                  {systemStatus.performance.score > 70 ? '良好' : '偏高'}
                </span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${getStatusColor(systemStatus.models.status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center">
                <Cpu className="w-5 h-5 mr-2" />
                模型状态
              </h3>
              <span className="text-2xl font-bold">{systemStatus.models.score}%</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>准确性</span>
                <span className={systemStatus.models.score > 85 ? 'text-green-600' : 'text-yellow-600'}>
                  {systemStatus.models.score > 85 ? '优秀' : '良好'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>稳定性</span>
                <span className={systemStatus.models.score > 75 ? 'text-green-600' : 'text-red-600'}>
                  {systemStatus.models.score > 75 ? '稳定' : '需关注'}
                </span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${getStatusColor(systemStatus.learning.status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                学习状态
              </h3>
              <span className="text-2xl font-bold">{systemStatus.learning.score}%</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>学习效率</span>
                <span className={systemStatus.learning.score > 80 ? 'text-green-600' : 'text-yellow-600'}>
                  {systemStatus.learning.score > 80 ? '高效' : '正常'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>数据质量</span>
                <span className={systemStatus.learning.score > 75 ? 'text-green-600' : 'text-red-600'}>
                  {systemStatus.learning.score > 75 ? '良好' : '需改善'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 优化指标 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总改进次数</p>
                <p className="text-2xl font-bold text-gray-900">{optimizationMetrics.totalImprovements}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">准确性提升</p>
                <p className="text-2xl font-bold text-gray-900">+{optimizationMetrics.accuracyGain.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">速度提升</p>
                <p className="text-2xl font-bold text-gray-900">+{optimizationMetrics.speedImprovement.toFixed(1)}%</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">内存优化</p>
                <p className="text-2xl font-bold text-gray-900">-{optimizationMetrics.memoryReduction.toFixed(1)}%</p>
              </div>
              <Memory className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* 最近警报 */}
        {recentAlerts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              最近警报
            </h3>
            <div className="space-y-3">
              {recentAlerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <div>
                        <h4 className="font-medium text-red-900">{alert.title}</h4>
                        <p className="text-sm text-red-700">{alert.message}</p>
                      </div>
                    </div>
                    <span className="text-xs text-red-600">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 导航标签 */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: '系统概览', icon: Activity },
              { id: 'performance', label: '性能分析', icon: BarChart3 },
              { id: 'visualization', label: '3D可视化', icon: Eye },
              { id: 'feedback', label: '实时反馈', icon: AlertCircle },
              { id: 'learning', label: '持续学习', icon: Brain }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">系统概览</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">系统特性</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      实时性能监控和分析
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      AI模型效果自动评估
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      智能优化建议生成
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      持续学习和模型改进
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      3D可视化展示
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">运行状态</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">性能监控系统</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        performanceMonitor ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {performanceMonitor ? '运行中' : '未启动'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">模型评估系统</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        modelEvaluator ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {modelEvaluator ? '运行中' : '未启动'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">实时反馈系统</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        feedbackSystem ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {feedbackSystem ? '运行中' : '未启动'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">持续学习系统</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        continuousLearning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {continuousLearning ? '运行中' : '未启动'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && performanceMonitor && modelEvaluator && (
            <PerformanceDashboard 
              performanceMonitor={performanceMonitor}
              modelEvaluator={modelEvaluator}
            />
          )}

          {activeTab === 'visualization' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">3D可视化分析</h3>
              <Enhanced3DVisualization
                segmentationData={{
                  teethMask: [],
                  gumMask: [],
                  boundingBoxes: []
                }}
                teethData={[
                  {
                    id: '1',
                    number: '11',
                    name: '右中切牙',
                    position: { x: 100, y: 100, width: 50, height: 60 },
                    confidence: 0.95,
                    condition: 'healthy'
                  },
                  {
                    id: '2',
                    number: '12',
                    name: '右侧切牙',
                    position: { x: 160, y: 105, width: 45, height: 55 },
                    confidence: 0.88,
                    condition: 'plaque'
                  },
                  {
                    id: '3',
                    number: '21',
                    name: '左中切牙',
                    position: { x: 220, y: 100, width: 50, height: 60 },
                    confidence: 0.92,
                    condition: 'healthy'
                  }
                ]}
              />
            </div>
          )}

          {activeTab === 'feedback' && feedbackSystem && (
            <RealTimeFeedbackPanel feedbackSystem={feedbackSystem} />
          )}

          {activeTab === 'learning' && continuousLearning && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">持续学习系统</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">学习统计</h4>
                  <div className="space-y-4">
                    {(() => {
                      const stats = continuousLearning.getLearningStatistics();
                      return (
                        <>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">总样本数</span>
                            <span className="font-semibold">{stats.totalSamples || 0}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">最近样本</span>
                            <span className="font-semibold">{stats.recentSamples || 0}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">平均准确率</span>
                            <span className="font-semibold">{((stats.avgAccuracy || 0) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">训练迭代</span>
                            <span className="font-semibold">{stats.trainingIteration || 0}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">模型版本</span>
                            <span className="font-semibold">{stats.currentModelVersion || '1.0.0'}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">模型更新历史</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {continuousLearning.getModelUpdates(10).map((update: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">版本 {update.version}</span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            update.deploymentStatus === 'deployed' ? 'bg-green-100 text-green-800' :
                            update.deploymentStatus === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {update.deploymentStatus}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>准确率: {(update.performance.accuracy * 100).toFixed(1)}%</div>
                          <div>训练时间: {update.trainingMetrics.trainingTime}ms</div>
                          <div>训练轮次: {update.trainingMetrics.epochs}</div>
                        </div>
                      </div>
                    ))}
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