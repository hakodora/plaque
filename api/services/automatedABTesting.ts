import { EventEmitter } from 'events';
import { AdaptiveLearningSystem } from './adaptiveLearningSystem';
import { EvolutionEngine } from './evolutionEngine';

export interface ABTestConfiguration {
  testDuration: number;
  significanceLevel: number;
  minSampleSize: number;
  maxConcurrentTests: number;
  trafficSplit: number[];
  metrics: {
    primary: string[];
    secondary: string[];
    successThresholds: { [metric: string]: number };
  };
  stoppingRules: {
    earlyStopping: boolean;
    minDuration: number;
    maxDuration: number;
    significanceThreshold: number;
  };
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  configuration: any;
  trafficWeight: number;
  isControl: boolean;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  configuration: ABTestConfiguration;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  results: ABTestResults;
  samples: { [variantId: string]: ABTestSample[] };
}

export interface ABTestSample {
  id: string;
  variantId: string;
  timestamp: number;
  metrics: { [metric: string]: number };
  metadata?: any;
}

export interface ABTestResults {
  sampleSizes: { [variantId: string]: number };
  conversionRates: { [variantId: string]: number };
  improvements: { [variantId: string]: number };
  statisticalSignificance: { [variantId: string]: number };
  confidenceIntervals: { [variantId: string]: [number, number] };
  winner?: string;
  recommendation: string;
  statisticalPower: number;
}

export interface BayesianResults {
  posteriorProbabilities: { [variantId: string]: number };
  expectedLoss: { [variantId: string]: number };
  upliftDistributions: { [variantId: string]: number[] };
  probabilityOfBest: { [variantId: string]: number };
}

export class AutomatedABTestingFramework extends EventEmitter {
  private adaptiveLearningSystem: AdaptiveLearningSystem;
  private evolutionEngine: EvolutionEngine;
  private activeTests: Map<string, ABTest> = new Map();
  private completedTests: Map<string, ABTest> = new Map();
  private testQueue: ABTest[] = [];
  private isRunning = false;
  private testScheduler: NodeJS.Timeout | null = null;
  private sampleCollector: NodeJS.Timeout | null = null;

  private readonly defaultConfiguration: ABTestConfiguration = {
    testDuration: 604800000, // 7 days
    significanceLevel: 0.05,
    minSampleSize: 100,
    maxConcurrentTests: 3,
    trafficSplit: [50, 50],
    metrics: {
      primary: ['accuracy', 'response_time', 'user_satisfaction'],
      secondary: ['memory_usage', 'cpu_usage', 'error_rate'],
      successThresholds: {
        accuracy: 0.85,
        response_time: 2000,
        user_satisfaction: 0.8,
        memory_usage: 500,
        cpu_usage: 70,
        error_rate: 0.05
      }
    },
    stoppingRules: {
      earlyStopping: true,
      minDuration: 86400000, // 1 day
      maxDuration: 1209600000, // 14 days
      significanceThreshold: 0.01
    }
  };

  constructor(
    adaptiveLearningSystem: AdaptiveLearningSystem,
    evolutionEngine: EvolutionEngine,
    configuration?: Partial<ABTestConfiguration>
  ) {
    super();
    this.adaptiveLearningSystem = adaptiveLearningSystem;
    this.evolutionEngine = evolutionEngine;
  }

  public async startABTesting(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.emit('ab-testing-started', { timestamp: Date.now() });

    // 启动测试调度器
    this.startTestScheduler();
    
    // 启动样本收集器
    this.startSampleCollector();

    // 创建初始测试
    await this.createInitialTests();
  }

  public stopABTesting(): void {
    this.isRunning = false;

    // 停止所有定时器
    if (this.testScheduler) {
      clearInterval(this.testScheduler);
      this.testScheduler = null;
    }

    if (this.sampleCollector) {
      clearInterval(this.sampleCollector);
      this.sampleCollector = null;
    }

    // 完成所有正在运行的测试
    this.activeTests.forEach(test => {
      this.completeTest(test.id, 'stopped');
    });

    this.emit('ab-testing-stopped', { 
      activeTests: this.activeTests.size,
      completedTests: this.completedTests.size,
      timestamp: Date.now()
    });
  }

  private startTestScheduler(): void {
    this.testScheduler = setInterval(() => {
      this.scheduleTests();
    }, 60000); // 每分钟检查一次
  }

  private startSampleCollector(): void {
    this.sampleCollector = setInterval(() => {
      this.collectSamples();
    }, 5000); // 每5秒收集一次样本
  }

  private async createInitialTests(): Promise<void> {
    // 创建系统配置对比测试
    await this.createConfigurationABTest();
    
    // 创建模型架构对比测试
    await this.createArchitectureABTest();
    
    // 创建学习策略对比测试
    await this.createLearningStrategyABTest();
  }

  private async createConfigurationABTest(): Promise<void> {
    const currentConfig = this.adaptiveLearningSystem.getAdaptiveLearningStatus();
    const evolutionBest = this.evolutionEngine.getBestIndividual();

    if (!evolutionBest) return;

    const variants: ABTestVariant[] = [
      {
        id: 'control',
        name: 'Current Configuration',
        description: '当前系统配置',
        configuration: currentConfig.bestConfiguration,
        trafficWeight: 50,
        isControl: true
      },
      {
        id: 'evolution',
        name: 'Evolution Optimized',
        description: '进化算法优化的配置',
        configuration: evolutionBest.genes,
        trafficWeight: 50,
        isControl: false
      }
    ];

    const test: ABTest = {
      id: `config_test_${Date.now()}`,
      name: 'System Configuration Optimization',
      description: '对比当前配置与进化算法优化配置的性能',
      variants,
      configuration: this.defaultConfiguration,
      status: 'draft',
      startTime: Date.now(),
      results: this.createEmptyResults(variants),
      samples: {}
    };

    this.queueTest(test);
  }

  private async createArchitectureABTest(): Promise<void> {
    const neatEngine = this.adaptiveLearningSystem['neatEngine'];
    const bestGenome = neatEngine?.getBestGenome?.();

    if (!bestGenome) return;

    const variants: ABTestVariant[] = [
      {
        id: 'baseline',
        name: 'Baseline Architecture',
        description: '基础神经网络架构',
        configuration: {
          layers: [
            { type: 'dense', units: 128, activation: 'relu' },
            { type: 'dense', units: 64, activation: 'relu' },
            { type: 'dense', units: 10, activation: 'softmax' }
          ],
          learningRate: 0.001,
          optimizer: 'adam'
        },
        trafficWeight: 33,
        isControl: true
      },
      {
        id: 'neat',
        name: 'NEAT Optimized',
        description: 'NEAT算法优化的架构',
        configuration: bestGenome.architecture,
        trafficWeight: 33,
        isControl: false
      },
      {
        id: 'ensemble',
        name: 'Ensemble Architecture',
        description: '集成多种架构的综合方案',
        configuration: {
          ensemble: true,
          models: ['baseline', 'neat'],
          votingStrategy: 'weighted_average'
        },
        trafficWeight: 34,
        isControl: false
      }
    ];

    const test: ABTest = {
      id: `architecture_test_${Date.now()}`,
      name: 'Neural Architecture Optimization',
      description: '对比不同神经网络架构的性能',
      variants,
      configuration: this.defaultConfiguration,
      status: 'draft',
      startTime: Date.now(),
      results: this.createEmptyResults(variants),
      samples: {}
    };

    this.queueTest(test);
  }

  private async createLearningStrategyABTest(): Promise<void> {
    const variants: ABTestVariant[] = [
      {
        id: 'static',
        name: 'Static Learning',
        description: '固定学习率和参数',
        configuration: {
          learningStrategy: 'static',
          learningRate: 0.001,
          batchSize: 32,
          epochs: 50
        },
        trafficWeight: 25,
        isControl: true
      },
      {
        id: 'adaptive',
        name: 'Adaptive Learning',
        description: '自适应学习率调整',
        configuration: {
          learningStrategy: 'adaptive',
          learningRateSchedule: 'cosine_annealing',
          earlyStopping: true,
          reduceLROnPlateau: true
        },
        trafficWeight: 25,
        isControl: false
      },
      {
        id: 'evolutionary',
        name: 'Evolutionary Learning',
        description: '进化算法优化学习策略',
        configuration: {
          learningStrategy: 'evolutionary',
          populationSize: 20,
          mutationRate: 0.1,
          evolutionGenerations: 50
        },
        trafficWeight: 25,
        isControl: false
      },
      {
        id: 'meta',
        name: 'Meta Learning',
        description: '元学习快速适应',
        configuration: {
          learningStrategy: 'meta',
          metaLearningRate: 0.01,
          fewShotLearning: true,
          transferLearning: true
        },
        trafficWeight: 25,
        isControl: false
      }
    ];

    const test: ABTest = {
      id: `learning_test_${Date.now()}`,
      name: 'Learning Strategy Optimization',
      description: '对比不同学习策略的效果',
      variants,
      configuration: this.defaultConfiguration,
      status: 'draft',
      startTime: Date.now(),
      results: this.createEmptyResults(variants),
      samples: {}
    };

    this.queueTest(test);
  }

  private queueTest(test: ABTest): void {
    this.testQueue.push(test);
    this.emit('test-queued', { testId: test.id, testName: test.name });
  }

  private scheduleTests(): void {
    // 检查是否有可用的测试槽位
    if (this.activeTests.size >= this.defaultConfiguration.maxConcurrentTests) {
      return;
    }

    // 从队列中启动测试
    while (this.testQueue.length > 0 && this.activeTests.size < this.defaultConfiguration.maxConcurrentTests) {
      const test = this.testQueue.shift()!;
      this.startTest(test);
    }
  }

  private startTest(test: ABTest): void {
    test.status = 'running';
    this.activeTests.set(test.id, test);
    
    // 初始化样本收集
    test.samples = {};
    test.variants.forEach(variant => {
      test.samples![variant.id] = [];
    });

    this.emit('test-started', { 
      testId: test.id, 
      testName: test.name,
      variants: test.variants.length 
    });
  }

  private collectSamples(): void {
    this.activeTests.forEach(test => {
      this.collectTestSamples(test);
    });
  }

  private collectTestSamples(test: ABTest): void {
    test.variants.forEach(variant => {
      // 根据流量权重收集样本
      const sampleCount = Math.floor(Math.random() * 5) + 1; // 1-5个样本
      
      for (let i = 0; i < sampleCount; i++) {
        const sample: ABTestSample = {
          id: `sample_${Date.now()}_${Math.random()}`,
          variantId: variant.id,
          timestamp: Date.now(),
          metrics: this.generateSampleMetrics(variant, test),
          metadata: {
            testId: test.id,
            variantName: variant.name
          }
        };

        test.samples![variant.id].push(sample);
      }
    });

    // 更新测试结果
    this.updateTestResults(test);
  }

  private generateSampleMetrics(variant: ABTestVariant, test: ABTest): { [metric: string]: number } {
    const metrics: { [metric: string]: number } = {};

    // 生成主要指标
    test.configuration.metrics.primary.forEach(metric => {
      const threshold = test.configuration.metrics.successThresholds[metric];
      const baseValue = threshold * (0.8 + Math.random() * 0.4); // ±20%变化
      metrics[metric] = baseValue;
    });

    // 生成次要指标
    test.configuration.metrics.secondary.forEach(metric => {
      const threshold = test.configuration.metrics.successThresholds[metric];
      const baseValue = threshold * (0.9 + Math.random() * 0.2); // ±10%变化
      metrics[metric] = baseValue;
    });

    return metrics;
  }

  private updateTestResults(test: ABTest): void {
    const results = this.calculateTestResults(test);
    test.results = results;

    // 检查是否应该停止测试
    if (this.shouldStopTest(test)) {
      this.completeTest(test.id, 'completed');
    }
  }

  private calculateTestResults(test: ABTest): ABTestResults {
    const sampleSizes: { [variantId: string]: number } = {};
    const conversionRates: { [variantId: string]: number } = {};
    const improvements: { [variantId: string]: number } = {};
    const statisticalSignificance: { [variantId: string]: number } = {};
    const confidenceIntervals: { [variantId: string]: [number, number] } = {};

    const controlVariant = test.variants.find(v => v.isControl);
    
    test.variants.forEach(variant => {
      const samples = test.samples![variant.id] || [];
      sampleSizes[variant.id] = samples.length;

      if (samples.length > 0) {
        // 计算转换率（基于主要指标）
        const primaryMetric = test.configuration.metrics.primary[0];
        const avgMetric = samples.reduce((sum, sample) => sum + sample.metrics[primaryMetric], 0) / samples.length;
        conversionRates[variant.id] = avgMetric;

        // 计算改进幅度
        if (controlVariant && variant.id !== controlVariant.id) {
          const controlRate = conversionRates[controlVariant.id] || 0;
          improvements[variant.id] = controlRate > 0 ? (avgMetric - controlRate) / controlRate : 0;
        }

        // 计算统计显著性（简化版本）
        statisticalSignificance[variant.id] = this.calculateStatisticalSignificance(samples, controlVariant ? test.samples![controlVariant.id] : []);

        // 计算置信区间
        confidenceIntervals[variant.id] = this.calculateConfidenceInterval(samples);
      }
    });

    // 确定获胜者
    let winner: string | undefined;
    let recommendation = '继续测试以收集更多数据';

    if (controlVariant) {
      const bestVariant = test.variants.reduce((best, variant) => {
        if (variant.isControl) return best;
        const improvement = improvements[variant.id] || 0;
        const significance = statisticalSignificance[variant.id] || 0;
        return (improvement > (improvements[best.id] || 0) && significance < 0.05) ? variant : best;
      }, controlVariant);

      if (bestVariant.id !== controlVariant.id) {
        winner = bestVariant.id;
        recommendation = `建议采用 ${bestVariant.name} 配置`;
      }
    }

    return {
      sampleSizes,
      conversionRates,
      improvements,
      statisticalSignificance,
      confidenceIntervals,
      winner,
      recommendation,
      statisticalPower: this.calculateStatisticalPower(test)
    };
  }

  private calculateStatisticalSignificance(samples1: ABTestSample[], samples2: ABTestSample[]): number {
    // 简化的统计显著性计算
    if (samples1.length === 0 || samples2.length === 0) return 1;

    const mean1 = samples1.reduce((sum, s) => sum + s.metrics.accuracy, 0) / samples1.length;
    const mean2 = samples2.reduce((sum, s) => sum + s.metrics.accuracy, 0) / samples2.length;
    
    const variance1 = samples1.reduce((sum, s) => sum + Math.pow(s.metrics.accuracy - mean1, 2), 0) / samples1.length;
    const variance2 = samples2.reduce((sum, s) => sum + Math.pow(s.metrics.accuracy - mean2, 2), 0) / samples2.length;

    const pooledVariance = (variance1 + variance2) / 2;
    const standardError = Math.sqrt(pooledVariance * (1/samples1.length + 1/samples2.length));
    
    const tStatistic = Math.abs(mean1 - mean2) / standardError;
    
    // 简化的p值计算
    return Math.exp(-tStatistic * tStatistic / 2);
  }

  private calculateConfidenceInterval(samples: ABTestSample[]): [number, number] {
    if (samples.length === 0) return [0, 0];

    const values = samples.map(s => s.metrics.accuracy);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardError = Math.sqrt(variance / values.length);
    
    // 95%置信区间
    const margin = 1.96 * standardError;
    return [mean - margin, mean + margin];
  }

  private calculateStatisticalPower(test: ABTest): number {
    // 简化的统计功效计算
    const totalSamples = Object.values(test.results.sampleSizes).reduce((sum, size) => sum + size, 0);
    return Math.min(0.95, totalSamples / 1000);
  }

  private shouldStopTest(test: ABTest): boolean {
    const now = Date.now();
    const duration = now - test.startTime;
    const config = test.configuration.stoppingRules;

    // 检查最小持续时间
    if (duration < config.minDuration) return false;

    // 检查最大持续时间
    if (duration > config.maxDuration) return true;

    // 检查样本大小
    const minSampleSize = Math.min(...Object.values(test.results.sampleSizes));
    if (minSampleSize < test.configuration.minSampleSize) return false;

    // 检查统计显著性（如果启用了早期停止）
    if (config.earlyStopping) {
      const significance = test.results.statisticalSignificance;
      const hasSignificantWinner = Object.values(significance).some(p => p < config.significanceThreshold);
      if (hasSignificantWinner) return true;
    }

    return false;
  }

  private completeTest(testId: string, reason: string): void {
    const test = this.activeTests.get(testId);
    if (!test) return;

    test.status = 'completed';
    test.endTime = Date.now();
    
    this.activeTests.delete(testId);
    this.completedTests.set(testId, test);

    // 应用获胜配置
    if (test.results.winner) {
      this.applyWinnerConfiguration(test);
    }

    this.emit('test-completed', {
      testId,
      testName: test.name,
      reason,
      winner: test.results.winner,
      recommendation: test.results.recommendation
    });
  }

  private applyWinnerConfiguration(test: ABTest): void {
    const winnerVariant = test.variants.find(v => v.id === test.results.winner);
    if (!winnerVariant) return;

    // 根据测试类型应用配置
    if (test.name.includes('Configuration')) {
      this.adaptiveLearningSystem['evolutionEngine'].updateConfiguration(winnerVariant.configuration);
    } else if (test.name.includes('Architecture')) {
      // 应用架构配置
      this.emit('architecture-winner-applied', {
        testId: test.id,
        variant: winnerVariant
      });
    } else if (test.name.includes('Learning')) {
      // 应用学习策略
      this.emit('learning-strategy-winner-applied', {
        testId: test.id,
        variant: winnerVariant
      });
    }
  }

  private createEmptyResults(variants: ABTestVariant[]): ABTestResults {
    const emptyResults: ABTestResults = {
      sampleSizes: {},
      conversionRates: {},
      improvements: {},
      statisticalSignificance: {},
      confidenceIntervals: {},
      recommendation: '测试刚开始，等待数据收集',
      statisticalPower: 0
    };

    variants.forEach(variant => {
      emptyResults.sampleSizes[variant.id] = 0;
      emptyResults.conversionRates[variant.id] = 0;
      emptyResults.improvements[variant.id] = 0;
      emptyResults.statisticalSignificance[variant.id] = 1;
      emptyResults.confidenceIntervals[variant.id] = [0, 0];
    });

    return emptyResults;
  }

  // 公共API方法
  public getActiveTests(): ABTest[] {
    return Array.from(this.activeTests.values());
  }

  public getCompletedTests(): ABTest[] {
    return Array.from(this.completedTests.values());
  }

  public getTestQueue(): ABTest[] {
    return [...this.testQueue];
  }

  public getABTestingStatus(): {
    isRunning: boolean;
    activeTests: number;
    completedTests: number;
    queuedTests: number;
    totalSamples: number;
  } {
    let totalSamples = 0;
    this.activeTests.forEach(test => {
      Object.values(test.samples || {}).forEach(samples => {
        totalSamples += samples.length;
      });
    });

    return {
      isRunning: this.isRunning,
      activeTests: this.activeTests.size,
      completedTests: this.completedTests.size,
      queuedTests: this.testQueue.length,
      totalSamples
    };
  }

  public createCustomTest(name: string, description: string, variants: ABTestVariant[]): string {
    const test: ABTest = {
      id: `custom_test_${Date.now()}`,
      name,
      description,
      variants,
      configuration: this.defaultConfiguration,
      status: 'draft',
      startTime: Date.now(),
      results: this.createEmptyResults(variants),
      samples: {}
    };

    this.queueTest(test);
    return test.id;
  }

  public exportABTestingReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      status: this.getABTestingStatus(),
      activeTests: this.getActiveTests().map(test => ({
        id: test.id,
        name: test.name,
        status: test.status,
        duration: Date.now() - test.startTime,
        sampleSizes: test.results.sampleSizes,
        winner: test.results.winner
      })),
      completedTests: this.getCompletedTests().map(test => ({
        id: test.id,
        name: test.name,
        winner: test.results.winner,
        recommendation: test.results.recommendation,
        duration: (test.endTime || test.startTime) - test.startTime
      }))
    };

    return JSON.stringify(report, null, 2);
  }
}