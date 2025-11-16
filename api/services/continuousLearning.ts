import { EventEmitter } from 'events';
import * as tf from '@tensorflow/tfjs';
import { PerformanceMonitor } from './performanceMonitor';
import { ModelEvaluationService } from './modelEvaluation';
import { RealTimeFeedbackSystem } from './realTimeFeedback';

export interface LearningConfiguration {
  enabled: boolean;
  learningRate: number;
  adaptationThreshold: number;
  minTrainingSamples: number;
  maxTrainingSamples: number;
  validationSplit: number;
  improvementThreshold: number;
  learningInterval: number; // milliseconds
}

export interface LearningData {
  timestamp: Date;
  input: any;
  prediction: any;
  actual: any;
  confidence: number;
  accuracy: number;
  metadata: {
    modelVersion: string;
    trainingIteration: number;
    dataSource: string;
    userFeedback?: number;
    augmented?: boolean;
    balanced?: boolean;
    oversampleRatio?: number;
  };
}

export interface ModelUpdate {
  version: string;
  changes: string[];
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  trainingMetrics: {
    loss: number;
    validationLoss: number;
    epochs: number;
    trainingTime: number;
  };
  deploymentStatus: 'pending' | 'testing' | 'deployed' | 'rolled_back';
}

export class ContinuousLearningSystem extends EventEmitter {
  private performanceMonitor: PerformanceMonitor;
  private modelEvaluator: ModelEvaluationService;
  private feedbackSystem: RealTimeFeedbackSystem;
  private learningData: LearningData[] = [];
  private modelUpdates: ModelUpdate[] = [];
  private configuration: LearningConfiguration;
  private isLearning = false;
  private learningInterval: NodeJS.Timeout | null = null;
  private currentModelVersion = '1.0.0';
  private trainingIteration = 0;

  constructor(
    performanceMonitor: PerformanceMonitor,
    modelEvaluator: ModelEvaluationService,
    feedbackSystem: RealTimeFeedbackSystem,
    configuration?: Partial<LearningConfiguration>
  ) {
    super();
    this.performanceMonitor = performanceMonitor;
    this.modelEvaluator = modelEvaluator;
    this.feedbackSystem = feedbackSystem;
    
    this.configuration = {
      enabled: true,
      learningRate: 0.001,
      adaptationThreshold: 0.05,
      minTrainingSamples: 100,
      maxTrainingSamples: 1000,
      validationSplit: 0.2,
      improvementThreshold: 0.02,
      learningInterval: 300000, // 5 minutes
      ...configuration
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // 监听模型评估结果
    this.modelEvaluator.on('evaluation-complete', (evaluation) => {
      this.processEvaluationResult(evaluation);
    });

    // 监听性能监控数据
    this.performanceMonitor.on('performance-data', (data) => {
      this.processPerformanceData(data);
    });

    // 监听反馈系统
    this.feedbackSystem.on('new-suggestion', (suggestion) => {
      this.processOptimizationSuggestion(suggestion);
    });
  }

  public start(): void {
    if (this.isLearning || !this.configuration.enabled) return;

    this.isLearning = true;
    this.emit('learning-started');

    // 启动定期学习
    this.learningInterval = setInterval(() => {
      this.performContinuousLearning();
    }, this.configuration.learningInterval);

    this.feedbackSystem.publishFeedbackMessage({
      id: `learning-start-${Date.now()}`,
      type: 'info',
      category: 'model',
      title: '持续学习系统启动',
      message: '模型将持续学习和优化以提升性能',
      timestamp: new Date(),
      severity: 'low',
      actionable: false
    });
  }

  public stop(): void {
    if (!this.isLearning) return;

    this.isLearning = false;
    
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
      this.learningInterval = null;
    }

    this.emit('learning-stopped');

    this.feedbackSystem.publishFeedbackMessage({
      id: `learning-stop-${Date.now()}`,
      type: 'info',
      category: 'model',
      title: '持续学习系统停止',
      message: '模型学习已暂停',
      timestamp: new Date(),
      severity: 'low',
      actionable: false
    });
  }

  public addLearningData(data: LearningData): void {
    this.learningData.push(data);

    // 限制数据数量
    if (this.learningData.length > this.configuration.maxTrainingSamples) {
      this.learningData = this.learningData.slice(-this.configuration.maxTrainingSamples);
    }

    this.emit('learning-data-added', data);

    // 检查是否触发即时学习
    if (this.shouldTriggerImmediateLearning(data)) {
      this.performImmediateLearning(data);
    }
  }

  private shouldTriggerImmediateLearning(data: LearningData): boolean {
    // 如果置信度很低或准确性很差，触发即时学习
    return data.confidence < 0.5 || data.accuracy < 0.7;
  }

  private async performImmediateLearning(data: LearningData): Promise<void> {
    this.feedbackSystem.publishFeedbackMessage({
      id: `immediate-learning-${Date.now()}`,
      type: 'warning',
      category: 'model',
      title: '触发即时学习',
      message: `检测到低质量预测，立即进行模型调整`,
      timestamp: new Date(),
      severity: 'medium',
      actionable: true,
      action: {
        label: '查看详情',
        handler: async () => {
          this.emit('show-learning-details', data);
        }
      }
    });

    // 执行即时学习逻辑
    await this.adaptModel([data]);
  }

  private async performContinuousLearning(): Promise<void> {
    if (this.learningData.length < this.configuration.minTrainingSamples) {
      return;
    }

    this.emit('learning-cycle-started', {
      samples: this.learningData.length,
      iteration: this.trainingIteration
    });

    try {
      // 1. 数据预处理
      const processedData = this.preprocessLearningData();

      // 2. 模型训练
      const trainingResult = await this.trainModel(processedData);

      // 3. 模型验证
      const validationResult = await this.validateModel(trainingResult);

      // 4. 决定是否部署新模型
      if (this.shouldDeployNewModel(validationResult)) {
        await this.deployNewModel(validationResult);
      }

      this.emit('learning-cycle-completed', {
        iteration: this.trainingIteration,
        result: validationResult
      });

    } catch (error) {
      this.emit('learning-cycle-failed', error);
      
      this.feedbackSystem.publishFeedbackMessage({
        id: `learning-error-${Date.now()}`,
        type: 'error',
        category: 'model',
        title: '学习循环失败',
        message: `持续学习过程中发生错误: ${error.message}`,
        timestamp: new Date(),
        severity: 'high',
        actionable: true,
        action: {
          label: '诊断问题',
          handler: async () => {
            this.emit('diagnose-learning-error', error);
          }
        }
      });
    }
  }

  private preprocessLearningData(): any[] {
    // 数据清洗和预处理
    const validData = this.learningData.filter(data => 
      data.input && data.prediction && data.actual && data.confidence >= 0
    );

    // 数据增强
    const augmentedData = this.augmentData(validData);

    // 数据平衡
    const balancedData = this.balanceData(augmentedData);

    return balancedData;
  }

  private augmentData(data: LearningData[]): LearningData[] {
    // 简单的数据增强示例
    const augmented: LearningData[] = [...data];

    // 添加噪声
    data.forEach(item => {
      if (item.confidence > 0.8) {
        augmented.push({
          ...item,
          input: this.addNoiseToInput(item.input),
          timestamp: new Date(),
          metadata: {
            ...item.metadata,
            augmented: true
          }
        });
      }
    });

    return augmented;
  }

  private balanceData(data: LearningData[]): LearningData[] {
    // 简单的类别平衡
    const categories = new Map<string, LearningData[]>();
    
    data.forEach(item => {
      const key = JSON.stringify(item.actual);
      if (!categories.has(key)) {
        categories.set(key, []);
      }
      categories.get(key)!.push(item);
    });

    // 找到最大类别的大小
    const maxSize = Math.max(...Array.from(categories.values()).map(arr => arr.length));

    // 对较小的类别进行过采样
    const balanced: LearningData[] = [];
    categories.forEach((items, key) => {
      const ratio = maxSize / items.length;
      
      for (let i = 0; i < ratio; i++) {
        balanced.push(...items.map(item => ({
          ...item,
          timestamp: new Date(),
          metadata: {
            ...item.metadata,
            balanced: true,
            oversampleRatio: ratio
          }
        })));
      }
    });

    return balanced;
  }

  private addNoiseToInput(input: any): any {
    // 根据输入类型添加适当的噪声
    if (Array.isArray(input)) {
      return input.map(val => val + (Math.random() - 0.5) * 0.1);
    }
    return input;
  }

  private async trainModel(processedData: any[]): Promise<any> {
    this.trainingIteration++;

    // 划分训练集和验证集
    const splitIndex = Math.floor(processedData.length * (1 - this.configuration.validationSplit));
    const trainingData = processedData.slice(0, splitIndex);
    const validationData = processedData.slice(splitIndex);

    // 模拟模型训练（实际实现会调用具体的训练框架）
    const trainingResult = await this.simulateModelTraining(trainingData, validationData);

    return {
      trainingData,
      validationData,
      trainingResult,
      iteration: this.trainingIteration
    };
  }

  private async simulateModelTraining(trainingData: any[], validationData: any[]): Promise<any> {
    const normalizeInput = (input: any): number[] => {
      if (Array.isArray(input)) {
        return input.map((v) => Number(v));
      }
      if (typeof input === 'number') {
        return [input];
      }
      throw new Error('无法用于训练的输入数据格式');
    };

    const trainXArr: number[][] = trainingData.map((d) => normalizeInput(d.input));
    const trainYArr: (number | number[])[] = trainingData.map((d) => d.actual);
    const valXArr: number[][] = validationData.map((d) => normalizeInput(d.input));
    const valYArr: (number | number[])[] = validationData.map((d) => d.actual);

    const featureSize = trainXArr[0]?.length || 1;
    const isSparse = typeof trainYArr[0] === 'number';
    const classCount = isSparse
      ? Math.max(...(trainYArr as number[])) + 1
      : (trainYArr[0] as number[]).length;

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [featureSize] }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: classCount, activation: 'softmax' }));

    model.compile({
      optimizer: tf.train.adam(this.configuration.learningRate),
      loss: isSparse ? 'sparseCategoricalCrossentropy' : 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    const trainX = tf.tensor2d(trainXArr);
    const trainY = isSparse ? tf.tensor1d(trainYArr as number[], 'int32') : tf.tensor2d(trainYArr as number[][]);

    const startTime = Date.now();
    const history = await model.fit(trainX, trainY, {
      epochs: 20,
      validationSplit: 0.1,
      shuffle: true,
      verbose: 0
    });
    const trainingTime = Date.now() - startTime;

    trainX.dispose();
    trainY.dispose();

    const trainingLoss = (history.history.loss as number[]) || [];
    const validationLoss = (history.history.val_loss as number[]) || [];

    return {
      epochs: 20,
      trainingLoss,
      validationLoss,
      finalTrainingLoss: trainingLoss.slice(-1)[0] || 0,
      finalValidationLoss: validationLoss.slice(-1)[0] || 0,
      trainingTime,
      model
    };
  }

  private async validateModel(trainingResult: any): Promise<any> {
    const { validationData, trainingResult: modelResult } = trainingResult;

    const normalizeInput = (input: any): number[] => {
      if (Array.isArray(input)) return input.map((v) => Number(v));
      if (typeof input === 'number') return [input];
      throw new Error('无法用于验证的输入数据格式');
    };

    const valXArr: number[][] = validationData.map((d: any) => normalizeInput(d.input));
    const valYArr: (number | number[])[] = validationData.map((d: any) => d.actual);
    const isSparse = typeof valYArr[0] === 'number';

    const valX = tf.tensor2d(valXArr);
    const predictions = modelResult.model.predict(valX) as tf.Tensor;
    const predClasses = predictions.argMax(-1);
    const actualClasses = isSparse
      ? tf.tensor1d(valYArr as number[], 'int32')
      : tf.tensor2d(valYArr as number[][]).argMax(-1);

    const predArray = (predClasses.arraySync() as number[]);
    const actualArray = (actualClasses.arraySync() as number[]);

    const accuracy = predArray.reduce((acc, p, i) => acc + (p === actualArray[i] ? 1 : 0), 0) / predArray.length;

    const classes = Array.from(new Set(actualArray.concat(predArray)));
    let precisionSum = 0;
    let recallSum = 0;
    classes.forEach((c) => {
      let tp = 0, fp = 0, fn = 0;
      for (let i = 0; i < predArray.length; i++) {
        if (predArray[i] === c && actualArray[i] === c) tp++;
        else if (predArray[i] === c && actualArray[i] !== c) fp++;
        else if (predArray[i] !== c && actualArray[i] === c) fn++;
      }
      const precision = tp / Math.max(1, tp + fp);
      const recall = tp / Math.max(1, tp + fn);
      precisionSum += precision;
      recallSum += recall;
    });
    const precision = precisionSum / classes.length;
    const recall = recallSum / classes.length;
    const f1Score = (2 * precision * recall) / Math.max(1e-8, precision + recall);

    valX.dispose();
    predictions.dispose();
    predClasses.dispose();
    actualClasses.dispose();

    const validationMetrics = { accuracy, precision, recall, f1Score, samples: valXArr.length };

    return {
      ...trainingResult,
      validationMetrics,
      improvement: this.calculateImprovement(validationMetrics),
      timestamp: new Date()
    };
  }

  private async simulateModelValidation(validationData: any[]): Promise<any> {
    // 模拟验证指标
    const accuracy = 0.85 + Math.random() * 0.1;
    const precision = 0.82 + Math.random() * 0.12;
    const recall = 0.80 + Math.random() * 0.15;
    const f1Score = 2 * (precision * recall) / (precision + recall);

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      samples: validationData.length
    };
  }

  private calculateImprovement(metrics: any): number {
    // 计算相对于当前模型的改进
    // 这里使用简单的改进计算，实际实现会更复杂
    const currentMetrics = this.getCurrentModelMetrics();
    
    const accuracyImprovement = (metrics.accuracy - currentMetrics.accuracy) / currentMetrics.accuracy;
    const precisionImprovement = (metrics.precision - currentMetrics.precision) / currentMetrics.precision;
    const recallImprovement = (metrics.recall - currentMetrics.recall) / currentMetrics.recall;

    return (accuracyImprovement + precisionImprovement + recallImprovement) / 3;
  }

  private getCurrentModelMetrics(): any {
    // 获取当前模型的指标（模拟数据）
    return {
      accuracy: 0.82,
      precision: 0.80,
      recall: 0.78,
      f1Score: 0.79
    };
  }

  private shouldDeployNewModel(validationResult: any): boolean {
    const improvement = validationResult.improvement;
    const metrics = validationResult.validationMetrics;

    // 改进阈值检查
    if (improvement < this.configuration.improvementThreshold) {
      return false;
    }

    // 基本性能检查
    if (metrics.accuracy < 0.7 || metrics.precision < 0.7 || metrics.recall < 0.7) {
      return false;
    }

    return true;
  }

  private async deployNewModel(validationResult: any): Promise<void> {
    const newVersion = this.incrementVersion();
    
    const modelUpdate: ModelUpdate = {
      version: newVersion,
      changes: [
        `基于${validationResult.trainingData.length}个样本进行训练`,
        `验证准确率: ${(validationResult.validationMetrics.accuracy * 100).toFixed(1)}%`,
        `性能改进: ${(validationResult.improvement * 100).toFixed(1)}%`,
        `训练迭代: ${validationResult.iteration}`
      ],
      performance: validationResult.validationMetrics,
      trainingMetrics: {
        loss: validationResult.trainingResult.finalTrainingLoss,
        validationLoss: validationResult.trainingResult.finalValidationLoss,
        epochs: validationResult.trainingResult.epochs,
        trainingTime: validationResult.trainingResult.trainingTime
      },
      deploymentStatus: 'pending'
    };

    this.modelUpdates.push(modelUpdate);
    this.currentModelVersion = newVersion;

    // 模拟部署过程
    await this.simulateModelDeployment(modelUpdate);

    this.emit('model-updated', modelUpdate);

    this.feedbackSystem.publishFeedbackMessage({
      id: `model-update-${Date.now()}`,
      type: 'info',
      category: 'model',
      title: '模型更新完成',
      message: `新版本${newVersion}已部署，准确率提升至${(validationResult.validationMetrics.accuracy * 100).toFixed(1)}%`,
      timestamp: new Date(),
      severity: 'low',
      actionable: true,
      action: {
        label: '查看详情',
        handler: async () => {
          this.emit('show-model-update-details', modelUpdate);
        }
      }
    });
  }

  private incrementVersion(): string {
    const parts = this.currentModelVersion.split('.').map(Number);
    parts[2]++; // 增加补丁版本
    return parts.join('.');
  }

  private async simulateModelDeployment(modelUpdate: ModelUpdate): Promise<void> {
    modelUpdate.deploymentStatus = 'testing';
    
    // 模拟测试阶段
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    modelUpdate.deploymentStatus = 'deployed';
  }

  private processEvaluationResult(evaluation: any): void {
    // 处理模型评估结果
    if (evaluation.accuracy < 0.8) {
      this.feedbackSystem.publishFeedbackMessage({
        id: `low-accuracy-${Date.now()}`,
        type: 'warning',
        category: 'accuracy',
        title: '模型准确率较低',
        message: `当前模型准确率仅为${(evaluation.accuracy * 100).toFixed(1)}%，建议收集更多训练数据`,
        timestamp: new Date(),
        severity: 'medium',
        actionable: true,
        action: {
          label: '收集数据',
          handler: async () => {
            this.emit('collect-more-data');
          }
        }
      });
    }
  }

  private processPerformanceData(data: any): void {
    // 处理性能数据
    if (data.inferenceTime > 1000) { // 超过1秒
      this.feedbackSystem.publishFeedbackMessage({
        id: `slow-inference-${Date.now()}`,
        type: 'warning',
        category: 'performance',
        title: '推理速度较慢',
        message: `模型推理时间${data.inferenceTime}ms，建议优化模型结构`,
        timestamp: new Date(),
        severity: 'medium',
        actionable: true,
        action: {
          label: '优化模型',
          handler: async () => {
            this.emit('optimize-model-performance');
          }
        }
      });
    }
  }

  private processOptimizationSuggestion(suggestion: any): void {
    // 处理优化建议
    if (suggestion.category === 'model' && suggestion.type === 'optimization') {
      // 自动应用某些模型优化建议
      this.autoApplyOptimization(suggestion);
    }
  }

  private async autoApplyOptimization(suggestion: any): Promise<void> {
    // 自动应用模型优化
    this.emit('auto-optimization-applied', suggestion);
  }

  public getLearningStatistics(): any {
    const totalSamples = this.learningData.length;
    const recentSamples = this.learningData.filter(
      data => Date.now() - data.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length;

    const avgAccuracy = this.learningData.reduce((sum, data) => sum + data.accuracy, 0) / totalSamples;
    const avgConfidence = this.learningData.reduce((sum, data) => sum + data.confidence, 0) / totalSamples;

    return {
      totalSamples,
      recentSamples,
      avgAccuracy,
      avgConfidence,
      currentModelVersion: this.currentModelVersion,
      trainingIteration: this.trainingIteration,
      modelUpdates: this.modelUpdates.length,
      isLearning: this.isLearning
    };
  }

  public getModelUpdates(limit = 10): ModelUpdate[] {
    return this.modelUpdates.slice(-limit);
  }

  public getLearningData(limit = 100): LearningData[] {
    return this.learningData.slice(-limit);
  }

  public clearLearningData(): void {
    this.learningData = [];
    this.emit('learning-data-cleared');
  }

  public updateConfiguration(updates: Partial<LearningConfiguration>): void {
    this.configuration = { ...this.configuration, ...updates };
    
    if (updates.learningInterval && this.isLearning) {
      this.stop();
      this.start();
    }

    this.emit('configuration-updated', this.configuration);
  }

  public getConfiguration(): LearningConfiguration {
    return { ...this.configuration };
  }
  private async adaptModel(dataBatch: LearningData[]): Promise<void> {
    const processed = dataBatch.map(d => ({
      ...d,
      input: this.addNoiseToInput(d.input)
    }));

    const trainingResult = await this.trainModel(processed);
    const validationResult = await this.validateModel(trainingResult);
    if (this.shouldDeployNewModel(validationResult)) {
      await this.deployNewModel(validationResult);
    }
    this.emit('immediate-learning-completed', {
      iteration: this.trainingIteration,
      result: validationResult
    });
  }
}