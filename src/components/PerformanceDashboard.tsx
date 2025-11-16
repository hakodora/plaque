import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  Activity, TrendingUp, TrendingDown, AlertCircle, 
  CheckCircle, Clock, Cpu, Database, Zap,
  BarChart3, PieChart, Radar as RadarIcon, Eye
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceDashboardProps {
  performanceMonitor: any;
  modelEvaluator: any;
}

export default function PerformanceDashboard({ performanceMonitor, modelEvaluator }: PerformanceDashboardProps) {
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [performanceReport, setPerformanceReport] = useState<any>(null);
  const [modelInsights, setModelInsights] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'system' | 'analysis'>('overview');

  useEffect(() => {
    // 模拟实时数据更新
    const interval = setInterval(() => {
      if (performanceMonitor) {
        setRealTimeMetrics(performanceMonitor.getRealTimeMetrics());
        setPerformanceReport(performanceMonitor.getPerformanceReport());
      }
      
      if (modelEvaluator) {
        const recentEvaluations = modelEvaluator.getEvaluationHistory();
        setModelInsights(modelEvaluator.generateModelInsights(recentEvaluations));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [performanceMonitor, modelEvaluator]);

  // 系统性能趋势图数据
  const systemTrendData = {
    labels: ['1分钟前', '45秒前', '30秒前', '15秒前', '现在'],
    datasets: [
      {
        label: 'CPU使用率 (%)',
        data: [45, 52, 48, 55, realTimeMetrics?.cpu?.percentage || 50],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: '内存使用 (MB)',
        data: [120, 125, 118, 130, realTimeMetrics ? realTimeMetrics.memory.heapUsed / 1024 / 1024 : 125],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // 模型性能雷达图数据
  const modelRadarData = {
    labels: ['准确性', '推理速度', '内存效率', '置信度', '稳定性', '可扩展性'],
    datasets: [
      {
        label: '当前模型',
        data: [
          modelInsights ? modelInsights.strengths.includes('高准确性') ? 90 : 70 : 75,
          modelInsights ? modelInsights.strengths.includes('快速推理') ? 85 : 60 : 70,
          modelInsights ? modelInsights.strengths.includes('内存使用合理') ? 80 : 50 : 65,
          75, 70, 80
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
      },
      {
        label: '目标性能',
        data: [95, 90, 85, 90, 85, 90],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        pointBackgroundColor: 'rgb(34, 197, 94)',
      }
    ]
  };

  // 操作性能柱状图数据
  const operationData = {
    labels: Object.keys(performanceReport?.operations || {}),
    datasets: [
      {
        label: '平均耗时 (ms)',
        data: Object.values(performanceReport?.operations || {}).map((op: any) => op.avgDuration),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: '成功率 (%)',
        data: Object.values(performanceReport?.operations || {}).map((op: any) => op.successRate),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      }
    ]
  };

  // 模型准确性饼图数据
  const accuracyData = {
    labels: ['高准确性 (>90%)', '中等准确性 (70-90%)', '低准确性 (<70%)'],
    datasets: [
      {
        data: [45, 35, 20],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI性能分析仪表板</h1>
          <p className="text-gray-600">实时监控系统性能和AI模型效果</p>
        </div>

        {/* 实时指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU使用率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {realTimeMetrics?.cpu?.percentage?.toFixed(1) || 0}%
                </p>
              </div>
              <Cpu className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${realTimeMetrics?.cpu?.percentage || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">内存使用</p>
                <p className="text-2xl font-bold text-gray-900">
                  {realTimeMetrics ? (realTimeMetrics.memory.heapUsed / 1024 / 1024).toFixed(0) : 0} MB
                </p>
              </div>
              <Database className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${realTimeMetrics ? 
                      (realTimeMetrics.memory.heapUsed / realTimeMetrics.memory.heapTotal) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃连接</p>
                <p className="text-2xl font-bold text-gray-900">
                  {realTimeMetrics?.activeConnections || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">运行时间</p>
                <p className="text-2xl font-bold text-gray-900">
                  {realTimeMetrics ? Math.floor(realTimeMetrics.uptime / 1000 / 60) : 0} 分钟
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: '总览', icon: PieChart },
                { id: 'models', label: '模型分析', icon: RadarIcon },
                { id: 'system', label: '系统性能', icon: BarChart3 },
                { id: 'analysis', label: '深度分析', icon: Eye }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 总览标签 */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                      系统性能趋势
                    </h3>
                    <Line data={systemTrendData} options={chartOptions} />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <PieChart className="w-5 h-5 mr-2 text-green-500" />
                      模型准确性分布
                    </h3>
                    <Doughnut data={accuracyData} options={{ responsive: true }} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">模型性能概览</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">平均推理时间</span>
                        <span className="font-semibold">
                          {performanceReport?.models?.avgInferenceTime || 0}ms
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">平均准确性</span>
                        <span className="font-semibold">
                          {(performanceReport?.models?.avgAccuracy * 100 || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">平均置信度</span>
                        <span className="font-semibold">
                          {(performanceReport?.models?.avgConfidence * 100 || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">内存使用</span>
                        <span className="font-semibold">
                          {performanceReport?.models?.avgMemoryUsage || 0}MB
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">优化建议</h3>
                    <div className="space-y-2">
                      {performanceReport?.recommendations?.slice(0, 3).map((rec: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span className="text-sm text-gray-700">{rec}</span>
                        </div>
                      )) || (
                        <div className="text-sm text-gray-500">暂无优化建议</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 模型分析标签 */}
            {activeTab === 'models' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <RadarIcon className="w-5 h-5 mr-2 text-purple-500" />
                    模型性能雷达图
                  </h3>
                  <Radar data={modelRadarData} options={radarOptions} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-green-600">模型优势</h4>
                    <div className="space-y-2">
                      {modelInsights?.strengths?.map((strength: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{strength}</span>
                        </div>
                      )) || (
                        <div className="text-sm text-gray-500">暂无数据</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-red-600">需要改进</h4>
                    <div className="space-y-2">
                      {modelInsights?.weaknesses?.map((weakness: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm">{weakness}</span>
                        </div>
                      )) || (
                        <div className="text-sm text-gray-500">暂无数据</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-blue-600">优化机会</h4>
                  <div className="space-y-2">
                    {modelInsights?.optimizationOpportunities?.map((opportunity: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-blue-500 mt-0.5" />
                        <span className="text-sm">{opportunity}</span>
                      </div>
                    )) || (
                      <div className="text-sm text-gray-500">暂无优化建议</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 系统性能标签 */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">操作性能分析</h3>
                  <Bar data={operationData} options={chartOptions} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">系统资源使用</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU使用率</span>
                          <span>{realTimeMetrics?.cpu?.percentage?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${realTimeMetrics?.cpu?.percentage || 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>内存使用率</span>
                          <span>
                            {realTimeMetrics ? 
                              ((realTimeMetrics.memory.heapUsed / realTimeMetrics.memory.heapTotal) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${realTimeMetrics ? 
                                (realTimeMetrics.memory.heapUsed / realTimeMetrics.memory.heapTotal) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">队列状态</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">队列长度</span>
                        <span className="font-semibold">{realTimeMetrics?.queueLength || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">活跃连接</span>
                        <span className="font-semibold">{realTimeMetrics?.activeConnections || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">系统运行时间</span>
                        <span className="font-semibold">
                          {realTimeMetrics ? Math.floor(realTimeMetrics.uptime / 1000 / 60) : 0} 分钟
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 深度分析标签 */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-500" />
                    智能分析洞察
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">性能趋势</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span>模型准确性在过去24小时提升 2.3%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="w-4 h-4 text-red-500" />
                          <span>推理速度下降 5.1%，需要优化</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>系统稳定性良好，无异常崩溃</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">预测建议</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <span>建议在低峰时段进行模型更新</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Zap className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span>考虑启用模型缓存以提升响应速度</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Database className="w-4 h-4 text-purple-500 mt-0.5" />
                          <span>建议清理过期分析数据，释放存储空间</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">自动化优化建议</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">模型参数调优</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            基于最近性能数据，建议调整学习率至 0.001，批大小调整至 32
                          </p>
                        </div>
                        <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                          应用
                        </button>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded border-l-4 border-green-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">缓存策略优化</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            建议启用智能缓存，可预期提升响应速度 15-20%
                          </p>
                        </div>
                        <button className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
                          启用
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}