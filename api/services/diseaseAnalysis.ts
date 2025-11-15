export interface DiseaseAnalysis {
  plaqueLevel: 'low' | 'moderate' | 'high';
  plaquePercentage: number;
  cariesRisk: 'low' | 'moderate' | 'high';
  tartarLevel: 'minimal' | 'moderate' | 'severe';
  gumInflammation: 'none' | 'mild' | 'moderate' | 'severe';
  overallScore: number;
  recommendations: string[];
  riskFactors: string[];
}

export class DiseaseAnalysisService {
  
  async analyzeDisease(imageData: ImageData, teethDetection: any[]): Promise<DiseaseAnalysis> {
    try {
      // 分析各种口腔疾病风险
      const plaqueAnalysis = this.analyzePlaque(imageData, teethDetection);
      const cariesAnalysis = this.analyzeCariesRisk(imageData, teethDetection);
      const tartarAnalysis = this.analyzeTartar(imageData, teethDetection);
      const gumAnalysis = this.analyzeGumHealth(imageData, teethDetection);
      
      // 计算综合评分
      const overallScore = this.calculateOverallScore(plaqueAnalysis, cariesAnalysis, tartarAnalysis, gumAnalysis);
      
      // 生成建议
      const recommendations = this.generateRecommendations(plaqueAnalysis, cariesAnalysis, tartarAnalysis, gumAnalysis);
      
      // 识别风险因素
      const riskFactors = this.identifyRiskFactors(plaqueAnalysis, cariesAnalysis, tartarAnalysis, gumAnalysis);
      
      return {
        plaqueLevel: plaqueAnalysis.level,
        plaquePercentage: plaqueAnalysis.percentage,
        cariesRisk: cariesAnalysis.risk,
        tartarLevel: tartarAnalysis.level,
        gumInflammation: gumAnalysis.inflammation,
        overallScore,
        recommendations,
        riskFactors
      };
    } catch (error) {
      console.error('疾病分析失败:', error);
      throw new Error(`疾病分析失败: ${error.message}`);
    }
  }
  
  private analyzePlaque(imageData: ImageData, teethDetection: any[]): {
    level: 'low' | 'moderate' | 'high';
    percentage: number;
    severityAreas: number;
  } {
    // 简化的牙菌斑分析
    // 在实际应用中，这里应该使用颜色分析、纹理分析等复杂算法
    
    const { data, width, height } = imageData;
    let plaquePixels = 0;
    let totalTeethPixels = 0;
    
    // 分析牙齿区域的颜色特征
    teethDetection.forEach(tooth => {
      const { x, y, width: toothWidth, height: toothHeight } = tooth.position;
      
      for (let py = y; py < y + toothHeight; py++) {
        for (let px = x; px < x + toothWidth; px++) {
          if (py < height && px < width) {
            const idx = (py * width + px) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            totalTeethPixels++;
            
            // 简化的牙菌斑检测：偏黄的区域可能是牙菌斑
            const yellowScore = (r + g) / 2 - b;
            if (yellowScore > 20 && r > 150 && g > 150) {
              plaquePixels++;
            }
          }
        }
      }
    });

    // 回退：无牙齿检测结果时，基于全图进行颜色分析
    if (!teethDetection || teethDetection.length === 0) {
      let sumYellow = 0;
      let sumSqYellow = 0;
      const totalPixels = width * height;
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const idx = (py * width + px) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const yellowScore = (r + g) / 2 - b;
          sumYellow += yellowScore;
          sumSqYellow += yellowScore * yellowScore;
        }
      }
      const mean = sumYellow / totalPixels;
      const variance = Math.max(sumSqYellow / totalPixels - mean * mean, 0);
      const std = Math.sqrt(variance);
      const threshold = mean + std; // 动态阈值：高于均值一个标准差视为偏黄
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const idx = (py * width + px) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const yellowScore = (r + g) / 2 - b;
          totalTeethPixels++;
          if (yellowScore > threshold && r > 120 && g > 120) {
            plaquePixels++;
          }
        }
      }
    }
    
    const percentage = totalTeethPixels > 0 ? (plaquePixels / totalTeethPixels) * 100 : 0;
    
    let level: 'low' | 'moderate' | 'high';
    if (percentage < 10) {
      level = 'low';
    } else if (percentage < 30) {
      level = 'moderate';
    } else {
      level = 'high';
    }
    
    return {
      level,
      percentage: Math.round(percentage * 10) / 10,
      severityAreas: Math.floor(plaquePixels / 1000)
    };
  }
  
  private analyzeCariesRisk(imageData: ImageData, teethDetection: any[]): {
    risk: 'low' | 'moderate' | 'high';
    riskFactors: string[];
    affectedTeeth: number;
  } {
    // 龋齿风险分析
    // 基于牙齿状况、位置、颜色等因素
    
    let affectedTeeth = 0;
    const riskFactors: string[] = [];
    
    teethDetection.forEach(tooth => {
      if (tooth.condition === 'caries') {
        affectedTeeth++;
      }
      
      // 分析牙齿颜色异常（可能是龋齿）
      const colorAnomaly = this.detectColorAnomaly(imageData, tooth.position);
      if (colorAnomaly) {
        affectedTeeth++;
      }
    });
    
    // 确定风险等级
    let risk: 'low' | 'moderate' | 'high';
    if (affectedTeeth === 0) {
      risk = 'low';
    } else if (affectedTeeth <= 2) {
      risk = 'moderate';
      riskFactors.push('发现' + affectedTeeth + '颗牙齿可能有龋齿');
    } else {
      risk = 'high';
      riskFactors.push('发现' + affectedTeeth + '颗牙齿可能有龋齿');
    }
    
    return { risk, riskFactors, affectedTeeth };
  }
  
  private analyzeTartar(imageData: ImageData, teethDetection: any[]): {
    level: 'minimal' | 'moderate' | 'severe';
    severityScore: number;
    location: string[];
  } {
    // 牙结石分析
    // 基于颜色、纹理和位置特征
    
    let tartarScore = 0;
    const locations: string[] = [];
    
    teethDetection.forEach(tooth => {
      // 分析牙龈边缘区域
      const gumLineTartar = this.analyzeGumLine(imageData, tooth.position);
      if (gumLineTartar > 0) {
        tartarScore += gumLineTartar;
        locations.push(tooth.name);
      }
    });
    
    let level: 'minimal' | 'moderate' | 'severe';
    if (tartarScore < 10) {
      level = 'minimal';
    } else if (tartarScore < 25) {
      level = 'moderate';
    } else {
      level = 'severe';
    }
    
    return {
      level,
      severityScore: Math.round(tartarScore),
      location: locations
    };
  }
  
  private analyzeGumHealth(imageData: ImageData, teethDetection: any[]): {
    inflammation: 'none' | 'mild' | 'moderate' | 'severe';
    bleedingRisk: 'low' | 'high';
    recession: 'none' | 'mild' | 'moderate';
  } {
    // 牙龈健康分析
    // 基于颜色、肿胀程度等指标
    
    let inflamedAreas = 0;
    let totalGumAreas = 0;
    
    // 分析牙龈区域的颜色和纹理
    teethDetection.forEach(tooth => {
      const gumHealth = this.analyzeGumArea(imageData, tooth.position);
      if (gumHealth.inflammation) {
        inflamedAreas++;
      }
      totalGumAreas++;
    });
    
    let inflammation: 'none' | 'mild' | 'moderate' | 'severe';
    const inflammationRatio = totalGumAreas > 0 ? inflamedAreas / totalGumAreas : 0;
    
    if (inflammationRatio < 0.1) {
      inflammation = 'none';
    } else if (inflammationRatio < 0.3) {
      inflammation = 'mild';
    } else if (inflammationRatio < 0.6) {
      inflammation = 'moderate';
    } else {
      inflammation = 'severe';
    }
    
    return {
      inflammation,
      bleedingRisk: inflammationRatio > 0.3 ? 'high' : 'low',
      recession: 'none' // 简化处理
    };
  }
  
  private calculateOverallScore(
    plaqueAnalysis: any,
    cariesAnalysis: any,
    tartarAnalysis: any,
    gumAnalysis: any
  ): number {
    let score = 10;
    
    // 牙菌斑评分
    if (plaqueAnalysis.level === 'high') score -= 3;
    else if (plaqueAnalysis.level === 'moderate') score -= 1.5;
    
    // 龋齿风险评分
    if (cariesAnalysis.risk === 'high') score -= 3;
    else if (cariesAnalysis.risk === 'moderate') score -= 1.5;
    
    // 牙结石评分
    if (tartarAnalysis.level === 'severe') score -= 2;
    else if (tartarAnalysis.level === 'moderate') score -= 1;
    
    // 牙龈健康评分
    if (gumAnalysis.inflammation === 'severe') score -= 2;
    else if (gumAnalysis.inflammation === 'moderate') score -= 1;
    else if (gumAnalysis.inflammation === 'mild') score -= 0.5;
    
    return Math.max(1, Math.round(score * 10) / 10);
  }
  
  private generateRecommendations(
    plaqueAnalysis: any,
    cariesAnalysis: any,
    tartarAnalysis: any,
    gumAnalysis: any
  ): string[] {
    const recommendations: string[] = [];
    
    // 牙菌斑建议
    if (plaqueAnalysis.level === 'high') {
      recommendations.push('建议每天刷牙两次，使用含氟牙膏');
      recommendations.push('使用牙线或牙间刷清洁牙缝');
      recommendations.push('考虑使用抗菌漱口水');
    } else if (plaqueAnalysis.level === 'moderate') {
      recommendations.push('保持良好的口腔卫生习惯');
      recommendations.push('定期使用牙线清洁');
    }
    
    // 龋齿风险建议
    if (cariesAnalysis.risk === 'high') {
      recommendations.push('减少糖分摄入');
      recommendations.push('定期进行口腔检查');
      recommendations.push('考虑使用含氟漱口水');
    }
    
    // 牙结石建议
    if (tartarAnalysis.level === 'severe' || tartarAnalysis.level === 'moderate') {
      recommendations.push('建议进行专业洁牙');
      recommendations.push('改善刷牙技巧，重点清洁牙龈边缘');
    }
    
    // 牙龈健康建议
    if (gumAnalysis.inflammation !== 'none') {
      recommendations.push('使用软毛牙刷，避免过度用力');
      recommendations.push('定期进行牙龈按摩');
      if (gumAnalysis.inflammation === 'severe') {
        recommendations.push('建议尽快就诊牙周科医生');
      }
    }
    
    // 通用建议
    recommendations.push('每6个月进行一次口腔检查');
    recommendations.push('保持均衡饮食，多吃富含维生素的食物');
    
    return recommendations;
  }
  
  private identifyRiskFactors(
    plaqueAnalysis: any,
    cariesAnalysis: any,
    tartarAnalysis: any,
    gumAnalysis: any
  ): string[] {
    const riskFactors: string[] = [];
    
    if (plaqueAnalysis.level === 'high') {
      riskFactors.push('牙菌斑堆积严重');
    }
    if (cariesAnalysis.risk === 'high') {
      riskFactors.push('龋齿风险较高');
    }
    if (tartarAnalysis.level === 'severe') {
      riskFactors.push('牙结石严重');
    }
    if (gumAnalysis.inflammation === 'severe') {
      riskFactors.push('牙龈炎症严重');
    }
    if (gumAnalysis.bleedingRisk === 'high') {
      riskFactors.push('牙龈出血风险');
    }
    
    return riskFactors;
  }
  
  // 辅助分析方法
  private detectColorAnomaly(imageData: ImageData, position: any): boolean {
    // 简化的颜色异常检测
    const { data, width } = imageData;
    const { x, y, width: w, height: h } = position;
    
    let darkSpots = 0;
    let totalSpots = 0;
    
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        if (py < imageData.height && px < width) {
          const idx = (py * width + px) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          
          totalSpots++;
          if (brightness < 100) { // 暗色斑点
            darkSpots++;
          }
        }
      }
    }
    
    return totalSpots > 0 && (darkSpots / totalSpots) > 0.1;
  }
  
  private analyzeGumLine(imageData: ImageData, position: any): number {
    // 简化的牙龈边缘分析
    const { x, y, width: w, height: h } = position;
    
    // 分析牙齿边缘区域（简化的牙龈线）
    const gumLineY = y + h * 0.8; // 假设牙龈线在牙齿底部20%位置
    
    return Math.random() * 10; // 模拟分析结果
  }
  
  private analyzeGumArea(imageData: ImageData, position: any): {
    inflammation: boolean;
    swelling: boolean;
  } {
    // 简化的牙龈区域分析
    return {
      inflammation: Math.random() > 0.7, // 模拟炎症检测
      swelling: Math.random() > 0.8    // 模拟肿胀检测
    };
  }
  
  // 生成模拟分析结果（用于演示）
  generateMockAnalysis(): DiseaseAnalysis {
    const plaqueLevel = ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'moderate' | 'high';
    const cariesRisk = ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'moderate' | 'high';
    const tartarLevel = ['minimal', 'moderate', 'severe'][Math.floor(Math.random() * 3)] as 'minimal' | 'moderate' | 'severe';
    const gumInflammation = ['none', 'mild', 'moderate', 'severe'][Math.floor(Math.random() * 4)] as 'none' | 'mild' | 'moderate' | 'severe';
    
    return {
      plaqueLevel,
      plaquePercentage: Math.round(Math.random() * 50 * 10) / 10,
      cariesRisk,
      tartarLevel,
      gumInflammation,
      overallScore: Math.round((Math.random() * 4 + 6) * 10) / 10, // 6-10分
      recommendations: [
        '建议每天刷牙两次，使用含氟牙膏',
        '使用牙线清洁牙缝',
        '定期进行口腔检查',
        '减少糖分摄入'
      ],
      riskFactors: [
        plaqueLevel === 'high' ? '牙菌斑堆积' : null,
        cariesRisk === 'high' ? '龋齿风险' : null,
        tartarLevel === 'severe' ? '牙结石' : null,
        gumInflammation === 'severe' ? '牙龈炎症' : null
      ].filter(Boolean) as string[]
    };
  }
}