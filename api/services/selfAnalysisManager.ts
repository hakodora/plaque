import { PerformanceMonitor } from './performanceMonitor';
import { ModelEvaluationService } from './modelEvaluation';
import { RealTimeFeedbackSystem } from './realTimeFeedback';
import { ContinuousLearningSystem } from './continuousLearning';
import { EventEmitter } from 'events';

export interface SelfAnalysisConfiguration {
  performanceMonitoring: {
    enabled: boolean;
    interval: number;
    thresholds: {
      responseTime: number;
      memoryUsage: number;
      cpuUsage: number;
    };
  };
  modelEvaluation: {
    enabled: boolean;
    evaluationInterval: number;
    driftDetectionWindow: number;
    accuracyThreshold: number;
  };
  realTimeFeedback: {
    enabled: boolean;
    feedbackInterval: number;
    maxMessages: number;
  };
  continuousLearning: {
    enabled: boolean;
    learningInterval: number;
    minTrainingSamples: number;
    improvementThreshold: number;
  };
}

export class SelfAnalysisManager extends EventEmitter {
  private performanceMonitor: PerformanceMonitor;
  private modelEvaluator: ModelEvaluationService;
  private feedbackSystem: RealTimeFeedbackSystem;
  private continuousLearning: ContinuousLearningSystem;
  private configuration: SelfAnalysisConfiguration;
  private isInitialized = false;
  private isRunning = false;

  constructor(configuration?: Partial<SelfAnalysisConfiguration>) {
    super();
    
    this.configuration = {
      performanceMonitoring: {
        enabled: true,
        interval: 5000,
        thresholds: {
          responseTime: 1000,
          memoryUsage: 500,
          cpuUsage: 80
        }
      },
      modelEvaluation: {
        enabled: true,
        evaluationInterval: 30000,
        driftDetectionWindow: 100,
        accuracyThreshold: 0.8
      },
      realTimeFeedback: {
        enabled: true,
        feedbackInterval: 5000,
        maxMessages: 100
      },
      continuousLearning: {
        enabled: true,
        learningInterval: 300000,
        minTrainingSamples: 100,
        improvementThreshold: 0.02
      },
      ...configuration
    };

    this.initializeServices();
    this.setupEventHandlers();
  }

  private initializeServices(): void {
    // 初始化性能监控器
    this.performanceMonitor = new PerformanceMonitor();
    
    // 初始化模型评估服务
    this.modelEvaluator = new ModelEvaluationService(this.performanceMonitor);
    
    // 初始化实时反馈系统
    this.feedbackSystem = new RealTimeFeedbackSystem(
      this.performanceMonitor,
      this.modelEvaluator
    );
    
    // 初始化持续学习系统
    this.continuousLearning = new ContinuousLearningSystem(
      this.performanceMonitor,
      this.modelEvaluator,
      this.feedbackSystem
    );

    this.isInitialized = true;
  }

  private setupEventHandlers(): void {
    // 监听性能监控事件
    this.performanceMonitor.on('performance-alert', (alert) => {
      this.emit('performance-alert', alert);
    });

    this.performanceMonitor.on('model-performance-degraded', (data) => {
      this.emit('model-performance-degraded', data);
    });

    // 监听模型评估事件
    this.modelEvaluator.on('model-drift-detected', (drift) => {
      this.emit('model-drift-detected', drift);
    });

    this.modelEvaluator.on('accuracy-drop', (data) => {
      this.emit('accuracy-drop', data);
    });

    // 监听反馈系统事件
    this.feedbackSystem.on('new-feedback', (message) => {
      this.emit('new-feedback', message);
    });

    this.feedbackSystem.on('new-suggestion', (suggestion) => {
      this.emit('new-suggestion', suggestion);
    });

    // 监听持续学习事件
    this.continuousLearning.on('model-updated', (update) => {
      this.emit('model-updated', update);
    });

    this.continuousLearning.on('learning-cycle-completed', (result) => {
      this.emit('learning-cycle-completed', result);
    });
  }

  public async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('SelfAnalysisManager not initialized');
    }

    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    try {
      // 启动各个子系统
      if (this.configuration.performanceMonitoring.enabled) {
        // PerformanceMonitor starts automatically in constructor
        console.log('Performance monitoring is enabled and running');
      }

      if (this.configuration.modelEvaluation.enabled) {
        // ModelEvaluationService doesn't need explicit start
        console.log('Model evaluation is enabled');
      }

      if (this.configuration.realTimeFeedback.enabled) {
        this.feedbackSystem.start();
      }

      if (this.configuration.continuousLearning.enabled) {
        this.continuousLearning.start();
      }

      this.emit('self-analysis-started');

      // 添加启动成功的反馈
      this.feedbackSystem.publishFeedbackMessage({
        id: `self-analysis-started-${Date.now()}`,
        type: 'info',
        category: 'performance',
        title: '自我分析系统启动',
        message: '所有子系统已成功启动，开始智能监控和优化',
        timestamp: new Date(),
        severity: 'low',
        actionable: false
      });

    } catch (error) {
      this.isRunning = false;
      this.emit('self-analysis-error', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // 停止各个子系统
    if (this.configuration.performanceMonitoring.enabled) {
      // PerformanceMonitor doesn't have a stop method
      console.log('Performance monitoring stopped');
    }

    if (this.configuration.modelEvaluation.enabled) {
      // ModelEvaluationService doesn't have a stop method
      console.log('Model evaluation stopped');
    }

    if (this.configuration.realTimeFeedback.enabled) {
      this.feedbackSystem.stop();
    }

    if (this.configuration.continuousLearning.enabled) {
      this.continuousLearning.stop();
    }

    this.emit('self-analysis-stopped');

    // 添加停止成功的反馈
    this.feedbackSystem.publishFeedbackMessage({
      id: `self-analysis-stopped-${Date.now()}`,
      type: 'info',
      category: 'performance',
      title: '自我分析系统停止',
      message: '所有子系统已停止运行',
      timestamp: new Date(),
      severity: 'low',
      actionable: false
    });
  }

  public getSystemStatus(): {
    isRunning: boolean;
    isInitialized: boolean;
    configuration: SelfAnalysisConfiguration;
    subsystems: {
      performanceMonitoring: { enabled: boolean; status: string };
      modelEvaluation: { enabled: boolean; status: string };
      realTimeFeedback: { enabled: boolean; status: string };
      continuousLearning: { enabled: boolean; status: string };
    };
    health: {
      overall: 'healthy' | 'warning' | 'critical';
      score: number;
      issues: string[];
      recommendations: string[];
    };
  } {
    const feedbackHealth = this.feedbackSystem.getSystemHealth();
    
    return {
      isRunning: this.isRunning,
      isInitialized: this.isInitialized,
      configuration: this.configuration,
      subsystems: {
        performanceMonitoring: {
          enabled: this.configuration.performanceMonitoring.enabled,
          status: this.performanceMonitor ? 'active' : 'inactive'
        },
        modelEvaluation: {
          enabled: this.configuration.modelEvaluation.enabled,
          status: this.modelEvaluator ? 'active' : 'inactive'
        },
        realTimeFeedback: {
          enabled: this.configuration.realTimeFeedback.enabled,
          status: this.feedbackSystem ? 'active' : 'inactive'
        },
        continuousLearning: {
          enabled: this.configuration.continuousLearning.enabled,
          status: this.continuousLearning ? 'active' : 'inactive'
        }
      },
      health: {
        overall: feedbackHealth.status,
        score: feedbackHealth.score,
        issues: feedbackHealth.issues,
        recommendations: feedbackHealth.recommendations
      }
    };
  }

  public getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  public getModelEvaluator(): ModelEvaluationService {
    return this.modelEvaluator;
  }

  public getFeedbackSystem(): RealTimeFeedbackSystem {
    return this.feedbackSystem;
  }

  public getContinuousLearning(): ContinuousLearningSystem {
    return this.continuousLearning;
  }

  public updateConfiguration(updates: Partial<SelfAnalysisConfiguration>): void {
    this.configuration = { ...this.configuration, ...updates };
    
    // 如果系统正在运行，重启以应用新配置
    if (this.isRunning) {
      this.stop().then(() => {
        this.start();
      });
    }

    this.emit('configuration-updated', this.configuration);
  }

  public getConfiguration(): SelfAnalysisConfiguration {
    return { ...this.configuration };
  }

  public async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  public getSystemStatistics(): any {
    const performanceStats = this.performanceMonitor.getPerformanceReport();
    const learningStats = this.continuousLearning.getLearningStatistics();
    const feedbackMessages = this.feedbackSystem.getFeedbackMessages();
    
    return {
      uptime: Date.now(),
      totalFeedbackMessages: feedbackMessages.length,
      learningSamples: learningStats.totalSamples,
      modelUpdates: learningStats.modelUpdates,
      performanceMetrics: {
        avgResponseTime: performanceStats?.operations ?
          (() => {
            const durations = Object.values(performanceStats.operations as Record<string, any>);
            const total = (durations as any[]).reduce((sum: number, op: any) => sum + Number(op?.avgDuration || 0), 0);
            const count = Math.max(1, Object.keys(performanceStats.operations).length);
            return total / count;
          })() : 0,
        avgMemoryUsage: performanceStats?.models?.avgMemoryUsage || 0,
        avgAccuracy: performanceStats?.models?.avgAccuracy || 0
      },
      systemHealth: this.getSystemStatus().health
    };
  }

  public exportSystemReport(): string {
    const status = this.getSystemStatus();
    const stats = this.getSystemStatistics();
    
    const report = {
      timestamp: new Date().toISOString(),
      systemStatus: status,
      statistics: stats,
      recommendations: this.generateRecommendations()
    };

    return JSON.stringify(report, null, 2);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const health = this.getSystemStatus().health;

    if (health.overall === 'critical') {
      recommendations.push('立即检查系统配置和运行状态');
      recommendations.push('考虑重启自我分析系统');
      recommendations.push('检查模型性能和准确性');
    } else if (health.overall === 'warning') {
      recommendations.push('监控系统性能指标');
      recommendations.push('考虑优化模型参数');
      recommendations.push('检查学习数据质量');
    } else {
      recommendations.push('系统运行良好，继续保持监控');
      recommendations.push('定期检查和优化配置');
      recommendations.push('考虑扩展监控范围');
    }

    return recommendations;
  }
}

// 导出便利函数用于快速集成
export function createSelfAnalysisSystem(configuration?: Partial<SelfAnalysisConfiguration>): SelfAnalysisManager {
  return new SelfAnalysisManager(configuration);
}

export async function startSelfAnalysis(system: SelfAnalysisManager): Promise<void> {
  return system.start();
}

export async function stopSelfAnalysis(system: SelfAnalysisManager): Promise<void> {
  return system.stop();
}

export function getSystemReport(system: SelfAnalysisManager): string {
  return system.exportSystemReport();
}