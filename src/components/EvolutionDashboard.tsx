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
  Legend 
} from 'chart.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Activity,
  Brain,
  Dna,
  TestTube,
  Zap,
  Target,
  Award,
  Clock,
  BarChart3,
  PieChart,
  Radar as RadarIcon
} from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend
);

interface EvolutionDashboardProps {
  adaptiveLearningSystem: any;
  evolutionEngine: any;
  neatEngine: any;
  abTestingFramework: any;
}

interface EvolutionMetrics {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  diversity: number;
  convergence: number;
  improvements: number;
}

interface SystemStatus {
  isRunning: boolean;
  currentPhase: string;
  performanceTrend: 'improving' | 'declining' | 'stable';
  improvementStreak: number;
  stagnationCount: number;
}

export default function EvolutionDashboard({ 
  adaptiveLearningSystem, 
  evolutionEngine, 
  neatEngine, 
  abTestingFramework 
}: EvolutionDashboardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [evolutionMetrics, setEvolutionMetrics] = useState<EvolutionMetrics[]>([]);
  const [abTestStatus, setAbTestStatus] = useState<any>(null);
  const [metaLearningMetrics, setMetaLearningMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'evolution' | 'neat' | 'abtesting' | 'metalearning'>('overview');

  useEffect(() => {
    if (adaptiveLearningSystem) {
      setupEventListeners();
      updateMetrics();
    }
  }, [adaptiveLearningSystem]);

  const setupEventListeners = () => {
    // 进化引擎事件
    evolutionEngine?.on('evolution-metrics', (metrics: EvolutionMetrics) => {
      setEvolutionMetrics(prev => [...prev.slice(-49), metrics]);
    });

    // 自适应学习系统事件
    adaptiveLearningSystem?.on('adaptive-response-triggered', (data: any) => {
      console.log('Adaptive response triggered:', data);
    });

    // A/B测试框架事件
    abTestingFramework?.on('test-completed', (data: any) => {
      console.log('A/B test completed:', data);
      updateABTestStatus();
    });
  };

  const updateMetrics = () => {
    if (adaptiveLearningSystem) {
      const status = adaptiveLearningSystem.getAdaptiveLearningStatus();
      setSystemStatus(status);
      setMetaLearningMetrics(status.metaLearningMetrics);
    }

    if (abTestingFramework) {
      updateABTestStatus();
    }
  };

  const updateABTestStatus = () => {
    const status = abTestingFramework.getABTestingStatus();
    setAbTestStatus(status);
  };

  const handleStartStop = async () => {
    if (isRunning) {
      adaptiveLearningSystem?.stopAdaptiveLearning();
      setIsRunning(false);
    } else {
      await adaptiveLearningSystem?.startAdaptiveLearning();
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    // 重置所有系统
    adaptiveLearningSystem?.stopAdaptiveLearning();
    setIsRunning(false);
    setEvolutionMetrics([]);
    setSystemStatus(null);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  const evolutionChartData = {
    labels: evolutionMetrics.map(m => `Gen ${m.generation}`),
    datasets: [
      {
        label: 'Best Fitness',
        data: evolutionMetrics.map(m => m.bestFitness),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Average Fitness',
        data: evolutionMetrics.map(m => m.avgFitness),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }
    ]
  };

  const diversityChartData = {
    labels: evolutionMetrics.map(m => `Gen ${m.generation}`),
    datasets: [
      {
        label: 'Population Diversity',
        data: evolutionMetrics.map(m => m.diversity * 100),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1
      }
    ]
  };

  const metaLearningRadarData = metaLearningMetrics ? {
    labels: ['Learning Velocity', 'Adaptation Efficiency', 'Transfer Effectiveness', 'Experience Utilization'],
    datasets: [
      {
        label: 'Current Performance',
        data: [
          metaLearningMetrics.learningVelocity * 100,
          metaLearningMetrics.adaptationEfficiency * 100,
          metaLearningMetrics.transferEffectiveness * 100,
          metaLearningMetrics.experienceUtilization * 100
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)'
      }
    ]
  } : null;

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* 系统状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">系统状态</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemStatus?.isRunning ? '运行中' : '已停止'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${systemStatus?.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">当前阶段</p>
              <p className="text-2xl font-bold text-gray-900">{systemStatus?.currentPhase || 'N/A'}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">性能趋势</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">
                  {systemStatus?.performanceTrend || 'N/A'}
                </p>
                {systemStatus && getTrendIcon(systemStatus.performanceTrend)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">改进连击</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemStatus?.improvementStreak || 0}
              </p>
            </div>
            <Award className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* 进化图表 */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Dna className="w-5 h-5 mr-2 text-blue-500" />
          进化过程
        </h3>
        <div className="h-64">
          <Line data={evolutionChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* 元学习雷达图 */}
      {metaLearningRadarData && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-500" />
            元学习性能
          </h3>
          <div className="h-64">
            <Radar data={metaLearningRadarData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}
    </div>
  );

  const renderEvolutionTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">适应度进化</h3>
          <div className="h-64">
            <Line data={evolutionChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">种群多样性</h3>
          <div className="h-64">
            <Bar data={diversityChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">进化统计</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {evolutionMetrics.length > 0 ? evolutionMetrics[evolutionMetrics.length - 1].generation : 0}
            </p>
            <p className="text-sm text-gray-600">当前代数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {evolutionMetrics.length > 0 ? (evolutionMetrics[evolutionMetrics.length - 1].bestFitness * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-600">最佳适应度</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {evolutionMetrics.length > 0 ? evolutionMetrics[evolutionMetrics.length - 1].improvements : 0}
            </p>
            <p className="text-sm text-gray-600">改进次数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {evolutionMetrics.length > 0 ? (evolutionMetrics[evolutionMetrics.length - 1].convergence * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-600">收敛度</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNEATTab = () => {
    const neatStatus = neatEngine?.getGeneration ? {
      generation: neatEngine.getGeneration(),
      bestGenome: neatEngine.getBestGenome()
    } : null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">NEAT代数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {neatStatus?.generation || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">最佳基因组适应度</p>
                <p className="text-2xl font-bold text-gray-900">
                  {neatStatus?.bestGenome?.fitness ? (neatStatus.bestGenome.fitness * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Dna className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">架构复杂度</p>
                <p className="text-2xl font-bold text-gray-900">
                  {neatStatus?.bestGenome?.architecture?.layers?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最佳基因组详情</h3>
          {neatStatus?.bestGenome && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">网络架构</h4>
                <div className="mt-2 space-y-2">
                  {neatStatus.bestGenome.architecture.layers.map((layer: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{layer.type}层</span>
                      <span className="text-sm text-gray-600">
                        {layer.units} 单元, {layer.activation}激活
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">学习率</h4>
                  <p className="text-lg font-mono">{neatStatus.bestGenome.architecture.learningRate}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">优化器</h4>
                  <p className="text-lg">{neatStatus.bestGenome.architecture.optimizer}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderABTestingTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <TestTube className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">活跃测试</p>
              <p className="text-2xl font-bold text-gray-900">
                {abTestStatus?.activeTests || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">已完成测试</p>
              <p className="text-2xl font-bold text-gray-900">
                {abTestStatus?.completedTests || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">队列中的测试</p>
              <p className="text-2xl font-bold text-gray-900">
                {abTestStatus?.queuedTests || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <PieChart className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">总样本数</p>
              <p className="text-2xl font-bold text-gray-900">
                {abTestStatus?.totalSamples || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">A/B测试配置</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">测试参数</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>显著性水平:</span>
                <span className="font-mono">0.05</span>
              </div>
              <div className="flex justify-between">
                <span>最小样本数:</span>
                <span className="font-mono">100</span>
              </div>
              <div className="flex justify-between">
                <span>最大并发测试:</span>
                <span className="font-mono">3</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">主要指标</h4>
            <div className="space-y-1 text-sm">
              <div>• 准确性 (accuracy)</div>
              <div>• 响应时间 (response_time)</div>
              <div>• 用户满意度 (user_satisfaction)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMetaLearningTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-500" />
          元学习性能指标
        </h3>
        {metaLearningRadarData && (
          <div className="h-96">
            <Radar data={metaLearningRadarData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">学习经验统计</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">总学习经验</span>
              <span className="text-2xl font-bold text-blue-600">
                {systemStatus?.totalExperiences || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">改进连击</span>
              <span className="text-2xl font-bold text-green-600">
                {systemStatus?.improvementStreak || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">停滞计数</span>
              <span className="text-2xl font-bold text-red-600">
                {systemStatus?.stagnationCount || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">元学习指标详情</h4>
          {metaLearningMetrics && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">学习速度</span>
                <span className="font-bold text-purple-600">
                  {(metaLearningMetrics.learningVelocity * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">适应效率</span>
                <span className="font-bold text-blue-600">
                  {(metaLearningMetrics.adaptationEfficiency * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">迁移效果</span>
                <span className="font-bold text-green-600">
                  {(metaLearningMetrics.transferEffectiveness * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">经验利用率</span>
                <span className="font-bold text-orange-600">
                  {(metaLearningMetrics.experienceUtilization * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 标题和控制面板 */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Dna className="w-8 h-8 mr-3 text-blue-500" />
                自我进化系统控制台
              </h1>
              <p className="text-gray-600 mt-2">
                实时监控系统的自我优化和进化过程
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleStartStop}
                className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                  isRunning 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isRunning ? '停止进化' : '开始进化'}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重置系统
              </button>
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: '总览', icon: Activity },
                { id: 'evolution', label: '进化算法', icon: Dna },
                { id: 'neat', label: 'NEAT', icon: Brain },
                { id: 'abtesting', label: 'A/B测试', icon: TestTube },
                { id: 'metalearning', label: '元学习', icon: RadarIcon }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'evolution' && renderEvolutionTab()}
            {activeTab === 'neat' && renderNEATTab()}
            {activeTab === 'abtesting' && renderABTestingTab()}
            {activeTab === 'metalearning' && renderMetaLearningTab()}
          </div>
        </div>
      </div>
    </div>
  );
}