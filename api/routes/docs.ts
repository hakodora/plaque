/**
 * API Documentation Routes
 * Provides comprehensive API documentation for the DentalAI Pro system
 */

import express, { type Request, type Response, type NextFunction } from 'express'

const router = express.Router()

/**
 * @route   GET /api/docs
 * @desc    Get API documentation overview
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'DentalAI Pro API Documentation',
    version: '1.0.0',
    documentation: {
      overview: 'DentalAI Pro is the world\'s first self-evolving dental image analysis system',
      base_url: '/api',
      authentication: 'JWT Token required for protected endpoints',
      endpoints: {
        auth: {
          path: '/api/auth',
          description: 'User authentication and authorization',
          endpoints: [
            'POST /register - User registration',
            'POST /login - User login',
            'POST /logout - User logout',
            'GET /profile - Get user profile',
            'PUT /profile - Update user profile'
          ]
        },
        upload: {
          path: '/api/upload',
          description: 'Image upload and processing',
          endpoints: [
            'POST /analyze - Upload and analyze dental image',
            'POST /batch - Batch upload multiple images',
            'GET /history - Get analysis history',
            'GET /result/:id - Get specific analysis result'
          ]
        },
        evolution: {
          path: '/api/evolution',
          description: 'Self-evolution system management',
          endpoints: [
            'POST /start - Start evolution process',
            'POST /stop - Stop evolution process',
            'GET /status - Get evolution status',
            'GET /metrics - Get evolution metrics',
            'POST /configure - Update evolution configuration',
            'GET /population - Get current population',
            'POST /evaluate - Trigger fitness evaluation',
            'GET /history - Get evolution history'
          ]
        },
        health: {
          path: '/api/health',
          description: 'System health monitoring',
          endpoints: [
            'GET / - System health check'
          ]
        }
      },
      features: {
        'self_evolution': '24/7 continuous system optimization',
        'multi_format_support': 'Support for JPG, PNG, DICOM formats',
        'real_time_analysis': '3-minute fast analysis with 96.6% accuracy',
        'comprehensive_reporting': 'Multiple report formats and templates',
        'user_management': 'Role-based access control',
        'evolution_dashboard': 'Real-time monitoring and visualization'
      },
      technical_specs: {
        'analysis_accuracy': '96.6%',
        'analysis_speed': '3 minutes per image',
        'supported_formats': ['JPG', 'PNG', 'DICOM', 'TIFF'],
        'detection_capabilities': ['Dental caries', 'Periodontal disease', 'Periapical disease', 'Tooth position', 'Severity grading'],
        'evolution_systems': ['Genetic Algorithm', 'NEAT', 'Adaptive Learning', 'A/B Testing', 'Evolution Manager'],
        'database': 'PostgreSQL 12+',
        'backend': 'Node.js + Express + TypeScript',
        'frontend': 'React + TypeScript + Vite',
        'authentication': 'JWT Token'
      }
    }
  })
})

/**
 * @route   GET /api/docs/auth
 * @desc    Get authentication API documentation
 * @access  Public
 */
router.get('/auth', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Authentication API Documentation',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user account',
        request_body: {
          email: 'string (required) - User email address',
          password: 'string (required) - User password (min 8 characters)',
          name: 'string (required) - User full name',
          role: 'string (optional) - User role (admin, doctor, technician)',
          hospital_id: 'number (optional) - Associated hospital ID'
        },
        response: {
          success: 'boolean - Operation status',
          message: 'string - Response message',
          data: {
            user: 'object - User information',
            token: 'string - JWT access token'
          }
        },
        example: {
          request: {
            email: 'doctor@example.com',
            password: 'SecurePass123!',
            name: 'Dr. Smith',
            role: 'doctor'
          },
          response: {
            success: true,
            message: 'User registered successfully',
            data: {
              user: {
                id: 1,
                email: 'doctor@example.com',
                name: 'Dr. Smith',
                role: 'doctor'
              },
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        }
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'User login',
        request_body: {
          email: 'string (required) - User email address',
          password: 'string (required) - User password'
        },
        response: {
          success: 'boolean - Operation status',
          message: 'string - Response message',
          data: {
            user: 'object - User information',
            token: 'string - JWT access token'
          }
        }
      },
      {
        method: 'GET',
        path: '/api/auth/profile',
        description: 'Get current user profile',
        headers: {
          Authorization: 'Bearer {jwt_token}'
        },
        response: {
          success: 'boolean - Operation status',
          data: 'object - User profile information'
        }
      }
    ]
  })
})

/**
 * @route   GET /api/docs/upload
 * @desc    Get upload API documentation
 * @access  Public
 */
router.get('/upload', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Upload API Documentation',
    endpoints: [
      {
        method: 'POST',
        path: '/api/upload/analyze',
        description: 'Upload and analyze dental image',
        headers: {
          Authorization: 'Bearer {jwt_token}',
          'Content-Type': 'multipart/form-data'
        },
        request_body: {
          image: 'file (required) - Image file (JPG, PNG, DICOM)',
          patient_id: 'string (optional) - Patient identifier',
          analysis_type: 'string (optional) - Type of analysis (comprehensive, quick)'
        },
        response: {
          success: 'boolean - Operation status',
          message: 'string - Response message',
          data: {
            analysis_id: 'string - Unique analysis identifier',
            results: 'object - Analysis results',
            report_url: 'string - URL to generated report'
          }
        },
        analysis_results: {
          detections: 'array - Detected dental conditions',
          severity_scores: 'object - Severity ratings for each condition',
          treatment_recommendations: 'array - Recommended treatments',
          risk_factors: 'array - Identified risk factors',
          confidence_scores: 'object - Confidence levels for each detection'
        }
      },
      {
        method: 'GET',
        path: '/api/upload/history',
        description: 'Get analysis history',
        headers: {
          Authorization: 'Bearer {jwt_token}'
        },
        query_params: {
          page: 'number (optional) - Page number (default: 1)',
          limit: 'number (optional) - Items per page (default: 20)',
          patient_id: 'string (optional) - Filter by patient'
        },
        response: {
          success: 'boolean - Operation status',
          data: {
            analyses: 'array - Analysis history',
            pagination: 'object - Pagination information'
          }
        }
      }
    ]
  })
})

/**
 * @route   GET /api/docs/evolution
 * @desc    Get evolution API documentation
 * @access  Public
 */
router.get('/evolution', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Evolution API Documentation',
    description: 'Self-evolution system for continuous optimization',
    endpoints: [
      {
        method: 'POST',
        path: '/api/evolution/start',
        description: 'Start the evolution process',
        headers: {
          Authorization: 'Bearer {jwt_token}'
        },
        request_body: {
          evolution_type: 'string (optional) - Type of evolution (genetic, neat, adaptive)',
          population_size: 'number (optional) - Population size (default: 50)',
          mutation_rate: 'number (optional) - Mutation rate (default: 0.1)',
          target_fitness: 'number (optional) - Target fitness score'
        },
        response: {
          success: 'boolean - Operation status',
          message: 'string - Response message',
          data: {
            evolution_id: 'string - Evolution process ID',
            status: 'string - Current status',
            start_time: 'string - Start timestamp'
          }
        }
      },
      {
        method: 'GET',
        path: '/api/evolution/status',
        description: 'Get current evolution status',
        headers: {
          Authorization: 'Bearer {jwt_token}'
        },
        response: {
          success: 'boolean - Operation status',
          data: {
            is_running: 'boolean - Whether evolution is active',
            current_generation: 'number - Current generation number',
            best_fitness: 'number - Best fitness score',
            average_fitness: 'number - Average fitness score',
            population_size: 'number - Current population size',
            mutation_rate: 'number - Current mutation rate',
            evolution_systems: 'array - Active evolution systems'
          }
        }
      },
      {
        method: 'GET',
        path: '/api/evolution/metrics',
        description: 'Get evolution metrics and statistics',
        headers: {
          Authorization: 'Bearer {jwt_token}'
        },
        query_params: {
          time_range: 'string (optional) - Time range (1h, 24h, 7d, 30d)',
          system: 'string (optional) - Specific evolution system'
        },
        response: {
          success: 'boolean - Operation status',
          data: {
            performance_trend: 'array - Performance over time',
            accuracy_improvement: 'number - Accuracy improvement percentage',
            speed_improvement: 'number - Speed improvement percentage',
            efficiency_gains: 'object - Efficiency improvements',
            system_health: 'object - System health indicators'
          }
        }
      },
      {
        method: 'POST',
        path: '/api/evolution/configure',
        description: 'Update evolution configuration',
        headers: {
          Authorization: 'Bearer {jwt_token}'
        },
        request_body: {
          genetic_algorithm: 'object - GA configuration parameters',
          neat_system: 'object - NEAT configuration parameters',
          adaptive_learning: 'object - Adaptive learning parameters',
          ab_testing: 'object - A/B testing parameters',
          coordination: 'object - System coordination parameters'
        },
        response: {
          success: 'boolean - Operation status',
          message: 'string - Configuration update status'
        }
      }
    ]
  })
})

/**
 * @route   GET /api/docs/error-codes
 * @desc    Get API error codes and descriptions
 * @access  Public
 */
router.get('/error-codes', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API Error Codes Reference',
    error_codes: {
      '400': {
        code: 'BAD_REQUEST',
        description: 'Invalid request parameters or body',
        common_causes: ['Missing required fields', 'Invalid data types', 'Malformed JSON']
      },
      '401': {
        code: 'UNAUTHORIZED',
        description: 'Authentication required or invalid token',
        common_causes: ['Missing JWT token', 'Expired token', 'Invalid token signature']
      },
      '403': {
        code: 'FORBIDDEN',
        description: 'Insufficient permissions for the requested operation',
        common_causes: ['User role restrictions', 'Resource access limitations']
      },
      '404': {
        code: 'NOT_FOUND',
        description: 'Requested resource not found',
        common_causes: ['Invalid endpoint', 'Non-existent resource ID', 'Deleted resource']
      },
      '409': {
        code: 'CONFLICT',
        description: 'Resource conflict or duplicate operation',
        common_causes: ['Duplicate user registration', 'Concurrent evolution processes']
      },
      '422': {
        code: 'UNPROCESSABLE_ENTITY',
        description: 'Request validation failed',
        common_causes: ['Invalid image format', 'File size too large', 'Business rule violations']
      },
      '429': {
        code: 'TOO_MANY_REQUESTS',
        description: 'Rate limit exceeded',
        common_causes: ['Too many API calls', 'Excessive upload attempts']
      },
      '500': {
        code: 'INTERNAL_SERVER_ERROR',
        description: 'Server internal error',
        common_causes: ['Database connection issues', 'Evolution system errors', 'Unexpected exceptions']
      },
      '503': {
        code: 'SERVICE_UNAVAILABLE',
        description: 'Service temporarily unavailable',
        common_causes: ['System maintenance', 'Evolution system overload', 'External service failures']
      }
    },
    troubleshooting: {
      'authentication_issues': 'Check JWT token validity and expiration',
      'upload_failures': 'Verify image format and file size limits',
      'evolution_errors': 'Check system resources and configuration',
      'performance_issues': 'Monitor system metrics and evolution status'
    }
  })
})

/**
 * @route   GET /api/docs/examples
 * @desc    Get API usage examples
 * @access  Public
 */
router.get('/examples', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API Usage Examples',
    examples: [
      {
        title: 'User Registration and Login',
        description: 'Complete user authentication flow',
        steps: [
          {
            step: 1,
            description: 'Register new user',
            method: 'POST',
            endpoint: '/api/auth/register',
            request: {
              email: 'doctor@example.com',
              password: 'SecurePass123!',
              name: 'Dr. Smith',
              role: 'doctor'
            },
            response: {
              success: true,
              message: 'User registered successfully',
              data: { user: {}, token: 'jwt_token_here' }
            }
          },
          {
            step: 2,
            description: 'Login with credentials',
            method: 'POST',
            endpoint: '/api/auth/login',
            request: {
              email: 'doctor@example.com',
              password: 'SecurePass123!'
            },
            response: {
              success: true,
              message: 'Login successful',
              data: { user: {}, token: 'jwt_token_here' }
            }
          }
        ]
      },
      {
        title: 'Image Analysis Workflow',
        description: 'Complete image upload and analysis process',
        steps: [
          {
            step: 1,
            description: 'Upload dental image for analysis',
            method: 'POST',
            endpoint: '/api/upload/analyze',
            headers: { Authorization: 'Bearer jwt_token_here' },
            request: 'FormData with image file',
            response: {
              success: true,
              data: {
                analysis_id: 'analysis_123',
                results: { detections: [], severity_scores: {} },
                report_url: '/reports/analysis_123.pdf'
              }
            }
          }
        ]
      },
      {
        title: 'Evolution System Management',
        description: 'Start and monitor self-evolution process',
        steps: [
          {
            step: 1,
            description: 'Start evolution process',
            method: 'POST',
            endpoint: '/api/evolution/start',
            headers: { Authorization: 'Bearer jwt_token_here' },
            request: {
              evolution_type: 'genetic',
              population_size: 50,
              target_fitness: 0.98
            },
            response: {
              success: true,
              data: {
                evolution_id: 'evolution_456',
                status: 'running',
                start_time: '2024-01-01T00:00:00Z'
              }
            }
          },
          {
            step: 2,
            description: 'Monitor evolution progress',
            method: 'GET',
            endpoint: '/api/evolution/status',
            headers: { Authorization: 'Bearer jwt_token_here' },
            response: {
              success: true,
              data: {
                is_running: true,
                current_generation: 15,
                best_fitness: 0.966,
                average_fitness: 0.892,
                evolution_systems: ['genetic', 'neat', 'adaptive']
              }
            }
          }
        ]
      }
    ]
  })
})

export default router