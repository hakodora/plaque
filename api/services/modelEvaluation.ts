import * as tf from '@tensorflow/tfjs';
import { EventEmitter } from 'events';
import { PerformanceMonitor } from './performanceMonitor.js';

export interface ModelEvaluation {
  modelName: string;
  timestamp: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confidence: number;
  inferenceTime: number;
  memoryUsage: number;
  datasetSize: number;
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
}

export interface ModelComparison {
  modelA: string;
  modelB: string;
  metric: string;
  improvement: number;
  significance: number;
  recommendation: string;
}

export class ModelEvaluationService extends EventEmitter {
  private performanceMonitor: PerformanceMonitor;
  private evaluationHistory: ModelEvaluation[] = [];
  private baselineModels: Map<string, ModelEvaluation> = new Map();
  
  constructor(performanceMonitor: PerformanceMonitor) {
    super();
    this.performanceMonitor = performanceMonitor;
  }
  
  async evaluateModel(
    modelName: string,
    model: tf.LayersModel,
    testData: tf.Tensor[],
    labels: tf.Tensor[],
    options: {
      datasetName?: string;
      confidenceThreshold?: number;
      detailedMetrics?: boolean;
    } = {}
  ): Promise<ModelEvaluation> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    try {
      // 执行模型推理
      const predictions = model.predict(tf.stack(testData)) as tf.Tensor;
      const predictedClasses = predictions.argMax(-1);
      const actualClasses = labels.argMax(-1);
      
      // 计算基础指标
      const accuracy = this.calculateAccuracy(predictedClasses, actualClasses);
      const precision = this.calculatePrecision(predictedClasses, actualClasses);
      const recall = this.calculateRecall(predictedClasses, actualClasses);
      const f1Score = this.calculateF1Score(precision, recall);
      
      // 计算混淆矩阵
      const confusionMatrix = this.calculateConfusionMatrix(predictedClasses, actualClasses);
      
      // 计算平均置信度
      const avgConfidence = this.calculateAverageConfidence(predictions);
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;
      
      const evaluation: ModelEvaluation = {
        modelName,
        timestamp: Date.now(),
        accuracy,
        precision,
        recall,
        f1Score,
        confidence: avgConfidence,
        inferenceTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        datasetSize: testData.length,
        confusionMatrix
      };
      
      // 记录到性能监控器
      this.performanceMonitor.recordModelPerformance({
        modelName,
        inferenceTime: evaluation.inferenceTime,
        accuracy: evaluation.accuracy,
        confidence: evaluation.confidence,
        memoryUsage: evaluation.memoryUsage,
        predictions: testData.length,
        timestamp: Date.now()
      });
      
      // 保存评估历史
      this.evaluationHistory.push(evaluation);
      
      // 检测准确性下降
      const recentEvaluations = this.evaluationHistory.filter(e => e.modelName === modelName).slice(-5);
      if (recentEvaluations.length >= 2) {
        const previousAccuracy = recentEvaluations[recentEvaluations.length - 2].accuracy;
        const accuracyDrop = previousAccuracy - evaluation.accuracy;
        
        if (accuracyDrop > 0.05) { // 5%下降阈值
          this.emit('accuracy-drop', {
            modelName,
            previousAccuracy,
            currentAccuracy: evaluation.accuracy,
            accuracyDrop,
            severity: accuracyDrop > 0.1 ? 'high' : 'medium',
            timestamp: Date.now()
          });
        }
      }
      
      // 清理张量
      predictions.dispose();
      predictedClasses.dispose();
      
      return evaluation;
    } catch (error) {
      throw new Error(`模型评估失败: ${error.message}`);
    }
  }
  
  compareWithBaseline(modelName: string, currentEvaluation: ModelEvaluation): ModelComparison[] {
    const baseline = this.baselineModels.get(modelName);
    if (!baseline) {
      // 如果没有基线，将当前评估设为基线
      this.baselineModels.set(modelName, currentEvaluation);
      return [{
        modelA: 'baseline',
        modelB: modelName,
        metric: 'accuracy',
        improvement: 0,
        significance: 0,
        recommendation: '已建立新的基线模型'
      }];
    }
    
    const comparisons: ModelComparison[] = [];
    
    // 准确性比较
    const accuracyImprovement = currentEvaluation.accuracy - baseline.accuracy;
    comparisons.push({
      modelA: 'baseline',
      modelB: modelName,
      metric: 'accuracy',
      improvement: accuracyImprovement,
      significance: this.calculateStatisticalSignificance(accuracyImprovement, baseline.accuracy),
      recommendation: this.generateRecommendation('accuracy', accuracyImprovement)
    });
    
    // 推理时间比较
    const speedImprovement = (baseline.inferenceTime - currentEvaluation.inferenceTime) / baseline.inferenceTime;
    comparisons.push({
      modelA: 'baseline',
      modelB: modelName,
      metric: 'inferenceTime',
      improvement: speedImprovement,
      significance: Math.abs(speedImprovement),
      recommendation: this.generateRecommendation('speed', speedImprovement)
    });
    
    // 内存使用比较
    const memoryImprovement = (baseline.memoryUsage - currentEvaluation.memoryUsage) / baseline.memoryUsage;
    comparisons.push({
      modelA: 'baseline',
      modelB: modelName,
      metric: 'memoryUsage',
      improvement: memoryImprovement,
      significance: Math.abs(memoryImprovement),
      recommendation: this.generateRecommendation('memory', memoryImprovement)
    });
    
    return comparisons;
  }
  
  generateModelInsights(evaluations: ModelEvaluation[]): {
    strengths: string[];
    weaknesses: string[];
    optimizationOpportunities: string[];
    deploymentReadiness: number;
  } {
    const recentEvaluations = evaluations.slice(-10); // 最近10次评估
    
    const avgAccuracy = recentEvaluations.reduce((sum, e) => sum + e.accuracy, 0) / recentEvaluations.length;
    const avgInferenceTime = recentEvaluations.reduce((sum, e) => sum + e.inferenceTime, 0) / recentEvaluations.length;
    const avgMemoryUsage = recentEvaluations.reduce((sum, e) => sum + e.memoryUsage, 0) / recentEvaluations.length;
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const optimizationOpportunities: string[] = [];
    
    // 准确性分析
    if (avgAccuracy > 0.9) {
      strengths.push(`高准确性 (${(avgAccuracy * 100).toFixed(1)}%)`);
    } else if (avgAccuracy < 0.7) {
      weaknesses.push(`准确性较低 (${(avgAccuracy * 100).toFixed(1)}%)`);
      optimizationOpportunities.push('考虑增加训练数据或调整模型架构');
    }
    
    // 推理速度分析
    if (avgInferenceTime < 500) {
      strengths.push(`快速推理 (${avgInferenceTime.toFixed(0)}ms)`);
    } else if (avgInferenceTime > 2000) {
      weaknesses.push(`推理速度较慢 (${avgInferenceTime.toFixed(0)}ms)`);
      optimizationOpportunities.push('考虑模型量化或剪枝');
    }
    
    // 内存使用分析
    if (avgMemoryUsage < 100 * 1024 * 1024) { // 100MB
      strengths.push(`内存使用合理 (${(avgMemoryUsage / 1024 / 1024).toFixed(1)}MB)`);
    } else if (avgMemoryUsage > 500 * 1024 * 1024) { // 500MB
      weaknesses.push(`内存使用较高 (${(avgMemoryUsage / 1024 / 1024).toFixed(1)}MB)`);
      optimizationOpportunities.push('考虑模型压缩或分批处理');
    }
    
    // 计算部署就绪度
    const deploymentReadiness = this.calculateDeploymentReadiness(avgAccuracy, avgInferenceTime, avgMemoryUsage);
    
    return {
      strengths,
      weaknesses,
      optimizationOpportunities,
      deploymentReadiness
    };
  }
  
  predictModelPerformance(modelName: string, newDataCharacteristics: {
    imageQuality: number;
    complexity: number;
    size: number;
    noiseLevel: number;
  }): {
    expectedAccuracy: number;
    expectedInferenceTime: number;
    expectedMemoryUsage: number;
    confidence: number;
    riskFactors: string[];
  } {
    const modelHistory = this.evaluationHistory.filter(e => e.modelName === modelName);
    
    if (modelHistory.length === 0) {
      return {
        expectedAccuracy: 0.8,
        expectedInferenceTime: 1000,
        expectedMemoryUsage: 200 * 1024 * 1024,
        confidence: 0.3,
        riskFactors: ['缺乏历史数据', '预测准确性较低']
      };
    }
    
    // 基于历史数据和数据特征进行预测
    const recentPerformance = modelHistory.slice(-5);
    const baseAccuracy = recentPerformance.reduce((sum, e) => sum + e.accuracy, 0) / recentPerformance.length;
    const baseInferenceTime = recentPerformance.reduce((sum, e) => sum + e.inferenceTime, 0) / recentPerformance.length;
    const baseMemoryUsage = recentPerformance.reduce((sum, e) => sum + e.memoryUsage, 0) / recentPerformance.length;
    
    // 根据数据特征调整预测
    let accuracyAdjustment = 0;
    let timeAdjustment = 1;
    let memoryAdjustment = 1;
    const riskFactors: string[] = [];
    
    // 图像质量影响
    if (newDataCharacteristics.imageQuality < 0.5) {
      accuracyAdjustment -= 0.2;
      riskFactors.push('图像质量较差');
    }
    
    // 复杂度影响
    if (newDataCharacteristics.complexity > 0.8) {
      timeAdjustment *= 1.5;
      memoryAdjustment *= 1.3;
      riskFactors.push('数据复杂度较高');
    }
    
    // 噪声影响
    if (newDataCharacteristics.noiseLevel > 0.6) {
      accuracyAdjustment -= 0.15;
      riskFactors.push('噪声水平较高');
    }
    
    return {
      expectedAccuracy: Math.max(0, Math.min(1, baseAccuracy + accuracyAdjustment)),
      expectedInferenceTime: baseInferenceTime * timeAdjustment,
      expectedMemoryUsage: baseMemoryUsage * memoryAdjustment,
      confidence: Math.max(0.1, 1 - Math.abs(accuracyAdjustment) - Math.abs(timeAdjustment - 1)),
      riskFactors
    };
  }
  
  private calculateAccuracy(predicted: tf.Tensor, actual: tf.Tensor): number {
    const predArray = predicted.arraySync() as number[];
    const actualArray = actual.arraySync() as number[];
    
    let correct = 0;
    for (let i = 0; i < predArray.length; i++) {
      if (predArray[i] === actualArray[i]) correct++;
    }
    
    return correct / predArray.length;
  }
  
  private calculatePrecision(predicted: tf.Tensor, actual: tf.Tensor): number {
    // 简化的精确度计算
    return this.calculateAccuracy(predicted, actual); // 对于多分类问题
  }
  
  private calculateRecall(predicted: tf.Tensor, actual: tf.Tensor): number {
    // 简化的召回率计算
    return this.calculateAccuracy(predicted, actual); // 对于多分类问题
  }
  
  private calculateF1Score(precision: number, recall: number): number {
    if (precision + recall === 0) return 0;
    return 2 * (precision * recall) / (precision + recall);
  }
  
  private calculateAverageConfidence(predictions: tf.Tensor): number {
    const confidences = predictions.max(-1);
    const avgConfidence = confidences.mean().arraySync() as number;
    confidences.dispose();
    return avgConfidence;
  }
  
  private calculateConfusionMatrix(predicted: tf.Tensor, actual: tf.Tensor): any {
    const predArray = predicted.arraySync() as number[];
    const actualArray = actual.arraySync() as number[];
    
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;
    
    for (let i = 0; i < predArray.length; i++) {
      const pred = predArray[i];
      const act = actualArray[i];
      
      if (pred === 1 && act === 1) truePositives++;
      else if (pred === 1 && act === 0) falsePositives++;
      else if (pred === 0 && act === 0) trueNegatives++;
      else if (pred === 0 && act === 1) falseNegatives++;
    }
    
    return { truePositives, falsePositives, trueNegatives, falseNegatives };
  }
  
  private calculateStatisticalSignificance(improvement: number, baseline: number): number {
    // 简化的统计显著性计算
    return Math.min(1, Math.abs(improvement) / Math.max(0.01, baseline));
  }
  
  private generateRecommendation(metric: string, improvement: number): string {
    if (improvement > 0.1) {
      return `✅ ${metric}有显著改善，建议保持当前策略`;
    } else if (improvement > 0) {
      return `👍 ${metric}有所改善，继续观察`;
    } else if (improvement > -0.1) {
      return `⚠️ ${metric}略有下降，需要关注`;
    } else {
      return `🚨 ${metric}显著下降，需要立即优化`;
    }
  }
  
  private calculateDeploymentReadiness(accuracy: number, inferenceTime: number, memoryUsage: number): number {
    let score = 0;
    
    // 准确性评分 (40%)
    if (accuracy > 0.9) score += 40;
    else if (accuracy > 0.8) score += 30;
    else if (accuracy > 0.7) score += 20;
    else score += 10;
    
    // 速度评分 (30%)
    if (inferenceTime < 500) score += 30;
    else if (inferenceTime < 1000) score += 20;
    else if (inferenceTime < 2000) score += 10;
    else score += 5;
    
    // 内存评分 (30%)
    const memoryMB = memoryUsage / 1024 / 1024;
    if (memoryMB < 100) score += 30;
    else if (memoryMB < 300) score += 20;
    else if (memoryMB < 500) score += 10;
    else score += 5;
    
    return score;
  }
  
  getEvaluationHistory(modelName?: string): ModelEvaluation[] {
    if (modelName) {
      return this.evaluationHistory.filter(e => e.modelName === modelName);
    }
    return [...this.evaluationHistory];
  }
  
  // 模型漂移检测
  detectModelDrift(modelName: string, windowSize: number = 10): {
    driftDetected: boolean;
    driftMagnitude: number;
    trend: 'improving' | 'degrading' | 'stable';
    recommendation: string;
  } {
    const modelEvaluations = this.evaluationHistory
      .filter(e => e.modelName === modelName)
      .slice(-windowSize * 2); // 取两倍窗口大小用于比较
    
    if (modelEvaluations.length < windowSize * 2) {
      return {
        driftDetected: false,
        driftMagnitude: 0,
        trend: 'stable',
        recommendation: '数据不足，无法检测模型漂移'
      };
    }
    
    const recentWindow = modelEvaluations.slice(-windowSize);
    const previousWindow = modelEvaluations.slice(-windowSize * 2, -windowSize);
    
    const recentAccuracy = recentWindow.reduce((sum, e) => sum + e.accuracy, 0) / recentWindow.length;
    const previousAccuracy = previousWindow.reduce((sum, e) => sum + e.accuracy, 0) / previousWindow.length;
    
    const driftMagnitude = recentAccuracy - previousAccuracy;
    const driftDetected = Math.abs(driftMagnitude) > 0.05; // 5%阈值
    
    let trend: 'improving' | 'degrading' | 'stable';
    if (driftMagnitude > 0.02) {
      trend = 'improving';
    } else if (driftMagnitude < -0.02) {
      trend = 'degrading';
    } else {
      trend = 'stable';
    }
    
    let recommendation: string;
    if (driftDetected && trend === 'degrading') {
      recommendation = '检测到模型性能下降，建议重新训练或更新模型';
    } else if (driftDetected && trend === 'improving') {
      recommendation = '模型性能在改善，当前策略有效';
    } else {
      recommendation = '模型性能稳定，继续监控';
    }

    // 发出模型漂移事件
    if (driftDetected) {
      this.emit('model-drift-detected', {
        modelName,
        driftMagnitude,
        trend,
        recommendation,
        timestamp: Date.now()
      });
    }
    
    return {
      driftDetected,
      driftMagnitude,
      trend,
      recommendation
    };
  }
}