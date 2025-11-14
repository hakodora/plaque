import { ToothSegmentation } from './segmentation.js';
import sharp from 'sharp';

export interface ToothDetection {
  id: string;
  number: string;
  name: string;
  position: { x: number; y: number; width: number; height: number };
  confidence: number;
  condition: 'healthy' | 'caries' | 'plaque' | 'tartar';
}

export class ToothDetectionService {
  private segmentationService: ToothSegmentation;
  
  constructor() {
    this.segmentationService = new ToothSegmentation();
  }
  
  // 牙科编号系统
  private readonly TOOTH_NUMBERING = {
    // FDI世界牙科联盟编号系统
    upperRight: {
      '18': '右上第三磨牙', '17': '右上第二磨牙', '16': '右上第一磨牙',
      '15': '右上第二前磨牙', '14': '右上第一前磨牙', '13': '右上尖牙',
      '12': '右上侧切牙', '11': '右上中切牙'
    },
    upperLeft: {
      '21': '左上中切牙', '22': '左上侧切牙', '23': '左上尖牙',
      '24': '左上第一前磨牙', '25': '左上第二前磨牙', '26': '左上第一磨牙',
      '27': '左上第二磨牙', '28': '左上第三磨牙'
    },
    lowerLeft: {
      '31': '左下中切牙', '32': '左下侧切牙', '33': '左下尖牙',
      '34': '左下第一前磨牙', '35': '左下第二前磨牙', '36': '左下第一磨牙',
      '37': '左下第二磨牙', '38': '左下第三磨牙'
    },
    lowerRight: {
      '48': '右下第三磨牙', '47': '右下第二磨牙', '46': '右下第一磨牙',
      '45': '右下第二前磨牙', '44': '右下第一前磨牙', '43': '右下尖牙',
      '42': '右下侧切牙', '41': '右下中切牙'
    }
  };
  
  async detectTeeth(imageBuffer: Buffer): Promise<{
    segmentation: any;
    teeth: ToothDetection[];
  }> {
    try {
      // 转换图像为ImageData
      const imageData = await this.bufferToImageData(imageBuffer);
      
      // 执行牙齿分割
      const segmentation = await this.segmentationService.segmentImage(imageData);
      
      // 基于分割结果检测牙齿
      const teeth = this.identifyTeeth(segmentation);
      
      return {
        segmentation,
        teeth
      };
    } catch (error) {
      console.error('牙齿检测失败:', error);
      throw new Error(`牙齿检测失败: ${error.message}`);
    }
  }
  
  private async bufferToImageData(buffer: Buffer): Promise<ImageData> {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    return new ImageData(
      new Uint8ClampedArray(data),
      info.width,
      info.height
    );
  }
  
  private identifyTeeth(segmentation: any): ToothDetection[] {
    const teeth: ToothDetection[] = [];
    const { boundingBoxes } = segmentation;
    
    // 按位置排序牙齿（从左到右，从上到下）
    const sortedBoxes = boundingBoxes
      .filter((box: any) => box.type === 'tooth')
      .sort((a: any, b: any) => {
        const verticalDiff = a.y - b.y;
        if (Math.abs(verticalDiff) > 20) { // 垂直位置差异较大
          return verticalDiff; // 从上到下
        }
        return a.x - b.x; // 水平位置从左到右
      });
    
    // 分配牙齿编号和名称
    sortedBoxes.forEach((box: any, index: number) => {
      const toothNumber = this.assignToothNumber(index, sortedBoxes.length, box);
      const toothName = this.getToothName(toothNumber);
      
      teeth.push({
        id: `tooth_${index + 1}`,
        number: toothNumber,
        name: toothName,
        position: {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height
        },
        confidence: box.confidence,
        condition: this.assessToothCondition(box, segmentation)
      });
    });
    
    return teeth;
  }
  
  private assignToothNumber(index: number, totalTeeth: number, box: any): string {
    // 简化的牙齿编号分配逻辑
    // 在实际应用中，这里应该使用更复杂的算法来确定牙齿位置
    
    const isUpper = box.y < 256; // 假设图像上半部分是上颌
    const isRight = box.x < 256; // 假设图像左半部分是右侧
    
    // FDI编号系统（简化版）
    const quadrant = isUpper ? (isRight ? 1 : 2) : (isRight ? 4 : 3);
    
    // 根据位置分配牙齿编号（这只是一个简化示例）
    const positionInQuadrant = Math.floor((index % 8) + 1);
    
    return `${quadrant}${Math.min(positionInQuadrant, 8)}`;
  }
  
  private getToothName(toothNumber: string): string {
    const firstDigit = toothNumber[0];
    const secondDigit = toothNumber[1];
    
    // 简化的牙齿名称映射
    const toothNames: { [key: string]: { [key: string]: string } } = {
      '1': { // 右上象限
        '1': '右上中切牙', '2': '右上侧切牙', '3': '右上尖牙',
        '4': '右上第一前磨牙', '5': '右上第二前磨牙',
        '6': '右上第一磨牙', '7': '右上第二磨牙', '8': '右上第三磨牙'
      },
      '2': { // 左上象限
        '1': '左上中切牙', '2': '左上侧切牙', '3': '左上尖牙',
        '4': '左上第一前磨牙', '5': '左上第二前磨牙',
        '6': '左上第一磨牙', '7': '左上第二磨牙', '8': '左上第三磨牙'
      },
      '3': { // 左下象限
        '1': '左下中切牙', '2': '左下侧切牙', '3': '左下尖牙',
        '4': '左下第一前磨牙', '5': '左下第二前磨牙',
        '6': '左下第一磨牙', '7': '左下第二磨牙', '8': '左下第三磨牙'
      },
      '4': { // 右下象限
        '1': '右下中切牙', '2': '右下侧切牙', '3': '右下尖牙',
        '4': '右下第一前磨牙', '5': '右下第二前磨牙',
        '6': '右下第一磨牙', '7': '右下第二磨牙', '8': '右下第三磨牙'
      }
    };
    
    return toothNames[firstDigit]?.[secondDigit] || '未知牙齿';
  }
  
  private assessToothCondition(box: any, segmentation: any): 'healthy' | 'caries' | 'plaque' | 'tartar' {
    // 简化的牙齿状况评估
    // 在实际应用中，这里应该使用更复杂的图像分析算法
    
    const random = Math.random();
    
    if (random < 0.6) {
      return 'healthy';
    } else if (random < 0.8) {
      return 'plaque';
    } else if (random < 0.9) {
      return 'tartar';
    } else {
      return 'caries';
    }
  }
  
  // 生成模拟检测结果（用于演示）
  generateMockDetection(): ToothDetection[] {
    const mockTeeth: ToothDetection[] = [];
    
    // 生成模拟的牙齿数据
    const toothNumbers = ['11', '12', '13', '14', '15', '16', '17', '18', 
                         '21', '22', '23', '24', '25', '26', '27', '28'];
    
    toothNumbers.forEach((number, index) => {
      const name = this.getToothName(number);
      const conditions: Array<'healthy' | 'caries' | 'plaque' | 'tartar'> = 
        ['healthy', 'caries', 'plaque', 'tartar'];
      
      mockTeeth.push({
        id: `tooth_${index + 1}`,
        number,
        name,
        position: {
          x: 100 + (index % 8) * 80,
          y: index < 8 ? 200 : 400,
          width: 60,
          height: 80
        },
        confidence: 0.85 + Math.random() * 0.15,
        condition: conditions[Math.floor(Math.random() * conditions.length)]
      });
    });
    
    return mockTeeth;
  }
}