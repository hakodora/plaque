import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { ToothDetectionService } from '../services/detection.js';
import { DiseaseAnalysisService } from '../services/diseaseAnalysis.js';

const router = express.Router();
const imageStore = new Map<string, Buffer>();
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
  processedBuffer: Buffer;
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
      processedBuffer,
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

type UploadRequest = express.Request & { file?: any };

// 上传图像接口
router.post('/upload', upload.single('image'), async (req: UploadRequest, res) => {
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
    imageStore.set(imageId, processedResult.processedBuffer);
    
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
    const stored = imageStore.get(imageId);
    if (!stored) {
      return res.status(404).json({ success: false, error: '未找到图像，请重新上传' });
    }
    // 执行牙齿检测（真实图像）
    const detection = await detectionService.detectTeeth(stored);
    // 将图像转换为 ImageData 供疾病分析使用
    const sharpImage = sharp(stored);
    const { data: rawData, info } = await sharpImage.raw().toBuffer({ resolveWithObject: true });
    const raw = { data: new Uint8ClampedArray(rawData), width: info.width!, height: info.height! };
    // 执行疾病分析（真实图像）
    const diseaseAnalysis = await diseaseAnalysisService.analyzeDisease(raw, detection.teeth);
    
    // 组合分析结果
    const analysisResult = {
      imageId,
      segmentation: {
        teethCount: detection.segmentation.teethCount,
        gumArea: Math.round(detection.segmentation.gumArea * 10) / 10,
        segmentationMask: ''
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
    res.status(500).json({ success: false, error: '分析失败', message: (error as Error).message });
  }
});

export default router;