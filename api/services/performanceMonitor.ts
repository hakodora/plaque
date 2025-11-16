import { EventEmitter } from 'events';

export interface PerformanceMetrics {
  timestamp: number;
  operation: string;
  duration: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  success: boolean;
  error?: string;
  metadata?: any;
}

export interface ModelPerformance {
  modelName: string;
  inferenceTime: number;
  accuracy: number;
  confidence: number;
  memoryUsage: number;
  predictions: number;
  timestamp: number;
}

export interface AnalysisResult {
  imageId: string;
  segmentation: {
    accuracy: number;
    processingTime: number;
    teethCount: number;
    confidence: number;
  };
  detection: {
    accuracy: number;
    processingTime: number;
    teethDetected: number;
    avgConfidence: number;
  };
  diseaseAnalysis: {
    processingTime: number;
    riskFactors: number;
    recommendations: number;
  };
  overallScore: number;
}

export class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetrics[] = [];
  private modelPerformances: ModelPerformance[] = [];
  private analysisResults: AnalysisResult[] = [];
  private startTime: number;
  
  constructor() {
    super();
    this.startTime = Date.now();
    this.startMonitoring();
  }
  
  private startMonitoring() {
    // 定期收集系统性能数据
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // 每30秒收集一次
  }
  
  private collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.emit('systemMetrics', {
      timestamp: Date.now(),
      memory: memUsage,
      cpu: cpuUsage,
      uptime: Date.now() - this.startTime
    });
  }
  
  recordOperation(operation: string, duration: number, success: boolean, metadata?: any) {
    const memUsage = process.memoryUsage();
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      operation,
      duration,
      memoryUsage: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      },
      success,
      metadata
    };
    
    this.metrics.push(metric);
    
    // 保持最近1000条记录
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    this.emit('operationRecorded', metric);
  }
  
  recordModelPerformance(performance: ModelPerformance) {
    this.modelPerformances.push(performance);
    
    // 保持最近500条模型性能记录
    if (this.modelPerformances.length > 500) {
      this.modelPerformances = this.modelPerformances.slice(-500);
    }
    
    this.emit('modelPerformance', performance);
  }
  
  recordAnalysisResult(result: AnalysisResult) {
    this.analysisResults.push(result);
    
    // 保持最近200条分析结果
    if (this.analysisResults.length > 200) {
      this.analysisResults = this.analysisResults.slice(-200);
    }
    
    this.emit('analysisResult', result);
  }
  
  getPerformanceReport(): {
    operations: any;
    models: any;
    analysis: any;
    recommendations: string[];
  } {
    const operations = this.analyzeOperations();
    const models = this.analyzeModels();
    const analysis = this.analyzeAnalysisResults();
    const recommendations = this.generateRecommendations(operations, models, analysis);
    
    return {
      operations,
      models,
      analysis,
      recommendations
    };
  }
  
  private analyzeOperations() {
    const operationStats: { [key: string]: any } = {};
    
    this.metrics.forEach(metric => {
      if (!operationStats[metric.operation]) {
        operationStats[metric.operation] = {
          count: 0,
          totalDuration: 0,
          successCount: 0,
          avgDuration: 0,
          successRate: 0
        };
      }
      
      const stats = operationStats[metric.operation];
      stats.count++;
      stats.totalDuration += metric.duration;
      if (metric.success) stats.successCount++;
      
      stats.avgDuration = stats.totalDuration / stats.count;
      stats.successRate = (stats.successCount / stats.count) * 100;
    });
    
    return operationStats;
  }
  
  private analyzeModels() {
    if (this.modelPerformances.length === 0) {
      return { message: '暂无模型性能数据' };
    }
    
    const avgInferenceTime = this.modelPerformances.reduce((sum, p) => sum + p.inferenceTime, 0) / this.modelPerformances.length;
    const avgAccuracy = this.modelPerformances.reduce((sum, p) => sum + p.accuracy, 0) / this.modelPerformances.length;
    const avgConfidence = this.modelPerformances.reduce((sum, p) => sum + p.confidence, 0) / this.modelPerformances.length;
    const avgMemoryUsage = this.modelPerformances.reduce((sum, p) => sum + p.memoryUsage, 0) / this.modelPerformances.length;
    
    return {
      totalPredictions: this.modelPerformances.reduce((sum, p) => sum + p.predictions, 0),
      avgInferenceTime: Math.round(avgInferenceTime * 100) / 100,
      avgAccuracy: Math.round(avgAccuracy * 100) / 100,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      avgMemoryUsage: Math.round(avgMemoryUsage / 1024 / 1024 * 100) / 100, // MB
      modelCount: new Set(this.modelPerformances.map(p => p.modelName)).size
    };
  }
  
  private analyzeAnalysisResults() {
    if (this.analysisResults.length === 0) {
      return { message: '暂无分析结果数据' };
    }
    
    const avgOverallScore = this.analysisResults.reduce((sum, r) => sum + r.overallScore, 0) / this.analysisResults.length;
    const avgSegmentationAccuracy = this.analysisResults.reduce((sum, r) => sum + r.segmentation.accuracy, 0) / this.analysisResults.length;
    const avgDetectionAccuracy = this.analysisResults.reduce((sum, r) => sum + r.detection.accuracy, 0) / this.analysisResults.length;
    
    return {
      totalAnalyses: this.analysisResults.length,
      avgOverallScore: Math.round(avgOverallScore * 10) / 10,
      avgSegmentationAccuracy: Math.round(avgSegmentationAccuracy * 100) / 100,
      avgDetectionAccuracy: Math.round(avgDetectionAccuracy * 100) / 100,
      avgTotalProcessingTime: Math.round(
        this.analysisResults.reduce((sum, r) => 
          sum + r.segmentation.processingTime + r.detection.processingTime + r.diseaseAnalysis.processingTime, 0
        ) / this.analysisResults.length * 100
      ) / 100
    };
  }
  
  private generateRecommendations(operations: any, models: any, analysis: any): string[] {
    const recommendations: string[] = [];
    
    // 操作性能建议
    Object.entries(operations).forEach(([opName, stats]: [string, any]) => {
      if (stats.avgDuration > 1000) {
        recommendations.push(`建议优化 ${opName} 操作，当前平均耗时 ${stats.avgDuration.toFixed(2)}ms`);
      }
      if (stats.successRate < 95) {
        recommendations.push(`建议提高 ${opName} 操作的成功率，当前为 ${stats.successRate.toFixed(1)}%`);
      }
    });
    
    // 模型性能建议
    if (models.avgInferenceTime > 2000) {
      recommendations.push(`建议优化模型推理速度，当前平均耗时 ${models.avgInferenceTime}ms`);
    }
    if (models.avgAccuracy < 0.85) {
      recommendations.push(`建议提高模型准确性，当前平均准确率 ${(models.avgAccuracy * 100).toFixed(1)}%`);
    }
    if (models.avgMemoryUsage > 500) {
      recommendations.push(`建议优化模型内存使用，当前平均使用 ${models.avgMemoryUsage}MB`);
    }
    
    // 分析质量建议
    if (analysis.avgOverallScore < 7) {
      recommendations.push(`建议提升分析质量，当前平均评分 ${analysis.avgOverallScore}/10`);
    }
    if (analysis.avgTotalProcessingTime > 5000) {
      recommendations.push(`建议优化分析速度，当前平均处理时间 ${analysis.avgTotalProcessingTime}ms`);
    }
    
    // 通用建议
    recommendations.push('定期清理性能监控数据，保持系统性能');
    recommendations.push('建议定期重新训练模型以保持准确性');
    
    return recommendations;
  }
  
  getRealTimeMetrics(): {
    cpu: any;
    memory: any;
    activeConnections: number;
    queueLength: number;
    uptime: number;
  } {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        percentage: this.calculateCPUUsage(cpuUsage)
      },
      memory: memUsage,
      activeConnections: this.getActiveConnections(),
      queueLength: this.getQueueLength(),
      uptime: Date.now() - this.startTime
    };
  }
  
  private calculateCPUUsage(cpuUsage: any): number {
    // 简化的CPU使用率计算
    return Math.min(100, (cpuUsage.user + cpuUsage.system) / 1000000);
  }
  
  private getActiveConnections(): number {
    // 这里应该返回当前活跃连接数
    // 现在返回模拟数据
    return Math.floor(Math.random() * 50) + 10;
  }
  
  private getQueueLength(): number {
    // 这里应该返回当前队列长度
    // 现在返回模拟数据
    return Math.floor(Math.random() * 20);
  }
  
  // 导出性能数据用于可视化
  exportMetrics(): {
    operations: PerformanceMetrics[];
    models: ModelPerformance[];
    analysis: AnalysisResult[];
  } {
    return {
      operations: [...this.metrics],
      models: [...this.modelPerformances],
      analysis: [...this.analysisResults]
    };
  }
  
  // 清理旧数据
  cleanup() {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    this.metrics = this.metrics.filter(m => m.timestamp > oneWeekAgo);
    this.modelPerformances = this.modelPerformances.filter(p => p.timestamp > oneWeekAgo);
    this.analysisResults = this.analysisResults.filter(r => parseInt(r.imageId.split('_')[1]) > oneWeekAgo);
  }
}