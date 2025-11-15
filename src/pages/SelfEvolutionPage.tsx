import React, { useState, useEffect } from 'react';
import EvolutionDashboard from '../components/EvolutionDashboard';
import { Play, Pause, RotateCcw, TrendingUp, Brain, Dna, Activity } from 'lucide-react';

// Evolution system instances (these would be initialized from the backend)
let evolutionManager: any = null;
let adaptiveLearningSystem: any = null;
let evolutionEngine: any = null;
let neatEngine: any = null;
let abTestingFramework: any = null;

export default function SelfEvolutionPage() {
  const [isEvolutionRunning, setIsEvolutionRunning] = useState(false);
  const [evolutionStatus, setEvolutionStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 获取初始状态
    fetchEvolutionStatus();
    
    // 设置定期状态更新
    const interval = setInterval(() => {
      if (isEvolutionRunning) {
        fetchEvolutionStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isEvolutionRunning]);

  const fetchEvolutionStatus = async () => {
    try {
      const response = await fetch('/api/evolution/status');
      if (response.ok) {
        const data = await response.json();
        setEvolutionStatus(data.data);
        setIsEvolutionRunning(data.data?.isRunning || false);
      } else {
        console.error('Failed to fetch evolution status');
      }
    } catch (error) {
      console.error('Error fetching evolution status:', error);
      setError('无法连接到进化系统');
    }
  };

  const handleStartEvolution = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/evolution/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setIsEvolutionRunning(true);
        await fetchEvolutionStatus();
      } else {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          setError(errorData.message || '启动进化系统失败');
        } catch {
          setError(`启动进化系统失败: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error starting evolution:', error);
      setError('启动进化系统时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopEvolution = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/evolution/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setIsEvolutionRunning(false);
        await fetchEvolutionStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.message || '停止进化系统失败');
      }
    } catch (error) {
      console.error('Error stopping evolution:', error);
      setError('停止进化系统时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceCoordination = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/evolution/force-coordination', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        await fetchEvolutionStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.message || '强制协调失败');
      }
    } catch (error) {
      console.error('Error forcing coordination:', error);
      setError('强制协调时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch('/api/evolution/report');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evolution-report-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('导出报告失败');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      setError('导出报告时发生错误');
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 0.8) return 'text-green-600';
    if (health >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (health: number) => {
    if (health >= 0.8) return 'bg-green-100';
    if (health >= 0.6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面标题和控制面板 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Brain className="w-8 h-8 mr-3 text-blue-500" />
                  自我进化系统
                </h1>
                <p className="mt-2 text-gray-600">
                  通过遗传算法、神经架构搜索和自适应学习实现系统的持续自我优化
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={isEvolutionRunning ? handleStopEvolution : handleStartEvolution}
                  disabled={isLoading}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    isEvolutionRunning 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : isEvolutionRunning ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isEvolutionRunning ? '停止进化' : '开始进化'}
                </button>
                
                <button
                  onClick={handleForceCoordination}
                  disabled={isLoading || !isEvolutionRunning}
                  className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                >
                  <Dna className="w-4 h-4 mr-2" />
                  强制协调
                </button>
                
                <button
                  onClick={handleExportReport}
                  disabled={isLoading}
                  className="flex items-center px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  导出报告
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 状态指示器 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* 系统状态概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">系统状态</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isEvolutionRunning ? '运行中' : '已停止'}
                </p>
              </div>
              <div className={`w-4 h-4 rounded-full ${isEvolutionRunning ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">进化阶段</p>
              <p className="text-2xl font-bold text-gray-900">
                {evolutionStatus?.evolutionState?.phase || '初始化'}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">系统健康度</p>
              <p className={`text-2xl font-bold ${getHealthColor(evolutionStatus?.healthStatus?.overall || 0)}`}>
                {((evolutionStatus?.healthStatus?.overall || 0) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">活跃子系统</p>
              <p className="text-2xl font-bold text-gray-900">
                {evolutionStatus?.evolutionState?.activeSystems?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* 进化仪表板 */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <EvolutionDashboard
              adaptiveLearningSystem={adaptiveLearningSystem}
              evolutionEngine={evolutionEngine}
              neatEngine={neatEngine}
              abTestingFramework={abTestingFramework}
            />
          </div>
        </div>

        {/* 系统健康详情 */}
        {evolutionStatus?.healthStatus?.systems && (
          <div className="mt-8 bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">子系统健康状态</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(evolutionStatus.healthStatus.systems).map(([system, health]: [string, any]) => (
                  <div key={system} className={`p-4 rounded-lg ${getHealthBgColor(health)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 capitalize">
                        {system.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`font-bold ${getHealthColor(health)}`}>
                        {(health * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 推荐建议 */}
        {evolutionStatus?.evolutionState?.recommendations && evolutionStatus.evolutionState.recommendations.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">系统优化建议</h3>
              <div className="space-y-2">
                {evolutionStatus.evolutionState.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}