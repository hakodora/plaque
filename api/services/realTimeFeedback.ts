import { EventEmitter } from 'events';
import { PerformanceMonitor } from './performanceMonitor';
import { ModelEvaluationService } from './modelEvaluation';

export interface FeedbackMessage {
  id: string;
  type: 'info' | 'warning' | 'error' | 'optimization';
  category: 'performance' | 'accuracy' | 'speed' | 'memory' | 'model';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: {
    label: string;
    handler: () => Promise<void>;
  };
}

export interface OptimizationSuggestion {
  id: string;
  type: 'immediate' | 'short-term' | 'long-term';
  priority: number;
  title: string;
  description: string;
  expectedImpact: {
    performance?: number;
    accuracy?: number;
    speed?: number;
    memory?: number;
  };
  implementation: {
    complexity: 'low' | 'medium' | 'high';
    estimatedTime: string;
    steps: string[];
  };
  risks: string[];
}

export class RealTimeFeedbackSystem extends EventEmitter {
  private performanceMonitor: PerformanceMonitor;
  private modelEvaluator: ModelEvaluationService;
  private feedbackMessages: FeedbackMessage[] = [];
  private optimizationSuggestions: OptimizationSuggestion[] = [];
  private isActive = false;
  private feedbackInterval: NodeJS.Timeout | null = null;
  private readonly MAX_MESSAGES = 100;
  private readonly FEEDBACK_INTERVAL = 5000; // 5秒

  constructor(performanceMonitor: PerformanceMonitor, modelEvaluator: ModelEvaluationService) {
    super();
    this.performanceMonitor = performanceMonitor;
    this.modelEvaluator = modelEvaluator;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // 监听性能监控事件
    this.performanceMonitor.on('performance-alert', (alert) => {
      this.generatePerformanceFeedback(alert);
    });

    this.performanceMonitor.on('model-performance-degraded', (data) => {
      this.generateModelDegradationFeedback(data);
    });

    // 监听模型评估事件
    this.modelEvaluator.on('model-drift-detected', (drift) => {
      this.generateModelDriftFeedback(drift);
    });

    this.modelEvaluator.on('accuracy-drop', (data) => {
      this.generateAccuracyDropFeedback(data);
    });
  }

  public start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.feedbackInterval = setInterval(() => {
      this.generatePeriodicFeedback();
    }, this.FEEDBACK_INTERVAL);

    this.emit('feedback-started');
  }

  public stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.feedbackInterval) {
      clearInterval(this.feedbackInterval);
      this.feedbackInterval = null;
    }

    this.emit('feedback-stopped');
  }

  private generatePerformanceFeedback(alert: any): void {
    const message: FeedbackMessage = {
      id: `perf-${Date.now()}`,
      type: alert.severity === 'critical' ? 'error' : 'warning',
      category: 'performance',
      title: '性能警报',
      message: `检测到${alert.metric}异常: ${alert.value}${alert.unit} (阈值: ${alert.threshold}${alert.unit})`,
      timestamp: new Date(),
      severity: alert.severity === 'critical' ? 'high' : 'medium',
      actionable: true,
      action: {
        label: '查看详情',
        handler: async () => {
          this.emit('show-performance-details', alert);
        }
      }
    };

    this.addFeedbackMessage(message);
    this.generateOptimizationSuggestions(alert);
  }

  private generateModelDegradationFeedback(data: any): void {
    const message: FeedbackMessage = {
      id: `model-deg-${Date.now()}`,
      type: 'warning',
      category: 'model',
      title: '模型性能下降',
      message: `模型${data.modelName}性能下降${data.degradationPercentage}%，建议重新训练`,
      timestamp: new Date(),
      severity: 'high',
      actionable: true,
      action: {
        label: '重新训练模型',
        handler: async () => {
          this.emit('retrain-model', data.modelName);
        }
      }
    };

    this.addFeedbackMessage(message);
  }

  private generateModelDriftFeedback(drift: any): void {
    const message: FeedbackMessage = {
      id: `drift-${Date.now()}`,
      type: 'warning',
      category: 'accuracy',
      title: '模型漂移检测',
      message: `检测到模型漂移，当前准确率: ${(drift.currentAccuracy * 100).toFixed(1)}%，建议更新训练数据`,
      timestamp: new Date(),
      severity: 'high',
      actionable: true,
      action: {
        label: '更新数据',
        handler: async () => {
          this.emit('update-training-data', drift);
        }
      }
    };

    this.addFeedbackMessage(message);
  }

  private generateAccuracyDropFeedback(data: any): void {
    const message: FeedbackMessage = {
      id: `acc-drop-${Date.now()}`,
      type: 'error',
      category: 'accuracy',
      title: '准确率下降',
      message: `模型准确率从${(data.previousAccuracy * 100).toFixed(1)}%下降到${(data.currentAccuracy * 100).toFixed(1)}%`,
      timestamp: new Date(),
      severity: 'high',
      actionable: true,
      action: {
        label: '诊断问题',
        handler: async () => {
          this.emit('diagnose-accuracy-issue', data);
        }
      }
    };

    this.addFeedbackMessage(message);
  }

  private generatePeriodicFeedback(): void {
    const performanceReport = this.performanceMonitor.getPerformanceReport();
    const recentEvaluations = this.modelEvaluator.getEvaluationHistory();

    // 检查系统整体性能
    if (performanceReport.operations) {
      const ops = Object.values(performanceReport.operations as Record<string, any>);
      const count = Math.max(1, ops.length);
      const total = ops.reduce((sum: number, op: any) => sum + Number(op?.avgDuration || 0), 0);
      const avgResponseTime = total / count;

      if (avgResponseTime > 1000) { // 超过1秒
        this.addFeedbackMessage({
          id: `slow-response-${Date.now()}`,
          type: 'warning',
          category: 'speed',
          title: '响应速度较慢',
          message: `平均响应时间${avgResponseTime.toFixed(0)}ms，建议优化系统性能`,
          timestamp: new Date(),
          severity: 'medium',
          actionable: true,
          action: {
            label: '优化建议',
            handler: async () => {
              this.emit('show-optimization-suggestions', 'speed');
            }
          }
        });
      }
    }

    // 检查内存使用
    if (performanceReport.models?.avgMemoryUsage > 500) { // 超过500MB
      this.addFeedbackMessage({
        id: `high-memory-${Date.now()}`,
        type: 'warning',
        category: 'memory',
        title: '内存使用较高',
        message: `模型平均内存使用${performanceReport.models.avgMemoryUsage.toFixed(0)}MB，建议优化模型大小`,
        timestamp: new Date(),
        severity: 'medium',
        actionable: true,
        action: {
          label: '内存优化',
          handler: async () => {
            this.emit('optimize-memory-usage');
          }
        }
      });
    }

    // 生成智能优化建议
    this.generateSmartSuggestions(performanceReport, recentEvaluations);
  }

  private generateOptimizationSuggestions(alert: any): void {
    const suggestions: OptimizationSuggestion[] = [];

    if (alert.metric === 'responseTime') {
      suggestions.push({
        id: `opt-response-${Date.now()}`,
        type: 'immediate',
        priority: 1,
        title: '优化响应时间',
        description: '检测到响应时间过长，可以通过缓存和异步处理来优化',
        expectedImpact: {
          speed: 30,
          performance: 20
        },
        implementation: {
          complexity: 'low',
          estimatedTime: '2-4小时',
          steps: [
            '启用Redis缓存',
            '实现异步处理',
            '优化数据库查询',
            '添加负载均衡'
          ]
        },
        risks: ['可能影响实时性', '需要额外内存']
      });
    }

    if (alert.metric === 'memoryUsage') {
      suggestions.push({
        id: `opt-memory-${Date.now()}`,
        type: 'short-term',
        priority: 2,
        title: '优化内存使用',
        description: '内存使用过高，可以通过模型压缩和垃圾回收优化',
        expectedImpact: {
          memory: 40,
          performance: 15
        },
        implementation: {
          complexity: 'medium',
          estimatedTime: '1-2天',
          steps: [
            '模型量化压缩',
            '优化垃圾回收',
            '减少内存泄漏',
            '使用内存池'
          ]
        },
        risks: ['可能影响模型精度', '需要重新训练']
      });
    }

    suggestions.forEach(suggestion => {
      this.addOptimizationSuggestion(suggestion);
    });
  }

  private generateSmartSuggestions(
    performanceReport: any, 
    recentEvaluations: any[]
  ): void {
    // 基于历史数据生成智能建议
    if (recentEvaluations.length > 10) {
      const accuracyTrend = this.calculateTrend(recentEvaluations.map(e => e.accuracy));
      
      if (accuracyTrend < -0.1) { // 下降趋势
        this.addOptimizationSuggestion({
          id: `smart-accuracy-${Date.now()}`,
          type: 'short-term',
          priority: 1,
          title: '提升模型准确性',
          description: '检测到模型准确率持续下降，建议重新评估训练策略',
          expectedImpact: {
            accuracy: 25,
            performance: 10
          },
          implementation: {
            complexity: 'high',
            estimatedTime: '3-5天',
            steps: [
              '分析训练数据质量',
              '调整模型架构',
              '增加数据增强',
              '实施交叉验证'
            ]
          },
          risks: ['需要大量计算资源', '可能影响现有功能']
        });
      }
    }

    // 基于性能模式生成建议
    if (performanceReport.models?.avgInferenceTime > 500) {
      this.addOptimizationSuggestion({
        id: `smart-inference-${Date.now()}`,
        type: 'immediate',
        priority: 1,
        title: '加速模型推理',
        description: '推理时间过长，可以通过模型优化和硬件加速来改善',
        expectedImpact: {
          speed: 50,
          performance: 30
        },
        implementation: {
          complexity: 'medium',
          estimatedTime: '2-3天',
          steps: [
            '模型剪枝优化',
            '启用GPU加速',
            '批量推理处理',
            '优化输入预处理'
          ]
        },
        risks: ['需要硬件支持', '可能影响兼容性']
      });
    }
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const xSum = (n * (n - 1)) / 2;
    const ySum = values.reduce((sum, val) => sum + val, 0);
    const xySum = values.reduce((sum, val, idx) => sum + idx * val, 0);
    const x2Sum = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    return slope;
  }

  private addFeedbackMessage(message: FeedbackMessage): void {
    this.feedbackMessages.unshift(message);
    
    // 限制消息数量
    if (this.feedbackMessages.length > this.MAX_MESSAGES) {
      this.feedbackMessages = this.feedbackMessages.slice(0, this.MAX_MESSAGES);
    }

    this.emit('new-feedback', message);
  }

  public publishFeedbackMessage(message: FeedbackMessage): void {
    this.addFeedbackMessage(message);
  }

  private addOptimizationSuggestion(suggestion: OptimizationSuggestion): void {
    // 检查是否已存在类似建议
    const exists = this.optimizationSuggestions.some(s => 
      s.title === suggestion.title && 
      Date.now() - parseInt(s.id.split('-')[1]) < 24 * 60 * 60 * 1000 // 24小时内
    );

    if (!exists) {
      this.optimizationSuggestions.unshift(suggestion);
      this.emit('new-suggestion', suggestion);
    }
  }

  public getFeedbackMessages(
    category?: string, 
    severity?: string, 
    limit = 50
  ): FeedbackMessage[] {
    let messages = this.feedbackMessages;

    if (category) {
      messages = messages.filter(msg => msg.category === category);
    }

    if (severity) {
      messages = messages.filter(msg => msg.severity === severity);
    }

    return messages.slice(0, limit);
  }

  public getOptimizationSuggestions(
    type?: string, 
    priority?: number, 
    limit = 20
  ): OptimizationSuggestion[] {
    let suggestions = this.optimizationSuggestions;

    if (type) {
      suggestions = suggestions.filter(s => s.type === type);
    }

    if (priority !== undefined) {
      suggestions = suggestions.filter(s => s.priority <= priority);
    }

    return suggestions.slice(0, limit);
  }

  public clearFeedbackMessages(): void {
    this.feedbackMessages = [];
    this.emit('feedback-cleared');
  }

  public clearOptimizationSuggestions(): void {
    this.optimizationSuggestions = [];
    this.emit('suggestions-cleared');
  }

  public executeAction(messageId: string): Promise<void> {
    const message = this.feedbackMessages.find(msg => msg.id === messageId);
    
    if (message && message.action) {
      return message.action.handler();
    }

    return Promise.reject(new Error('Action not found'));
  }

  public getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const recentMessages = this.getFeedbackMessages(undefined, undefined, 20);
    const criticalCount = recentMessages.filter(msg => msg.severity === 'high').length;
    const warningCount = recentMessages.filter(msg => msg.severity === 'medium').length;
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    let score = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (criticalCount > 3) {
      status = 'critical';
      score = Math.max(0, score - criticalCount * 15);
      issues.push(`${criticalCount}个严重问题需要立即处理`);
    } else if (warningCount > 5) {
      status = 'warning';
      score = Math.max(50, score - warningCount * 8);
      issues.push(`${warningCount}个警告需要关注`);
    }

    if (score < 80) {
      recommendations.push('建议立即处理系统问题');
    }

    if (score < 60) {
      recommendations.push('考虑系统重启或维护');
    }

    return {
      status,
      score,
      issues,
      recommendations
    };
  }
}