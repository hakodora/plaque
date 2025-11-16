import * as tf from '@tensorflow/tfjs';

export interface SegmentationResult {
  teethMask: number[][];
  gumMask: number[][];
  teethCount: number;
  gumArea: number;
  boundingBoxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'tooth' | 'gum';
    confidence: number;
  }>;
}

export class ToothSegmentation {
  private model: tf.LayersModel | null = null;
  private readonly IMAGE_SIZE = 512;
  
  constructor() {
    this.initializeModel();
  }
  
  private async initializeModel() {
    // 在实际应用中，这里应该加载预训练的模型
    // 现在使用模拟的语义分割模型
    console.log('初始化牙齿分割模型...');
    
    // 创建一个简单的U-Net架构模型用于演示
    this.model = this.createMockSegmentationModel();
    console.log('模型初始化完成');
  }
  
  private createMockSegmentationModel(): tf.LayersModel {
    // 这里创建一个模拟的分割模型
    // 在实际应用中，应该加载预训练的权重
    const input = tf.input({ shape: [this.IMAGE_SIZE, this.IMAGE_SIZE, 3] });
    
    // 简单的卷积网络用于演示
    const conv1 = tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu', padding: 'same' }).apply(input) as tf.SymbolicTensor;
    const conv2 = tf.layers.conv2d({ filters: 128, kernelSize: 3, activation: 'relu', padding: 'same' }).apply(conv1) as tf.SymbolicTensor;
    const conv3 = tf.layers.conv2d({ filters: 256, kernelSize: 3, activation: 'relu', padding: 'same' }).apply(conv2) as tf.SymbolicTensor;
    
    // 输出层 - 3个类别：背景、牙齿、牙龈
    const output = tf.layers.conv2d({ filters: 3, kernelSize: 1, activation: 'softmax', padding: 'same' }).apply(conv3) as tf.SymbolicTensor;
    
    const model = tf.model({ inputs: input, outputs: output });
    
    return model;
  }
  
  async segmentImage(imageData: ImageData): Promise<SegmentationResult> {
    if (!this.model) {
      throw new Error('模型尚未初始化');
    }
    
    try {
      // 预处理图像
      const processedImage = this.preprocessImage(imageData);
      
      // 执行推理
      const prediction = this.model.predict(processedImage) as tf.Tensor;
      
      // 处理预测结果
      const result = await this.postprocessPrediction(prediction);
      
      // 清理张量
      processedImage.dispose();
      prediction.dispose();
      
      return result;
    } catch (error) {
      console.error('图像分割失败:', error);
      throw new Error(`图像分割失败: ${error.message}`);
    }
  }
  
  private preprocessImage(imageData: ImageData): tf.Tensor {
    const { width, height, data } = imageData;
    
    // 调整图像大小
    const resized = tf.tidy(() => {
      const tensor = tf.browser.fromPixels(imageData);
      return tf.image.resizeBilinear(tensor, [this.IMAGE_SIZE, this.IMAGE_SIZE]);
    });
    
    // 标准化像素值
    const normalized = resized.div(255.0);
    
    // 添加批次维度
    const batched = normalized.expandDims(0);
    
    resized.dispose();
    
    return batched;
  }
  
  private async postprocessPrediction(prediction: tf.Tensor): Promise<SegmentationResult> {
    const predictionData = await prediction.data();
    const [batch, height, width, channels] = prediction.shape;
    
    // 创建输出掩码
    const teethMask: number[][] = Array(height).fill(null).map(() => Array(width).fill(0));
    const gumMask: number[][] = Array(height).fill(null).map(() => Array(width).fill(0));
    
    let teethCount = 0;
    let gumArea = 0;
    const boundingBoxes: SegmentationResult['boundingBoxes'] = [];
    
    // 处理每个像素
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const backgroundProb = predictionData[idx];
        const teethProb = predictionData[idx + 1];
        const gumProb = predictionData[idx + 2];
        
        // 确定像素类别
        if (teethProb > 0.5 && teethProb > gumProb) {
          teethMask[y][x] = 1;
          teethCount++;
        } else if (gumProb > 0.5 && gumProb > teethProb) {
          gumMask[y][x] = 1;
          gumArea++;
        }
      }
    }
    
    // 计算牙龈面积百分比
    const totalPixels = height * width;
    const gumAreaPercentage = (gumArea / totalPixels) * 100;
    
    // 简单的连通组件分析来识别单独的牙齿
    const connectedComponents = this.analyzeConnectedComponents(teethMask);
    
    // 生成边界框
    for (const component of connectedComponents) {
      if (component.size > 100) { // 过滤掉太小的区域
        boundingBoxes.push({
          x: component.bbox.x,
          y: component.bbox.y,
          width: component.bbox.width,
          height: component.bbox.height,
          type: 'tooth',
          confidence: 0.8 + Math.random() * 0.2 // 模拟置信度
        });
      }
    }
    
    return {
      teethMask,
      gumMask,
      teethCount: connectedComponents.length,
      gumArea: Math.round(gumAreaPercentage * 10) / 10,
      boundingBoxes
    };
  }
  
  private analyzeConnectedComponents(mask: number[][]): Array<{
    size: number;
    bbox: { x: number; y: number; width: number; height: number };
  }> {
    const height = mask.length;
    const width = mask[0].length;
    const visited = Array(height).fill(null).map(() => Array(width).fill(false));
    const components: Array<{ size: number; bbox: any }> = [];
    
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    function dfs(y: number, x: number, component: { size: number; minX: number; maxX: number; minY: number; maxY: number }) {
      if (y < 0 || y >= height || x < 0 || x >= width || visited[y][x] || mask[y][x] === 0) {
        return;
      }
      
      visited[y][x] = true;
      component.size++;
      component.minX = Math.min(component.minX, x);
      component.maxX = Math.max(component.maxX, x);
      component.minY = Math.min(component.minY, y);
      component.maxY = Math.max(component.maxY, y);
      
      for (const [dy, dx] of directions) {
        dfs(y + dy, x + dx, component);
      }
    }
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!visited[y][x] && mask[y][x] === 1) {
          const component = {
            size: 0,
            minX: x,
            maxX: x,
            minY: y,
            maxY: y
          };
          
          dfs(y, x, component);
          
          if (component.size > 0) {
            components.push({
              size: component.size,
              bbox: {
                x: component.minX,
                y: component.minY,
                width: component.maxX - component.minX + 1,
                height: component.maxY - component.minY + 1
              }
            });
          }
        }
      }
    }
    
    return components;
  }
  
  // 模拟分割结果（用于演示和测试）
  generateMockSegmentation(width: number, height: number): SegmentationResult {
    const teethMask: number[][] = Array(height).fill(null).map(() => Array(width).fill(0));
    const gumMask: number[][] = Array(height).fill(null).map(() => Array(width).fill(0));
    
    // 创建模拟的牙齿区域（上半部分）
    for (let y = height * 0.3; y < height * 0.7; y++) {
      for (let x = width * 0.1; x < width * 0.9; x++) {
        if (Math.random() > 0.3) {
          teethMask[Math.floor(y)][Math.floor(x)] = 1;
        }
      }
    }
    
    // 创建模拟的牙龈区域
    for (let y = height * 0.25; y < height * 0.75; y++) {
      for (let x = width * 0.05; x < width * 0.95; x++) {
        if (Math.random() > 0.6 && teethMask[Math.floor(y)][Math.floor(x)] === 0) {
          gumMask[Math.floor(y)][Math.floor(x)] = 1;
        }
      }
    }
    
    // 计算统计数据
    let teethCount = 0;
    let gumArea = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (teethMask[y][x] === 1) teethCount++;
        if (gumMask[y][x] === 1) gumArea++;
      }
    }
    
    const totalPixels = width * height;
    const gumAreaPercentage = (gumArea / totalPixels) * 100;
    
    // 生成模拟的边界框
    const boundingBoxes = [
      {
        x: Math.floor(width * 0.2),
        y: Math.floor(height * 0.4),
        width: Math.floor(width * 0.15),
        height: Math.floor(height * 0.2),
        type: 'tooth' as const,
        confidence: 0.92
      },
      {
        x: Math.floor(width * 0.4),
        y: Math.floor(height * 0.35),
        width: Math.floor(width * 0.12),
        height: Math.floor(height * 0.25),
        type: 'tooth' as const,
        confidence: 0.88
      },
      {
        x: Math.floor(width * 0.6),
        y: Math.floor(height * 0.4),
        width: Math.floor(width * 0.15),
        height: Math.floor(height * 0.2),
        type: 'tooth' as const,
        confidence: 0.91
      }
    ];
    
    return {
      teethMask,
      gumMask,
      teethCount: 28, // 模拟成人牙齿数量
      gumArea: Math.round(gumAreaPercentage * 10) / 10,
      boundingBoxes
    };
  }
}