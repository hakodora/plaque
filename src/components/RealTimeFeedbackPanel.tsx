import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertCircle, CheckCircle, Info, X, Zap, 
  Clock, TrendingUp, Cpu, Activity, Database,
  Play, Pause, Trash2, Filter, Settings, Bell
} from 'lucide-react';
import { FeedbackMessage, OptimizationSuggestion } from '../../api/services/realTimeFeedback';

interface RealTimeFeedbackPanelProps {
  feedbackSystem: any;
}

export default function RealTimeFeedbackPanel({ feedbackSystem }: RealTimeFeedbackPanelProps) {
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy' as 'healthy' | 'warning' | 'critical',
    score: 100,
    issues: [] as string[],
    recommendations: [] as string[]
  });
  const [isActive, setIsActive] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!feedbackSystem) return;

    const handleNewFeedback = (message: FeedbackMessage) => {
      setFeedbackMessages(prev => [message, ...prev].slice(0, 100));
    };

    const handleNewSuggestion = (suggestion: OptimizationSuggestion) => {
      setOptimizationSuggestions(prev => [suggestion, ...prev].slice(0, 50));
    };

    const handleFeedbackCleared = () => {
      setFeedbackMessages([]);
    };

    const handleSuggestionsCleared = () => {
      setOptimizationSuggestions([]);
    };

    feedbackSystem.on('new-feedback', handleNewFeedback);
    feedbackSystem.on('new-suggestion', handleNewSuggestion);
    feedbackSystem.on('feedback-cleared', handleFeedbackCleared);
    feedbackSystem.on('suggestions-cleared', handleSuggestionsCleared);

    return () => {
      feedbackSystem.off('new-feedback', handleNewFeedback);
      feedbackSystem.off('new-suggestion', handleNewSuggestion);
      feedbackSystem.off('feedback-cleared', handleFeedbackCleared);
      feedbackSystem.off('suggestions-cleared', handleSuggestionsCleared);
    };
  }, [feedbackSystem]);

  useEffect(() => {
    if (!feedbackSystem || !autoRefresh) return;

    const interval = setInterval(() => {
      updateSystemStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [feedbackSystem, autoRefresh]);

  const updateSystemStatus = useCallback(() => {
    if (!feedbackSystem) return;

    const health = feedbackSystem.getSystemHealth();
    setSystemHealth(health);

    const messages = feedbackSystem.getFeedbackMessages(
      filterCategory === 'all' ? undefined : filterCategory,
      filterSeverity === 'all' ? undefined : filterSeverity,
      50
    );
    setFeedbackMessages(messages);

    const suggestions = feedbackSystem.getOptimizationSuggestions(undefined, undefined, 20);
    setOptimizationSuggestions(suggestions);
  }, [feedbackSystem, filterCategory, filterSeverity]);

  const handleStartStop = () => {
    if (!feedbackSystem) return;

    if (isActive) {
      feedbackSystem.stop();
      setIsActive(false);
    } else {
      feedbackSystem.start();
      setIsActive(true);
    }
  };

  const handleClearMessages = () => {
    if (!feedbackSystem) return;
    feedbackSystem.clearFeedbackMessages();
  };

  const handleClearSuggestions = () => {
    if (!feedbackSystem) return;
    feedbackSystem.clearOptimizationSuggestions();
  };

  const handleExecuteAction = async (messageId: string) => {
    if (!feedbackSystem) return;

    try {
      await feedbackSystem.executeAction(messageId);
    } catch (error) {
      console.error('执行操作失败:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'optimization':
        return <Zap className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <TrendingUp className="w-4 h-4" />;
      case 'accuracy':
        return <CheckCircle className="w-4 h-4" />;
      case 'speed':
        return <Activity className="w-4 h-4" />;
      case 'memory':
        return <Database className="w-4 h-4" />;
      case 'model':
        return <Cpu className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 1) return 'border-red-500 bg-red-50';
    if (priority <= 2) return 'border-yellow-500 bg-yellow-50';
    return 'border-blue-500 bg-blue-50';
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return timestamp.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="w-6 h-6 mr-2" />
            实时反馈系统
          </h2>
          <p className="text-gray-600 mt-1">智能监控和优化建议</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 系统健康状态 */}
          <div className={`px-3 py-2 rounded-lg border ${getHealthColor(systemHealth.status)}`}>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span className="font-semibold">
                系统健康: {systemHealth.score}%
              </span>
            </div>
          </div>

          {/* 控制按钮 */}
          <button
            onClick={handleStartStop}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? '停止监控' : '开始监控'}</span>
          </button>
        </div>
      </div>

      {/* 系统状态概览 */}
      {systemHealth.issues.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">系统问题</h3>
          <ul className="space-y-1">
            {systemHealth.issues.map((issue, index) => (
              <li key={index} className="text-yellow-700 text-sm flex items-center">
                <AlertCircle className="w-3 h-3 mr-2" />
                {issue}
              </li>
            ))}
          </ul>
          
          {systemHealth.recommendations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-1">建议</h4>
              <ul className="space-y-1">
                {systemHealth.recommendations.map((rec, index) => (
                  <li key={index} className="text-yellow-600 text-sm">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 过滤器 */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">所有类别</option>
            <option value="performance">性能</option>
            <option value="accuracy">准确性</option>
            <option value="speed">速度</option>
            <option value="memory">内存</option>
            <option value="model">模型</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">所有级别</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoRefresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="autoRefresh" className="text-sm text-gray-600">
            自动刷新
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showSuggestions"
            checked={showSuggestions}
            onChange={(e) => setShowSuggestions(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="showSuggestions" className="text-sm text-gray-600">
            显示优化建议
          </label>
        </div>

        <button
          onClick={handleClearMessages}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>清空消息</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 反馈消息 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">实时反馈</h3>
            <span className="text-sm text-gray-500">
              {feedbackMessages.length} 条消息
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {feedbackMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无反馈消息</p>
                <p className="text-sm">{isActive ? '系统正在监控中...' : '请启动监控系统'}</p>
              </div>
            ) : (
              feedbackMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    message.type === 'error' ? 'bg-red-50 border-red-500' :
                    message.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    message.type === 'optimization' ? 'bg-green-50 border-green-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getTypeIcon(message.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm">{message.title}</span>
                          <span className="text-xs text-gray-500">
                            {getCategoryIcon(message.category)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{message.message}</p>
                        {message.severity && (
                          <div className="flex items-center mt-2">
                            {getSeverityIcon(message.severity)}
                            <span className="text-xs text-gray-600 ml-1">
                              级别: {message.severity === 'high' ? '高' : message.severity === 'medium' ? '中' : '低'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {message.actionable && message.action && (
                      <button
                        onClick={() => handleExecuteAction(message.id)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        {message.action.label}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 优化建议 */}
        {showSuggestions && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">优化建议</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {optimizationSuggestions.length} 条建议
                </span>
                <button
                  onClick={handleClearSuggestions}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {optimizationSuggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无优化建议</p>
                  <p className="text-sm">系统运行良好</p>
                </div>
              ) : (
                optimizationSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`p-4 rounded-lg border-2 ${getPriorityColor(suggestion.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-green-500" />
                        <span className="font-semibold text-sm">{suggestion.title}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        suggestion.type === 'immediate' ? 'bg-red-100 text-red-800' :
                        suggestion.type === 'short-term' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {suggestion.type === 'immediate' ? '立即' :
                         suggestion.type === 'short-term' ? '短期' : '长期'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
                    
                    {suggestion.expectedImpact && Object.keys(suggestion.expectedImpact).length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-600 mb-1">预期影响:</h5>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.expectedImpact.performance && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              性能 +{suggestion.expectedImpact.performance}%
                            </span>
                          )}
                          {suggestion.expectedImpact.accuracy && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              准确性 +{suggestion.expectedImpact.accuracy}%
                            </span>
                          )}
                          {suggestion.expectedImpact.speed && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              速度 +{suggestion.expectedImpact.speed}%
                            </span>
                          )}
                          {suggestion.expectedImpact.memory && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                              内存 -{suggestion.expectedImpact.memory}%
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <h5 className="text-xs font-semibold text-gray-600 mb-1">实施步骤:</h5>
                      <ol className="text-xs text-gray-600 space-y-1">
                        {suggestion.implementation.steps.map((step, index) => (
                          <li key={index} className="flex items-start">
                            <span className="font-mono text-blue-500 mr-2">{index + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>复杂度: {suggestion.implementation.complexity}</span>
                        <span>预计时间: {suggestion.implementation.estimatedTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>优先级: {suggestion.priority}</span>
                      </div>
                    </div>
                    
                    {suggestion.risks.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <h5 className="text-xs font-semibold text-red-600 mb-1">风险:</h5>
                        <ul className="text-xs text-red-600 space-y-1">
                          {suggestion.risks.map((risk, index) => (
                            <li key={index} className="flex items-start">
                              <AlertCircle className="w-3 h-3 mr-1 mt-0.5" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}