import { EventEmitter } from 'events';
import { SelfAnalysisManager } from './selfAnalysisManager';

export interface EvolutionConfiguration {
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  maxGenerations: number;
  fitnessThreshold: number;
  evolutionInterval: number;
  parameters: {
    model: {
      learningRate: { min: number; max: number; step: number };
      batchSize: { min: number; max: number; step: number };
      epochs: { min: number; max: number; step: number };
      dropout: { min: number; max: number; step: number };
    };
    system: {
      thresholds: {
        responseTime: { min: number; max: number; step: number };
        memoryUsage: { min: number; max: number; step: number };
        cpuUsage: { min: number; max: number; step: number };
      };
      intervals: {
        monitoring: { min: number; max: number; step: number };
        evaluation: { min: number; max: number; step: number };
        learning: { min: number; max: number; step: number };
      };
    };
  };
}

export interface Individual {
  id: string;
  genes: {
    model: {
      learningRate: number;
      batchSize: number;
      epochs: number;
      dropout: number;
    };
    system: {
      thresholds: {
        responseTime: number;
        memoryUsage: number;
        cpuUsage: number;
      };
      intervals: {
        monitoring: number;
        evaluation: number;
        learning: number;
      };
    };
  };
  fitness: number;
  generation: number;
  history: EvolutionHistory[];
}

export interface EvolutionHistory {
  timestamp: number;
  fitness: number;
  configuration: any;
  performance: {
    accuracy: number;
    speed: number;
    efficiency: number;
    stability: number;
  };
}

export interface EvolutionMetrics {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  diversity: number;
  convergence: number;
  improvements: number;
}

export class EvolutionEngine extends EventEmitter {
  private selfAnalysisManager: SelfAnalysisManager;
  private population: Individual[] = [];
  private generation = 0;
  private bestIndividual: Individual | null = null;
  private evolutionHistory: EvolutionMetrics[] = [];
  private isRunning = false;
  private evolutionTimer: NodeJS.Timeout | null = null;
  
  private readonly configuration: EvolutionConfiguration = {
    populationSize: 20,
    mutationRate: 0.1,
    crossoverRate: 0.7,
    maxGenerations: 100,
    fitnessThreshold: 0.95,
    evolutionInterval: 300000, // 5 minutes
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
  };

  constructor(selfAnalysisManager: SelfAnalysisManager, configuration?: Partial<EvolutionConfiguration>) {
    super();
    this.selfAnalysisManager = selfAnalysisManager;
    
    if (configuration) {
      this.configuration = { ...this.configuration, ...configuration };
    }
    
    this.initializePopulation();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // 监听系统性能事件
    this.selfAnalysisManager.on('performance-alert', (alert) => {
      this.adaptToPerformanceIssues(alert);
    });

    this.selfAnalysisManager.on('model-performance-degraded', (data) => {
      this.triggerEmergencyEvolution(data);
    });

    this.selfAnalysisManager.on('accuracy-drop', (data) => {
      this.focusOnAccuracyImprovement(data);
    });
  }

  private initializePopulation(): void {
    this.population = [];
    
    for (let i = 0; i < this.configuration.populationSize; i++) {
      const individual = this.createRandomIndividual();
      individual.id = `individual_${i}_${Date.now()}`;
      individual.generation = 0;
      individual.history = [];
      this.population.push(individual);
    }
  }

  private createRandomIndividual(): Individual {
    const params = this.configuration.parameters;
    
    return {
      id: '',
      genes: {
        model: {
          learningRate: this.randomInRange(params.model.learningRate),
          batchSize: this.randomInRange(params.model.batchSize),
          epochs: this.randomInRange(params.model.epochs),
          dropout: this.randomInRange(params.model.dropout)
        },
        system: {
          thresholds: {
            responseTime: this.randomInRange(params.system.thresholds.responseTime),
            memoryUsage: this.randomInRange(params.system.thresholds.memoryUsage),
            cpuUsage: this.randomInRange(params.system.thresholds.cpuUsage)
          },
          intervals: {
            monitoring: this.randomInRange(params.system.intervals.monitoring),
            evaluation: this.randomInRange(params.system.intervals.evaluation),
            learning: this.randomInRange(params.system.intervals.learning)
          }
        }
      },
      fitness: 0,
      generation: 0,
      history: []
    };
  }

  private randomInRange(range: { min: number; max: number; step: number }): number {
    const steps = Math.floor((range.max - range.min) / range.step);
    const randomStep = Math.floor(Math.random() * (steps + 1));
    return range.min + randomStep * range.step;
  }

  public async startEvolution(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.emit('evolution-started', { generation: this.generation });

    // 立即开始第一次进化
    await this.evolveGeneration();

    // 设置定时进化
    this.evolutionTimer = setInterval(async () => {
      if (this.isRunning) {
        await this.evolveGeneration();
      }
    }, this.configuration.evolutionInterval);
  }

  public stopEvolution(): void {
    this.isRunning = false;
    
    if (this.evolutionTimer) {
      clearInterval(this.evolutionTimer);
      this.evolutionTimer = null;
    }

    this.emit('evolution-stopped', { 
      generation: this.generation,
      bestFitness: this.bestIndividual?.fitness || 0
    });
  }

  private async evolveGeneration(): Promise<void> {
    this.emit('generation-started', { generation: this.generation });

    // 评估当前种群的适应度
    await this.evaluatePopulation();

    // 记录进化指标
    this.recordEvolutionMetrics();

    // 检查是否达到终止条件
    if (this.shouldTerminate()) {
      this.emit('evolution-completed', { 
        generation: this.generation,
        bestIndividual: this.bestIndividual 
      });
      return;
    }

    // 选择、交叉、变异
    const newPopulation = await this.createNextGeneration();
    
    // 应用最优配置到实际系统
    await this.applyBestConfiguration();

    this.population = newPopulation;
    this.generation++;

    this.emit('generation-completed', { 
      generation: this.generation,
      bestFitness: this.bestIndividual?.fitness || 0,
      avgFitness: this.calculateAverageFitness()
    });
  }

  private async evaluatePopulation(): Promise<void> {
    const evaluationPromises = this.population.map(async (individual) => {
      const fitness = await this.calculateFitness(individual);
      individual.fitness = fitness;
      
      // 记录历史
      individual.history.push({
        timestamp: Date.now(),
        fitness: fitness,
        configuration: individual.genes,
        performance: await this.getCurrentPerformance()
      });
    });

    await Promise.all(evaluationPromises);

    // 更新最优个体
    const currentBest = this.population.reduce((best, individual) => 
      individual.fitness > best.fitness ? individual : best
    );

    if (!this.bestIndividual || currentBest.fitness > this.bestIndividual.fitness) {
      this.bestIndividual = { ...currentBest };
      this.emit('new-best-individual', { 
        generation: this.generation,
        individual: this.bestIndividual 
      });
    }
  }

  private async calculateFitness(individual: Individual): Promise<number> {
    // 综合评估多个维度
    const performance = await this.getCurrentPerformance();
    const accuracyScore = performance.accuracy;
    const speedScore = Math.max(0, 1 - performance.speed / 10000); // 归一化速度得分
    const efficiencyScore = Math.max(0, 1 - performance.efficiency / 1000); // 归一化效率得分
    const stabilityScore = performance.stability;

    // 权重可以根据需求调整
    const weights = {
      accuracy: 0.4,
      speed: 0.2,
      efficiency: 0.2,
      stability: 0.2
    };

    const fitness = 
      accuracyScore * weights.accuracy +
      speedScore * weights.speed +
      efficiencyScore * weights.efficiency +
      stabilityScore * weights.stability;

    return Math.max(0, Math.min(1, fitness));
  }

  private async getCurrentPerformance(): Promise<{
    accuracy: number;
    speed: number;
    efficiency: number;
    stability: number;
  }> {
    const systemStats = this.selfAnalysisManager.getSystemStatistics();
    const performanceReport = this.selfAnalysisManager.getPerformanceMonitor()?.getPerformanceReport();
    
    return {
      accuracy: systemStats.performanceMetrics?.avgAccuracy || 0,
      speed: systemStats.performanceMetrics?.avgResponseTime || 0,
      efficiency: systemStats.performanceMetrics?.avgMemoryUsage || 0,
      stability: systemStats.systemHealth?.score || 0
    };
  }

  private recordEvolutionMetrics(): void {
    const metrics: EvolutionMetrics = {
      generation: this.generation,
      bestFitness: this.bestIndividual?.fitness || 0,
      avgFitness: this.calculateAverageFitness(),
      diversity: this.calculatePopulationDiversity(),
      convergence: this.calculateConvergence(),
      improvements: this.countImprovements()
    };

    this.evolutionHistory.push(metrics);
    
    if (this.evolutionHistory.length > 100) {
      this.evolutionHistory = this.evolutionHistory.slice(-100);
    }

    this.emit('evolution-metrics', metrics);
  }

  private calculateAverageFitness(): number {
    const totalFitness = this.population.reduce((sum, individual) => sum + individual.fitness, 0);
    return totalFitness / this.population.length;
  }

  private calculatePopulationDiversity(): number {
    // 计算基因多样性
    const geneDiversity = new Set(
      this.population.map(ind => JSON.stringify(ind.genes))
    ).size / this.population.length;
    
    return geneDiversity;
  }

  private calculateConvergence(): number {
    if (this.evolutionHistory.length < 2) return 0;
    
    const recent = this.evolutionHistory.slice(-10);
    const fitnessVariance = recent.map(m => Math.pow(m.bestFitness - m.avgFitness, 2));
    const avgVariance = fitnessVariance.reduce((sum, v) => sum + v, 0) / fitnessVariance.length;
    
    return Math.max(0, 1 - Math.sqrt(avgVariance));
  }

  private countImprovements(): number {
    if (this.evolutionHistory.length < 2) return 0;
    
    let improvements = 0;
    for (let i = 1; i < this.evolutionHistory.length; i++) {
      if (this.evolutionHistory[i].bestFitness > this.evolutionHistory[i-1].bestFitness) {
        improvements++;
      }
    }
    
    return improvements;
  }

  private shouldTerminate(): boolean {
    return (
      this.generation >= this.configuration.maxGenerations ||
      (this.bestIndividual && this.bestIndividual.fitness >= this.configuration.fitnessThreshold)
    );
  }

  private async createNextGeneration(): Promise<Individual[]> {
    const newPopulation: Individual[] = [];
    
    // 保留最优个体（精英策略）
    if (this.bestIndividual) {
      newPopulation.push({ ...this.bestIndividual });
    }

    // 生成新个体
    while (newPopulation.length < this.configuration.populationSize) {
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();
      
      let offspring = this.crossover(parent1, parent2);
      offspring = this.mutate(offspring);
      
      offspring.id = `offspring_${newPopulation.length}_${Date.now()}`;
      offspring.generation = this.generation + 1;
      offspring.fitness = 0;
      offspring.history = [];
      
      newPopulation.push(offspring);
    }

    return newPopulation.slice(0, this.configuration.populationSize);
  }

  private tournamentSelection(): Individual {
    const tournamentSize = 3;
    const tournament: Individual[] = [];
    
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[randomIndex]);
    }
    
    return tournament.reduce((best, individual) => 
      individual.fitness > best.fitness ? individual : best
    );
  }

  private crossover(parent1: Individual, parent2: Individual): Individual {
    if (Math.random() > this.configuration.crossoverRate) {
      return { ...parent1 };
    }

    const offspring: Individual = {
      id: '',
      genes: {
        model: {
          learningRate: Math.random() < 0.5 ? parent1.genes.model.learningRate : parent2.genes.model.learningRate,
          batchSize: Math.random() < 0.5 ? parent1.genes.model.batchSize : parent2.genes.model.batchSize,
          epochs: Math.random() < 0.5 ? parent1.genes.model.epochs : parent2.genes.model.epochs,
          dropout: Math.random() < 0.5 ? parent1.genes.model.dropout : parent2.genes.model.dropout
        },
        system: {
          thresholds: {
            responseTime: Math.random() < 0.5 ? parent1.genes.system.thresholds.responseTime : parent2.genes.system.thresholds.responseTime,
            memoryUsage: Math.random() < 0.5 ? parent1.genes.system.thresholds.memoryUsage : parent2.genes.system.thresholds.memoryUsage,
            cpuUsage: Math.random() < 0.5 ? parent1.genes.system.thresholds.cpuUsage : parent2.genes.system.thresholds.cpuUsage
          },
          intervals: {
            monitoring: Math.random() < 0.5 ? parent1.genes.system.intervals.monitoring : parent2.genes.system.intervals.monitoring,
            evaluation: Math.random() < 0.5 ? parent1.genes.system.intervals.evaluation : parent2.genes.system.intervals.evaluation,
            learning: Math.random() < 0.5 ? parent1.genes.system.intervals.learning : parent2.genes.system.intervals.learning
          }
        }
      },
      fitness: 0,
      generation: 0,
      history: []
    };

    return offspring;
  }

  private mutate(individual: Individual): Individual {
    const mutated = { ...individual };
    const params = this.configuration.parameters;

    // 模型参数变异
    if (Math.random() < this.configuration.mutationRate) {
      mutated.genes.model.learningRate = this.randomInRange(params.model.learningRate);
    }
    if (Math.random() < this.configuration.mutationRate) {
      mutated.genes.model.batchSize = this.randomInRange(params.model.batchSize);
    }
    if (Math.random() < this.configuration.mutationRate) {
      mutated.genes.model.epochs = this.randomInRange(params.model.epochs);
    }
    if (Math.random() < this.configuration.mutationRate) {
      mutated.genes.model.dropout = this.randomInRange(params.model.dropout);
    }

    // 系统参数变异
    if (Math.random() < this.configuration.mutationRate) {
      mutated.genes.system.thresholds.responseTime = this.randomInRange(params.system.thresholds.responseTime);
    }
    if (Math.random() < this.configuration.mutationRate) {
      mutated.genes.system.thresholds.memoryUsage = this.randomInRange(params.system.thresholds.memoryUsage);
    }
    if (Math.random() < this.configuration.mutationRate) {
      mutated.genes.system.thresholds.cpuUsage = this.randomInRange(params.system.thresholds.cpuUsage);
    }

    return mutated;
  }

  private async applyBestConfiguration(): Promise<void> {
    if (!this.bestIndividual) return;

    const newConfig = {
      performanceMonitoring: {
        enabled: true,
        interval: this.bestIndividual.genes.system.intervals.monitoring,
        thresholds: {
          responseTime: this.bestIndividual.genes.system.thresholds.responseTime,
          memoryUsage: this.bestIndividual.genes.system.thresholds.memoryUsage,
          cpuUsage: this.bestIndividual.genes.system.thresholds.cpuUsage
        }
      },
      modelEvaluation: {
        enabled: true,
        evaluationInterval: this.bestIndividual.genes.system.intervals.evaluation,
        driftDetectionWindow: 100,
        accuracyThreshold: 0.8
      },
      realTimeFeedback: {
        enabled: true,
        feedbackInterval: this.bestIndividual.genes.system.intervals.monitoring,
        maxMessages: 100
      },
      continuousLearning: {
        enabled: true,
        learningInterval: this.bestIndividual.genes.system.intervals.learning,
        minTrainingSamples: 100,
        improvementThreshold: 0.02
      }
    };

    this.selfAnalysisManager.updateConfiguration(newConfig);
    
    this.emit('configuration-applied', {
      generation: this.generation,
      fitness: this.bestIndividual.fitness,
      configuration: newConfig
    });
  }

  // 适应性响应方法
  private adaptToPerformanceIssues(alert: any): void {
    if (alert.type === 'response-time') {
      // 增加监控频率，降低响应时间阈值
      this.configuration.parameters.system.intervals.monitoring.step = 500;
      this.configuration.parameters.system.thresholds.responseTime.max = alert.threshold * 0.8;
    }
    
    if (alert.type === 'memory-usage') {
      // 降低内存使用阈值
      this.configuration.parameters.system.thresholds.memoryUsage.max = alert.threshold * 0.9;
    }

    this.emit('adaptation-triggered', { type: 'performance', alert });
  }

  private triggerEmergencyEvolution(data: any): void {
    // 紧急进化：增加变异率，减小种群规模
    this.configuration.mutationRate = Math.min(0.3, this.configuration.mutationRate * 1.5);
    this.configuration.evolutionInterval = Math.max(60000, this.configuration.evolutionInterval / 2);
    
    this.emit('emergency-evolution-triggered', data);
  }

  private focusOnAccuracyImprovement(data: any): void {
    // 专注于准确性改进：调整模型参数范围
    this.configuration.parameters.model.learningRate.min = Math.max(0.00001, this.configuration.parameters.model.learningRate.min * 0.8);
    this.configuration.parameters.model.epochs.min = Math.min(200, this.configuration.parameters.model.epochs.min + 10);
    
    this.emit('accuracy-focus-triggered', data);
  }

  // 公共API方法
  public getEvolutionStatus(): {
    isRunning: boolean;
    generation: number;
    bestFitness: number;
    avgFitness: number;
    populationSize: number;
    configuration: EvolutionConfiguration;
  } {
    return {
      isRunning: this.isRunning,
      generation: this.generation,
      bestFitness: this.bestIndividual?.fitness || 0,
      avgFitness: this.calculateAverageFitness(),
      populationSize: this.population.length,
      configuration: this.configuration
    };
  }

  public getEvolutionHistory(): EvolutionMetrics[] {
    return [...this.evolutionHistory];
  }

  public getBestIndividual(): Individual | null {
    return this.bestIndividual ? { ...this.bestIndividual } : null;
  }

  public getPopulation(): Individual[] {
    return this.population.map(ind => ({ ...ind }));
  }

  public updateConfiguration(updates: Partial<EvolutionConfiguration>): void {
    this.configuration = { ...this.configuration, ...updates };
    this.emit('evolution-configuration-updated', this.configuration);
  }

  public forceEvolution(): Promise<void> {
    return this.evolveGeneration();
  }

  public exportEvolutionReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      evolutionStatus: this.getEvolutionStatus(),
      bestIndividual: this.bestIndividual,
      evolutionHistory: this.evolutionHistory,
      populationStats: {
        diversity: this.calculatePopulationDiversity(),
        convergence: this.calculateConvergence()
      }
    };

    return JSON.stringify(report, null, 2);
  }
}