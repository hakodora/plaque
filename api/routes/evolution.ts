import express from 'express';
import cors from 'cors';
import { EvolutionManager } from '../services/evolutionManager';
import { AdaptiveLearningSystem } from '../services/adaptiveLearningSystem';
import { EvolutionEngine } from '../services/evolutionEngine';
import { NEATEngine } from '../services/neatEngine';
import { AutomatedABTestingFramework } from '../services/automatedABTesting';
import { SelfAnalysisManager } from '../services/selfAnalysisManager';

const router = express.Router();

// 全局进化管理器实例
let evolutionManager: EvolutionManager | null = null;
let selfAnalysisManager: SelfAnalysisManager | null = null;

// 初始化进化系统
function initializeEvolutionSystem() {
  if (!evolutionManager) {
    selfAnalysisManager = new SelfAnalysisManager();
    evolutionManager = new EvolutionManager({
      enableSelfAnalysis: true,
      enableEvolution: true,
      enableNEAT: true,
      enableAdaptiveLearning: true,
      enableABTesting: true,
      coordination: {
        strategy: 'adaptive',
        synchronizationInterval: 300000, // 5 minutes
        conflictResolution: 'meta-learning'
      },
      optimization: {
        targetMetrics: ['accuracy', 'speed', 'efficiency', 'stability'],
        optimizationStrategy: 'multi-objective',
        convergenceCriteria: {
          maxGenerations: 1000,
          fitnessThreshold: 0.99,
          stagnationLimit: 50
        }
      },
      monitoring: {
        logLevel: 'info',
        metricsCollection: true,
        performanceTracking: true,
        anomalyDetection: true
      }
    });

    // 设置事件监听器
    setupEventListeners();
  }
}

function setupEventListeners() {
  if (!evolutionManager) return;

  evolutionManager.on('evolution-manager-started', (data) => {
    console.log('Evolution manager started:', data);
  });

  evolutionManager.on('evolution-state-updated', (state) => {
    console.log('Evolution state updated:', state);
  });

  evolutionManager.on('evolution-metrics', (metrics) => {
    console.log('Evolution metrics:', metrics);
  });

  evolutionManager.on('optimization-recommendation', (recommendation) => {
    console.log('Optimization recommendation:', recommendation);
  });
}

// 启动进化系统
router.post('/start', (req, res) => {
  try {
    res.status(202).json({
      success: true,
      message: 'Evolution start accepted',
      timestamp: new Date().toISOString()
    });

    setImmediate(async () => {
      try {
        initializeEvolutionSystem();
        if (evolutionManager) {
          await evolutionManager.startEvolution();
        } else {
          console.error('Failed to initialize evolution system');
        }
      } catch (err) {
        console.error('Error starting evolution system:', err);
      }
    });
  } catch (error) {
    console.error('Error starting evolution system:', error);
    // do not re-send response; it has been accepted already
  }
});

// 快速连通性测试
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'pong', timestamp: new Date().toISOString() });
});

// 停止进化系统
router.post('/stop', async (req, res) => {
  try {
    if (evolutionManager) {
      evolutionManager.stopEvolution();
      res.json({
        success: true,
        message: 'Evolution system stopped successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Evolution system is not running'
      });
    }
  } catch (error) {
    console.error('Error stopping evolution system:', error);
    res.status(500).json({
      success: false,
      message: 'Error stopping evolution system',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取进化系统状态
router.get('/status', (req, res) => {
  try {
    if (evolutionManager) {
      const status = evolutionManager.getSystemStatus();
      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        data: {
          isRunning: false,
          evolutionState: null,
          activeSubsystems: [],
          healthStatus: { overall: 0, systems: {} }
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error getting evolution status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting evolution status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取进化历史数据
router.get('/history', (req, res) => {
  try {
    if (evolutionManager) {
      const history = evolutionManager.getEvolutionHistory();
      res.json({
        success: true,
        data: history,
        count: history.length,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error getting evolution history:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting evolution history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取进化配置
router.get('/configuration', (req, res) => {
  try {
    if (evolutionManager) {
      const config = evolutionManager.getConfiguration();
      res.json({
        success: true,
        data: config,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Evolution system is not initialized'
      });
    }
  } catch (error) {
    console.error('Error getting evolution configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting evolution configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 更新进化配置
router.put('/configuration', (req, res) => {
  try {
    if (evolutionManager) {
      const newConfig = req.body;
      evolutionManager.updateConfiguration(newConfig);
      res.json({
        success: true,
        message: 'Evolution configuration updated successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Evolution system is not initialized'
      });
    }
  } catch (error) {
    console.error('Error updating evolution configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating evolution configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 强制协调
router.post('/force-coordination', async (req, res) => {
  try {
    if (evolutionManager) {
      await evolutionManager.forceCoordination();
      res.json({
        success: true,
        message: 'Forced coordination completed',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Evolution system is not initialized'
      });
    }
  } catch (error) {
    console.error('Error forcing coordination:', error);
    res.status(500).json({
      success: false,
      message: 'Error forcing coordination',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取冲突日志
router.get('/conflicts', (req, res) => {
  try {
    if (evolutionManager) {
      const conflicts = evolutionManager.getConflictLog();
      res.json({
        success: true,
        data: conflicts,
        count: conflicts.length,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error getting conflict log:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting conflict log',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 导出进化报告
router.get('/report', (req, res) => {
  try {
    if (evolutionManager) {
      const report = evolutionManager.exportEvolutionReport();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="evolution-report.json"');
      res.send(report);
    } else {
      res.status(400).json({
        success: false,
        message: 'Evolution system is not initialized'
      });
    }
  } catch (error) {
    console.error('Error exporting evolution report:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting evolution report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取自分析系统状态
router.get('/self-analysis/status', (req, res) => {
  try {
    if (selfAnalysisManager) {
      const status = selfAnalysisManager.getSystemStatus();
      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Self-analysis system is not initialized'
      });
    }
  } catch (error) {
    console.error('Error getting self-analysis status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting self-analysis status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取自分析系统统计
router.get('/self-analysis/statistics', (req, res) => {
  try {
    if (selfAnalysisManager) {
      const statistics = selfAnalysisManager.getSystemStatistics();
      res.json({
        success: true,
        data: statistics,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Self-analysis system is not initialized'
      });
    }
  } catch (error) {
    console.error('Error getting self-analysis statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting self-analysis statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 导出自分析系统报告
router.get('/self-analysis/report', (req, res) => {
  try {
    if (selfAnalysisManager) {
      const report = selfAnalysisManager.exportSystemReport();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="self-analysis-report.json"');
      res.send(report);
    } else {
      res.status(400).json({
        success: false,
        message: 'Self-analysis system is not initialized'
      });
    }
  } catch (error) {
    console.error('Error exporting self-analysis report:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting self-analysis report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 健康检查端点
router.get('/health', (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        evolutionManager: evolutionManager ? 'initialized' : 'not_initialized',
        selfAnalysisManager: selfAnalysisManager ? 'initialized' : 'not_initialized',
        isRunning: evolutionManager?.getSystemStatus().isRunning || false
      }
    };
    
    res.json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;