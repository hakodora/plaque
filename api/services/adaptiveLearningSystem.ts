import { EventEmitter } from 'events';
import { SelfAnalysisManager } from './selfAnalysisManager';
import { EvolutionEngine, EvolutionConfiguration } from './evolutionEngine';
import { NEATEngine, NEATConfiguration } from './neatEngine';
import * as tf from '@tensorflow/tfjs';

export interface AdaptiveLearningConfiguration {
  evolution: EvolutionConfiguration;
  neat: NEATConfiguration;
  integration: {
    enableEvolution: boolean;
    enableNEAT: boolean;
    evolutionPriority: number;
    neatPriority: number;
    coordinationStrategy: 'alternating' | 'parallel' | 'hierarchical';
  };
  adaptation: {
    enableSelfAdaptation: boolean;
    adaptationInterval: number;
    performanceWindow: number;
    improvementThreshold: number;
  };
  metaLearning: {
    enableMetaLearning: boolean;
    metaLearningRate: number;
    experienceReplay: boolean;
    transferLearning: boolean;
  };
}

export interface LearningExperience {
  id: string;
  timestamp: number;
  configuration: any;
  performance: {
    accuracy: number;
    speed: number;
    efficiency: number;
    stability: number;
  };
  outcome: 'success' | 'failure' | 'partial';
  lessons: string[];
}

export interface MetaLearningMetrics {
  learningVelocity: number;
  adaptationEfficiency: number;
  transferEffectiveness: number;
  experienceUtilization: number;
}

export class AdaptiveLearningSystem extends EventEmitter {
  private selfAnalysisManager: SelfAnalysisManager;
  private evolutionEngine: EvolutionEngine;
  private neatEngine: NEATEngine;
  private configuration: AdaptiveLearningConfiguration;
  private isRunning = false;
  private learningExperiences: LearningExperience[] = [];
  private metaLearningMetrics: MetaLearningMetrics;
  private adaptationTimer: NodeJS.Timeout | null = null;
  private currentPhase: 'evolution' | 'neat' | 'integration' = 'evolution';
  private performanceHistory: number[] = [];
  private bestConfiguration: any = null;
  private improvementStreak = 0;
  private stagnationCount = 0;

  constructor(
    selfAnalysisManager: SelfAnalysisManager,
    configuration?: Partial<AdaptiveLearningConfiguration>
  ) {
    super();
    
    this.selfAnalysisManager = selfAnalysisManager;
    
    this.configuration = {
      evolution: {
        populationSize: 20,
        mutationRate: 0.1,
        crossoverRate: 0.7,
        maxGenerations: 100,
        fitnessThreshold: 0.95,
        evolutionInterval: 300000,
        parameters: {
          model: {
            learningRate: { min: 0.0001, max: 0.1, step: 0.0001 },
            batchSize: { min: 8, max: 64, step: 8 },
            epochs: { min: 10, max: 100, step: 5 },
            dropout: { min: 0.1, max: 0.5, step: 0.05 }
          },
          system: {
            thresholds: {
              responseTime: { min: 500, max: 2000, step: 100 },
              memoryUsage: { min: 200, max: 1000, step: 50 },
              cpuUsage: { min: 50, max: 90, step: 5 }
            },
            intervals: {
              monitoring: { min: 1000, max: 10000, step: 1000 },
              evaluation: { min: 10000, max: 60000, step: 5000 },
              learning: { min: 60000, max: 600000, step: 30000 }
            }
          }
        }
      },
      neat: {
        populationSize: 50,
        inputSize: 784,
        outputSize: 10,
        maxHiddenLayers: 5,
        maxUnitsPerLayer: 512,
        mutationRates: {
          addNode: 0.03,
          addConnection: 0.05,
          removeNode: 0.02,
          removeConnection: 0.02,
          mutateWeights: 0.8,
          mutateActivation: 0.1,
          mutateLearningRate: 0.1
        },
        compatibility: {
          c1: 1.0,
          c2: 1.0,
          c3: 0.4,
          threshold: 3.0
        },
        stagnation: {
          maxStagnation: 15,
          survivalThreshold: 0.2
        },
        elitism: 0.2
      },
      integration: {
        enableEvolution: true,
        enableNEAT: true,
        evolutionPriority: 0.6,
        neatPriority: 0.4,
        coordinationStrategy: 'alternating'
      },
      adaptation: {
        enableSelfAdaptation: true,
        adaptationInterval: 60000,
        performanceWindow: 10,
        improvementThreshold: 0.05
      },
      metaLearning: {
        enableMetaLearning: true,
        metaLearningRate: 0.01,
        experienceReplay: true,
        transferLearning: true
      }
    };

    if (configuration) {
      this.configuration = { ...this.configuration, ...configuration };
    }

    this.evolutionEngine = new EvolutionEngine(selfAnalysisManager, this.configuration.evolution);
    this.neatEngine = new NEATEngine(this.configuration.neat);
    
    this.metaLearningMetrics = {
      learningVelocity: 0,
      adaptationEfficiency: 0,
      transferEffectiveness: 0,
      experienceUtilization: 0
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // 进化引擎事件
    this.evolutionEngine.on('new-best-individual', (data) => {
      this.recordLearningExperience('evolution', data.individual, 'success');
      this.evaluateConfigurationImprovement(data.individual.fitness);
    });

    this.evolutionEngine.on('generation-completed', (data) => {
      this.updateMetaLearningMetrics('evolution', data);
    });

    // NEAT引擎事件
    this.neatEngine.on('new-best-genome', (data) => {
      this.recordLearningExperience('neat', data.genome, 'success');
      this.evaluateArchitectureImprovement(data.genome.fitness);
    });

    this.neatEngine.on('generation-completed', (data) => {
      this.updateMetaLearningMetrics('neat', data);
    });

    // 自分析管理器事件
    this.selfAnalysisManager.on('performance-alert', (alert) => {
      this.adaptToPerformanceIssues(alert);
    });

    this.selfAnalysisManager.on('model-performance-degraded', (data) => {
      this.triggerAdaptiveResponse('performance_degradation', data);
    });
  }

  public async startAdaptiveLearning(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.emit('adaptive-learning-started', { 
      configuration: this.configuration,
      timestamp: Date.now()
    });

    // 启动子系统
    if (this.configuration.integration.enableEvolution) {
      await this.evolutionEngine.startEvolution();
    }

    if (this.configuration.integration.enableNEAT) {
      await this.neatEngine.startEvolution();
    }

    // 启动自适应循环
    this.startAdaptationCycle();

    // 启动元学习监控
    this.startMetaLearningMonitoring();
  }

  public stopAdaptiveLearning(): void {
    this.isRunning = false;

    // 停止子系统
    this.evolutionEngine.stopEvolution();
    this.neatEngine.stopEvolution();

    // 停止自适应循环
    if (this.adaptationTimer) {
      clearInterval(this.adaptationTimer);
      this.adaptationTimer = null;
    }

    this.emit('adaptive-learning-stopped', { 
      finalMetrics: this.metaLearningMetrics,
      totalExperiences: this.learningExperiences.length,
      timestamp: Date.now()
    });
  }

  private startAdaptationCycle(): void {
    if (!this.configuration.adaptation.enableSelfAdaptation) return;

    this.adaptationTimer = setInterval(() => {
      this.performAdaptationCycle();
    }, this.configuration.adaptation.adaptationInterval);
  }

  private async performAdaptationCycle(): Promise<void> {
    if (!this.isRunning) return;

    this.emit('adaptation-cycle-started', { 
      phase: this.currentPhase,
      iteration: this.performanceHistory.length 
    });

    // 根据协调策略执行不同的适应阶段
    switch (this.configuration.integration.coordinationStrategy) {
      case 'alternating':
        await this.alternatingAdaptation();
        break;
      case 'parallel':
        await this.parallelAdaptation();
        break;
      case 'hierarchical':
        await this.hierarchicalAdaptation();
        break;
    }

    // 评估当前性能
    const currentPerformance = await this.evaluateCurrentPerformance();
    this.performanceHistory.push(currentPerformance);

    // 保持性能历史窗口
    if (this.performanceHistory.length > this.configuration.adaptation.performanceWindow) {
      this.performanceHistory = this.performanceHistory.slice(-this.configuration.adaptation.performanceWindow);
    }

    // 分析性能趋势
    this.analyzePerformanceTrend();

    // 调整学习策略
    this.adjustLearningStrategy();

    this.emit('adaptation-cycle-completed', {
      phase: this.currentPhase,
      performance: currentPerformance,
      trend: this.getPerformanceTrend()
    });
  }

  private async alternatingAdaptation(): Promise<void> {
    switch (this.currentPhase) {
      case 'evolution':
        // 进化阶段：优化系统配置
        if (this.configuration.integration.enableEvolution) {
          await this.evolutionEngine.forceEvolution();
        }
        this.currentPhase = 'neat';
        break;

      case 'neat':
        // NEAT阶段：优化神经网络架构
        if (this.configuration.integration.enableNEAT) {
          await this.neatEngine.buildBestModel();
        }
        this.currentPhase = 'integration';
        break;

      case 'integration':
        // 集成阶段：协调两个系统
        await this.integrateSystems();
        this.currentPhase = 'evolution';
        break;
    }
  }

  private async parallelAdaptation(): Promise<void> {
    // 并行执行进化和NEAT
    const promises = [];

    if (this.configuration.integration.enableEvolution) {
      promises.push(this.evolutionEngine.forceEvolution());
    }

    if (this.configuration.integration.enableNEAT) {
      promises.push(this.neatEngine.buildBestModel());
    }

    await Promise.all(promises);
    await this.integrateSystems();
  }

  private async hierarchicalAdaptation(): Promise<void> {
    // 分层适应：先进化，再NEAT，最后集成
    if (this.configuration.integration.enableEvolution) {
      await this.evolutionEngine.forceEvolution();
    }

    if (this.configuration.integration.enableNEAT) {
      await this.neatEngine.buildBestModel();
    }

    await this.integrateSystems();
  }

  private async integrateSystems(): Promise<void> {
    // 获取两个系统的最优配置
    const evolutionBest = this.evolutionEngine.getBestIndividual();
    const neatBest = this.neatEngine.getBestGenome();

    if (evolutionBest && neatBest) {
      // 集成配置
      const integratedConfig = this.createIntegratedConfiguration(evolutionBest, neatBest);
      
      // 应用集成配置
      this.selfAnalysisManager.updateConfiguration(integratedConfig.system);
      
      // 构建集成模型
      const integratedModel = await this.neatEngine.buildBestModel();
      
      this.emit('systems-integrated', {
        evolutionFitness: evolutionBest.fitness,
        neatFitness: neatBest.fitness,
        integratedConfig
      });
    }
  }

  private createIntegratedConfiguration(evolutionBest: any, neatBest: any): {
    system: any;
    model: any;
  } {
    return {
      system: evolutionBest.genes.system,
      model: {
        learningRate: neatBest.architecture.learningRate,
        architecture: neatBest.architecture.layers,
        optimizer: neatBest.architecture.optimizer,
        lossFunction: neatBest.architecture.lossFunction
      }
    };
  }

  private async evaluateCurrentPerformance(): Promise<number> {
    const systemStats = this.selfAnalysisManager.getSystemStatistics();
    const performanceMetrics = systemStats.performanceMetrics;
    
    if (!performanceMetrics) return 0;

    // 综合性能评分
    const accuracyScore = performanceMetrics.avgAccuracy || 0;
    const speedScore = Math.max(0, 1 - (performanceMetrics.avgResponseTime || 0) / 10000);
    const efficiencyScore = Math.max(0, 1 - (performanceMetrics.avgMemoryUsage || 0) / 1000);
    const stabilityScore = (systemStats.systemHealth?.score || 0) / 100;

    // 权重可以根据需求调整
    const weights = {
      accuracy: 0.4,
      speed: 0.2,
      efficiency: 0.2,
      stability: 0.2
    };

    return (
      accuracyScore * weights.accuracy +
      speedScore * weights.speed +
      efficiencyScore * weights.efficiency +
      stabilityScore * weights.stability
    );
  }

  private analyzePerformanceTrend(): void {
    if (this.performanceHistory.length < 2) return;

    const recent = this.performanceHistory.slice(-5);
    const older = this.performanceHistory.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, p) => sum + p, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, p) => sum + p, 0) / older.length : recentAvg;
    
    const improvement = (recentAvg - olderAvg) / olderAvg;
    
    if (improvement > this.configuration.adaptation.improvementThreshold) {
      this.improvementStreak++;
      this.stagnationCount = 0;
      
      // 奖励改进
      this.rewardImprovement();
    } else if (improvement < -this.configuration.adaptation.improvementThreshold) {
      this.improvementStreak = 0;
      this.stagnationCount++;
      
      // 惩罚退步
      this.punishRegression();
    } else {
      this.stagnationCount++;
      
      // 处理停滞
      if (this.stagnationCount > 5) {
        this.handleStagnation();
      }
    }

    this.updateMetaLearningMetrics('trend-analysis', { improvement, recentAvg, olderAvg });
  }

  private getPerformanceTrend(): 'improving' | 'declining' | 'stable' {
    if (this.performanceHistory.length < 2) return 'stable';
    
    const recent = this.performanceHistory.slice(-3);
    const avgRecent = recent.reduce((sum, p) => sum + p, 0) / recent.length;
    const avgOverall = this.performanceHistory.reduce((sum, p) => sum + p, 0) / this.performanceHistory.length;
    
    const difference = Math.abs(avgRecent - avgOverall) / avgOverall;
    
    if (difference < 0.02) return 'stable';
    return avgRecent > avgOverall ? 'improving' : 'declining';
  }

  private adjustLearningStrategy(): void {
    const trend = this.getPerformanceTrend();
    
    switch (trend) {
      case 'improving':
        // 保持当前策略
        this.maintainCurrentStrategy();
        break;
      case 'declining':
        // 激进调整
        this.aggressiveAdjustment();
        break;
      case 'stable':
        // 探索新策略
        this.exploreNewStrategy();
        break;
    }
  }

  private rewardImprovement(): void {
    // 增加探索率
    this.configuration.evolution.mutationRate = Math.min(0.2, this.configuration.evolution.mutationRate * 1.1);
    this.configuration.neat.mutationRates.addNode = Math.min(0.1, this.configuration.neat.mutationRates.addNode * 1.2);
    
    this.emit('improvement-rewarded', {
      streak: this.improvementStreak,
      mutationRate: this.configuration.evolution.mutationRate
    });
  }

  private punishRegression(): void {
    // 减少探索率，增加利用
    this.configuration.evolution.mutationRate = Math.max(0.05, this.configuration.evolution.mutationRate * 0.8);
    this.configuration.neat.mutationRates.addNode = Math.max(0.01, this.configuration.neat.mutationRates.addNode * 0.7);
    
    this.emit('regression-punished', {
      stagnation: this.stagnationCount,
      mutationRate: this.configuration.evolution.mutationRate
    });
  }

  private handleStagnation(): void {
    // 重大策略调整
    this.configuration.integration.coordinationStrategy = 
      this.configuration.integration.coordinationStrategy === 'alternating' ? 'parallel' : 'alternating';
    
    // 重置探索率
    this.configuration.evolution.mutationRate = 0.15;
    this.configuration.neat.mutationRates.addNode = 0.05;
    
    // 强制重新初始化
    this.stagnationCount = 0;
    
    this.emit('stagnation-handled', {
      newStrategy: this.configuration.integration.coordinationStrategy
    });
  }

  private maintainCurrentStrategy(): void {
    // 微调参数
    this.configuration.evolution.crossoverRate = Math.min(0.8, this.configuration.evolution.crossoverRate * 1.02);
  }

  private aggressiveAdjustment(): void {
    // 大幅调整参数
    this.configuration.evolution.populationSize = Math.min(50, this.configuration.evolution.populationSize + 5);
    this.configuration.neat.populationSize = Math.min(100, this.configuration.neat.populationSize + 10);
    
    // 缩短适应周期
    this.configuration.adaptation.adaptationInterval = Math.max(30000, this.configuration.adaptation.adaptationInterval - 5000);
  }

  private exploreNewStrategy(): void {
    // 随机探索新参数
    const explorationFactor = 0.1;
    
    this.configuration.evolution.mutationRate += (Math.random() - 0.5) * explorationFactor;
    this.configuration.evolution.mutationRate = Math.max(0.05, Math.min(0.2, this.configuration.evolution.mutationRate));
  }

  private recordLearningExperience(
    system: 'evolution' | 'neat' | 'integration',
    configuration: any,
    outcome: 'success' | 'failure' | 'partial'
  ): void {
    const experience: LearningExperience = {
      id: `exp_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      configuration,
      performance: {
        accuracy: configuration.fitness || 0,
        speed: 0,
        efficiency: 0,
        stability: 0
      },
      outcome,
      lessons: this.extractLessons(system, configuration, outcome)
    };

    this.learningExperiences.push(experience);

    // 保持经验池大小
    if (this.learningExperiences.length > 1000) {
      this.learningExperiences = this.learningExperiences.slice(-1000);
    }

    this.emit('learning-experience-recorded', experience);
  }

  private extractLessons(
    system: string,
    configuration: any,
    outcome: string
  ): string[] {
    const lessons: string[] = [];
    
    if (outcome === 'success') {
      lessons.push(`${system} configuration showed improvement`);
      if (configuration.fitness > 0.9) {
        lessons.push('High fitness achieved - configuration is promising');
      }
    } else if (outcome === 'failure') {
      lessons.push(`${system} configuration needs adjustment`);
      lessons.push('Consider modifying parameters or strategy');
    }
    
    return lessons;
  }

  private evaluateConfigurationImprovement(fitness: number): void {
    if (!this.bestConfiguration || fitness > this.bestConfiguration.fitness) {
      this.bestConfiguration = { fitness, timestamp: Date.now() };
      this.improvementStreak++;
    }
  }

  private evaluateArchitectureImprovement(fitness: number): void {
    this.evaluateConfigurationImprovement(fitness);
  }

  private adaptToPerformanceIssues(alert: any): void {
    this.triggerAdaptiveResponse('performance_issue', alert);
  }

  private triggerAdaptiveResponse(trigger: string, data: any): void {
    this.emit('adaptive-response-triggered', { trigger, data });
    
    // 根据触发器类型调整策略
    switch (trigger) {
      case 'performance_degradation':
        this.aggressiveAdjustment();
        break;
      case 'performance_issue':
        this.exploreNewStrategy();
        break;
    }
  }

  private startMetaLearningMonitoring(): void {
    if (!this.configuration.metaLearning.enableMetaLearning) return;

    // 定期更新元学习指标
    setInterval(() => {
      this.updateMetaLearningMetrics('periodic', {});
    }, 120000); // 每2分钟
  }

  private updateMetaLearningMetrics(source: string, data: any): void {
    // 计算学习速度
    const recentExperiences = this.learningExperiences.slice(-10);
    const successfulExperiences = recentExperiences.filter(exp => exp.outcome === 'success');
    
    this.metaLearningMetrics.learningVelocity = successfulExperiences.length / recentExperiences.length;
    
    // 计算适应效率
    if (this.performanceHistory.length >= 2) {
      const recent = this.performanceHistory.slice(-5);
      const improvement = (recent[recent.length - 1] - recent[0]) / recent[0];
      this.metaLearningMetrics.adaptationEfficiency = Math.max(0, improvement);
    }
    
    // 计算经验利用率
    const uniqueLessons = new Set(this.learningExperiences.flatMap(exp => exp.lessons));
    this.metaLearningMetrics.experienceUtilization = uniqueLessons.size / this.learningExperiences.length;
    
    this.emit('meta-learning-metrics-updated', this.metaLearningMetrics);
  }

  public getAdaptiveLearningStatus(): {
    isRunning: boolean;
    currentPhase: string;
    performanceTrend: string;
    improvementStreak: number;
    stagnationCount: number;
    metaLearningMetrics: MetaLearningMetrics;
    totalExperiences: number;
    bestConfiguration: any;
  } {
    return {
      isRunning: this.isRunning,
      currentPhase: this.currentPhase,
      performanceTrend: this.getPerformanceTrend(),
      improvementStreak: this.improvementStreak,
      stagnationCount: this.stagnationCount,
      metaLearningMetrics: { ...this.metaLearningMetrics },
      totalExperiences: this.learningExperiences.length,
      bestConfiguration: this.bestConfiguration
    };
  }

  public getLearningExperiences(): LearningExperience[] {
    return [...this.learningExperiences];
  }

  public getMetaLearningMetrics(): MetaLearningMetrics {
    return { ...this.metaLearningMetrics };
  }

  public forceAdaptation(): Promise<void> {
    return this.performAdaptationCycle();
  }

  public exportAdaptiveLearningReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      adaptiveLearningStatus: this.getAdaptiveLearningStatus(),
      configuration: this.configuration,
      learningExperiences: this.learningExperiences.slice(-20), // 最近20条经验
      performanceHistory: this.performanceHistory,
      evolutionStatus: this.evolutionEngine.getEvolutionStatus(),
      neatStatus: {
        generation: this.neatEngine.getGeneration(),
        bestGenome: this.neatEngine.getBestGenome()
      }
    };

    return JSON.stringify(report, null, 2);
  }
}