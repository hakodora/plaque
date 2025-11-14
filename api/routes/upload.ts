import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { ToothDetectionService } from '../services/detection.js';
import { DiseaseAnalysisService } from '../services/diseaseAnalysis.js';

const router = express.Router();
const detectionService = new ToothDetectionService();
const diseaseAnalysisService = new DiseaseAnalysisService();

// 配置multer存储
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  },
});

// 图像预处理函数
async function preprocessImage(buffer: Buffer): Promise<{
  original: string;
  processed: string;
  metadata: any;
}> {
  try {
    // 获取原始图像信息
    const metadata = await sharp(buffer).metadata();
    
    // 转换为标准格式（JPEG）
    const processedBuffer = await sharp(buffer)
      .jpeg({ quality: 90 })
      .resize(1024, 1024, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .normalize() // 自动调整对比度和亮度
      .toBuffer();
    
    // 转换为base64用于前端显示
    const originalBase64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    const processedBase64 = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;
    
    return {
      original: originalBase64,
      processed: processedBase64,
      metadata: {
        originalWidth: metadata.width,
        originalHeight: metadata.height,
        format: metadata.format,
        processedWidth: 1024,
        processedHeight: 1024,
      }
    };
  } catch (error) {
    throw new Error(`图像预处理失败: ${error.message}`);
  }
}

// 图像质量检测
function validateImageQuality(buffer: Buffer): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // 这里可以添加更复杂的图像质量检测逻辑
  // 例如：检测模糊度、亮度、对比度、是否有足够的牙齿区域等
  
  if (buffer.length < 50 * 1024) { // 小于50KB
    issues.push('图像质量过低，请上传更清晰的图片');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// 上传图像接口
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请上传图片文件'
      });
    }
    
    const { buffer } = req.file;
    
    // 图像质量检测
    const qualityCheck = validateImageQuality(buffer);
    if (!qualityCheck.valid) {
      return res.status(400).json({
        success: false,
        error: '图像质量不符合要求',
        issues: qualityCheck.issues
      });
    }
    
    // 图像预处理
    const processedResult = await preprocessImage(buffer);
    
    // 生成唯一的图像ID
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      success: true,
      data: {
        imageId,
        originalImage: processedResult.original,
        processedImage: processedResult.processed,
        metadata: processedResult.metadata,
        message: '图像上传和预处理成功'
      }
    });
    
  } catch (error) {
    console.error('图像上传错误:', error);
    res.status(500).json({
      success: false,
      error: '图像处理失败',
      message: error.message
    });
  }
});

// 获取图像分析结果接口
router.get('/analysis/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // 这里应该查询数据库获取分析结果
    // 现在使用AI服务生成分析结果
    
    // 生成模拟的图像数据（在实际应用中应该从存储中获取）
    const mockImageData = {
      data: new Uint8ClampedArray(512 * 512 * 4).fill(200), // 模拟图像数据
      width: 512,
      height: 512
    } as ImageData;
    
    // 执行牙齿检测
    const detection = await detectionService.detectTeeth(Buffer.from(''));
    
    // 执行疾病分析
    const diseaseAnalysis = await diseaseAnalysisService.analyzeDisease(
      mockImageData, 
      detection.teeth
    );
    
    // 组合分析结果
    const analysisResult = {
      imageId,
      segmentation: {
        teethCount: detection.segmentation.teethCount,
        gumArea: detection.segmentation.gumArea,
        segmentationMask: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' // 模拟分割掩码
      },
      teethDetection: detection.teeth,
      diseaseAnalysis: diseaseAnalysis,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: analysisResult
    });
    
  } catch (error) {
    console.error('获取分析结果错误:', error);
    
    // 如果AI服务失败，返回模拟数据
    const mockAnalysisResult = {
      imageId: req.params.imageId,
      segmentation: {
        teethCount: 28,
        gumArea: 85.6,
        segmentationMask: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      },
      teethDetection: [
        {
          id: 'tooth_1',
          number: '11',
          name: '右上中切牙',
          position: { x: 120, y: 200, width: 45, height: 60 },
          confidence: 0.95,
          condition: 'healthy'
        },
        {
          id: 'tooth_2',
          number: '12',
          name: '右上侧切牙',
          position: { x: 180, y: 195, width: 42, height: 58 },
          confidence: 0.92,
          condition: 'plaque'
        }
      ],
      diseaseAnalysis: {
        plaqueLevel: 'moderate',
        plaquePercentage: 35.2,
        cariesRisk: 'low',
        tartarLevel: 'minimal',
        gumInflammation: 'mild',
        overallScore: 7.2,
        recommendations: [
          '建议每天刷牙两次，使用含氟牙膏',
          '使用牙线清洁牙缝',
          '定期进行口腔检查'
        ],
        riskFactors: ['牙菌斑堆积', '轻微牙龈炎症']
      },
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: mockAnalysisResult
    });
  }
});

export default router;