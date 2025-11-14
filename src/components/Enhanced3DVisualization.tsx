import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { 
  ZoomIn, ZoomOut, RotateCcw, Maximize2, 
  Layers, Palette, Grid3x3, Eye, EyeOff, Play, Pause,
  Camera, Settings, Info, RotateCw
} from 'lucide-react';

interface Enhanced3DVisualizationProps {
  segmentationData: {
    teethMask: number[][];
    gumMask: number[][];
    boundingBoxes: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      type: 'tooth' | 'gum';
      confidence: number;
    }>;
  };
  teethData: Array<{
    id: string;
    number: string;
    name: string;
    position: { x: number; y: number; width: number; height: number };
    confidence: number;
    condition: 'healthy' | 'caries' | 'plaque' | 'tartar';
  }>;
}

export default function Enhanced3DVisualization({ 
  segmentationData, 
  teethData 
}: Enhanced3DVisualizationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelMountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const [viewMode, setViewMode] = useState<'full' | 'teeth' | 'gums' | 'issues'>('full');
  const [colorScheme, setColorScheme] = useState<'natural' | 'diagnostic' | 'heatmap'>('natural');
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!mountRef.current || !labelMountRef.current) return;

    // 初始化Three.js场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f0f);
    sceneRef.current = scene;

    // 设置相机
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // 设置WebGL渲染器
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // 设置CSS2D渲染器用于标签
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    labelRendererRef.current = labelRenderer;

    mountRef.current.appendChild(renderer.domElement);
    labelMountRef.current.appendChild(labelRenderer.domElement);

    // 添加控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2;
    controlsRef.current = controls;

    // 添加高级灯光
    setupAdvancedLighting(scene);

    // 创建3D模型
    create3DModels(scene);

    // 开始渲染循环
    animate();

    setIsLoading(false);

    // 清理函数
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (labelMountRef.current && labelRenderer.domElement) {
        labelMountRef.current.removeChild(labelRenderer.domElement);
      }
      renderer.dispose();
      labelRenderer.dispose();
      controls.dispose();
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      updateVisualization();
    }
  }, [viewMode, colorScheme, showLabels, showGrid, segmentationData, teethData]);

  const setupAdvancedLighting = (scene: THREE.Scene) => {
    // 清除现有灯光
    const lightsToRemove = scene.children.filter(child => child instanceof THREE.Light);
    lightsToRemove.forEach(light => scene.remove(light));

    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // 主光源
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(10, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);

    // 补光
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
    fillLight.position.set(-5, 5, 3);
    scene.add(fillLight);

    // 背光
    const rimLight = new THREE.DirectionalLight(0xffa500, 0.2);
    rimLight.position.set(0, -5, -5);
    scene.add(rimLight);

    // 点光源（用于牙齿细节照明）
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // 半球光（提供更自然的环境照明）
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.3);
    scene.add(hemisphereLight);
  };

  const create3DModels = (scene: THREE.Scene) => {
    // 清除现有模型（保留灯光和标签）
    const modelsToRemove = scene.children.filter(child => 
      !child.userData.isLabel && !(child instanceof THREE.Light)
    );
    modelsToRemove.forEach(model => scene.remove(model));

    if (showGrid) {
      addGrid(scene);
    }

    // 创建牙齿3D模型
    createTeethModels(scene);

    // 创建牙龈3D模型
    createGumModels(scene);

    // 添加问题标记
    addIssueMarkers(scene);

    // 添加增强标签
    addEnhancedLabels(scene);
  };

  const addGrid = (scene: THREE.Scene) => {
    const gridHelper = new THREE.GridHelper(10, 20, 0x444444, 0x222222);
    scene.add(gridHelper);
  };

  const createTeethModels = (scene: THREE.Scene) => {
    if (viewMode === 'gums') return;

    teethData.forEach((tooth, index) => {
      const { x, y, width, height } = tooth.position;
      
      // 根据牙齿状况选择颜色
      const color = getToothColor(tooth.condition, tooth.confidence);
      
      // 创建更真实的牙齿几何体
      const geometry = createRealisticToothGeometry(width, height);
      
      // 高级材质设置
      const material = new THREE.MeshPhysicalMaterial({ 
        color,
        transparent: true,
        opacity: viewMode === 'issues' && tooth.condition === 'healthy' ? 0.3 : 0.95,
        roughness: tooth.condition === 'healthy' ? 0.1 : 0.3,
        metalness: 0.0,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        reflectivity: 0.5
      });
      
      const toothMesh = new THREE.Mesh(geometry, material);
      toothMesh.position.set(
        (x - 256) * 0.02, 
        (128 - y) * 0.02, 
        0
      );
      toothMesh.castShadow = true;
      toothMesh.receiveShadow = true;
      
      // 添加用户数据
      toothMesh.userData = {
        id: tooth.id,
        name: tooth.name,
        number: tooth.number,
        condition: tooth.condition,
        confidence: tooth.confidence,
        originalPosition: toothMesh.position.clone(),
        originalScale: toothMesh.scale.clone()
      };
      
      // 添加交互事件
      toothMesh.userData.onClick = () => handleToothClick(tooth.id);
      
      scene.add(toothMesh);

      // 添加选中高亮效果
      if (selectedTooth === tooth.id) {
        addSelectionHighlight(toothMesh, scene);
      }

      // 添加发光效果给有问题的牙齿
      if (tooth.condition !== 'healthy') {
        addAdvancedGlowEffect(toothMesh, scene, tooth.condition);
      }

      // 添加入场动画
      addEntranceAnimation(toothMesh, index);
    });
  };

  const createRealisticToothGeometry = (width: number, height: number): THREE.BufferGeometry => {
    // 创建更真实的牙齿形状
    const shape = new THREE.Shape();
    
    // 牙齿轮廓（简化的牙冠形状）
    const w = width * 0.01;
    const h = height * 0.02;
    
    shape.moveTo(-w/2, -h/2);
    shape.lineTo(-w/3, h/2);
    shape.lineTo(0, h/2 + 0.1);
    shape.lineTo(w/3, h/2);
    shape.lineTo(w/2, -h/2);
    shape.lineTo(-w/2, -h/2);
    
    const extrudeSettings = {
      depth: w * 0.3,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  const createGumModels = (scene: THREE.Scene) => {
    if (viewMode === 'teeth') return;

    // 创建牙龈基础形状
    const gumGeometry = new THREE.PlaneGeometry(8, 6, 32, 24);
    
    // 根据分割数据修改几何体
    const positions = gumGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      
      // 根据牙龈掩码数据调整Z坐标
      const maskX = Math.floor((x + 4) * 64); // 映射到掩码坐标
      const maskY = Math.floor((y + 3) * 85); // 映射到掩码坐标
      
      if (segmentationData.gumMask[maskY] && segmentationData.gumMask[maskY][maskX]) {
        positions[i + 2] = Math.sin(x * 2) * Math.cos(y * 2) * 0.1; // 添加起伏
      }
    }
    
    const gumMaterial = new THREE.MeshPhongMaterial({ 
      color: getGumColor(colorScheme),
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const gumMesh = new THREE.Mesh(gumGeometry, gumMaterial);
    gumMesh.position.set(0, 0, -0.2);
    gumMesh.receiveShadow = true;
    scene.add(gumMesh);
  };

  const addIssueMarkers = (scene: THREE.Scene) => {
    if (viewMode === 'full' || viewMode === 'issues') {
      teethData.forEach(tooth => {
        if (tooth.condition !== 'healthy') {
          const markerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
          const markerColor = getIssueColor(tooth.condition);
          const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: markerColor,
            transparent: true,
            opacity: 0.8
          });
          
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          const { x, y } = tooth.position;
          marker.position.set(
            (x - 256) * 0.02, 
            (128 - y) * 0.02, 
            0.3
          );
          
          // 添加脉冲动画
          marker.userData.pulsePhase = Math.random() * Math.PI * 2;
          scene.add(marker);
        }
      });
    }
  };

  const addEnhancedLabels = (scene: THREE.Scene) => {
    if (!labelRendererRef.current) return;

    // 清除现有标签
    const labelsToRemove = scene.children.filter(child => child.userData.isLabel);
    labelsToRemove.forEach(label => scene.remove(label));

    if (!showLabels) return;

    teethData.forEach((tooth, index) => {
      if (index % 3 === 0 || tooth.condition !== 'healthy') { // 显示部分标签和问题牙齿标签
        const { x, y } = tooth.position;
        
        // 创建HTML标签
        const labelDiv = document.createElement('div');
        labelDiv.className = 'tooth-label';
        labelDiv.style.cssText = `
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          pointer-events: none;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(4px);
        `;
        
        const conditionText = tooth.condition !== 'healthy' ? ` (${getConditionText(tooth.condition)})` : '';
        labelDiv.textContent = `${tooth.number} ${tooth.name}${conditionText}`;
        
        // 根据条件设置颜色
        if (tooth.condition !== 'healthy') {
          labelDiv.style.borderColor = getConditionColorHex(tooth.condition);
          labelDiv.style.background = `rgba(${getConditionColorRGB(tooth.condition)}, 0.8)`;
        }
        
        const labelObject = new CSS2DObject(labelDiv);
        labelObject.position.set(
          (x - 256) * 0.02, 
          (128 - y) * 0.02 + 0.4, 
          0.2
        );
        labelObject.userData.isLabel = true;
        
        scene.add(labelObject);
      }
    });
  };

  const getConditionText = (condition: string): string => {
    switch (condition) {
      case 'caries': return '龋齿';
      case 'plaque': return '菌斑';
      case 'tartar': return '结石';
      default: return '健康';
    }
  };

  const getConditionColorHex = (condition: string): string => {
    switch (condition) {
      case 'caries': return '#ff4444';
      case 'plaque': return '#ffff44';
      case 'tartar': return '#ff44ff';
      default: return '#44ff44';
    }
  };

  const getConditionColorRGB = (condition: string): string => {
    switch (condition) {
      case 'caries': return '255, 68, 68';
      case 'plaque': return '255, 255, 68';
      case 'tartar': return '255, 68, 255';
      default: return '68, 255, 68';
    }
  };

  const addAdvancedGlowEffect = (mesh: THREE.Mesh, scene: THREE.Scene, condition: string) => {
    // 创建多层发光效果
    for (let i = 0; i < 3; i++) {
      const glowGeometry = mesh.geometry.clone();
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: getConditionColor(condition),
        transparent: true,
        opacity: 0.4 - i * 0.1,
        side: THREE.BackSide
      });
      
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.copy(mesh.position);
      glowMesh.scale.multiplyScalar(1.1 + i * 0.05);
      
      // 添加脉冲动画数据
      glowMesh.userData.pulsePhase = Math.random() * Math.PI * 2;
      glowMesh.userData.pulseSpeed = 0.02 + i * 0.01;
      
      scene.add(glowMesh);
    }
  };

  const addSelectionHighlight = (mesh: THREE.Mesh, scene: THREE.Scene) => {
    const highlightGeometry = mesh.geometry.clone();
    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      wireframe: true
    });
    
    const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightMesh.position.copy(mesh.position);
    highlightMesh.scale.multiplyScalar(1.15);
    highlightMesh.userData.isHighlight = true;
    
    scene.add(highlightMesh);
  };

  const addEntranceAnimation = (mesh: THREE.Mesh, index: number) => {
    // 初始状态
    mesh.scale.setScalar(0.01);
    mesh.rotation.x = Math.PI / 2;
    
    // 动画目标
    const targetScale = mesh.userData.originalScale.clone();
    const targetRotation = 0;
    
    // 动画参数
    const duration = 1000 + index * 50; // 错开动画时间
    const startTime = Date.now() + index * 100;
    
    const animateEntrance = () => {
      const currentTime = Date.now();
      if (currentTime < startTime) {
        requestAnimationFrame(animateEntrance);
        return;
      }
      
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutElastic(progress);
      
      mesh.scale.lerp(targetScale, easedProgress);
      mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetRotation, easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateEntrance);
      }
    };
    
    animateEntrance();
  };

  const easeOutElastic = (x: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  };

  const getConditionColor = (condition: string): number => {
    switch (condition) {
      case 'caries': return 0xff4444;
      case 'plaque': return 0xffff44;
      case 'tartar': return 0xff44ff;
      default: return 0x44ff44;
    }
  };

  const handleToothClick = (toothId: string) => {
    setSelectedTooth(selectedTooth === toothId ? null : toothId);
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!cameraRef.current || !sceneRef.current) return;
    
    const rect = mountRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    const intersects = raycaster.intersectObjects(sceneRef.current.children);
    
    // 重置所有牙齿的发光效果
    sceneRef.current.traverse((child) => {
      if (child.userData.id && child instanceof THREE.Mesh) {
        child.material.emissive.setHex(0x000000);
      }
    });
    
    // 高亮悬停的牙齿
    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      if (intersected.userData.id && intersected instanceof THREE.Mesh) {
        intersected.material.emissive.setHex(0x444444);
        mountRef.current!.style.cursor = 'pointer';
      }
    } else {
      mountRef.current!.style.cursor = 'default';
    }
  }, []);

  const getToothColor = (condition: string, confidence: number): number => {
    switch (colorScheme) {
      case 'diagnostic':
        switch (condition) {
          case 'healthy': return 0x90EE90; // 浅绿色
          case 'caries': return 0xFF6B6B; // 红色
          case 'plaque': return 0xFFD93D; // 黄色
          case 'tartar': return 0xA78BFA; // 紫色
          default: return 0xFFFFFF; // 白色
        }
      case 'heatmap':
        // 基于置信度的热图颜色
        if (confidence > 0.9) return 0x00FF00; // 绿色
        if (confidence > 0.7) return 0xFFFF00; // 黄色
        if (confidence > 0.5) return 0xFF8000; // 橙色
        return 0xFF0000; // 红色
      default: // natural
        return 0xF5F5F5; // 自然的牙齿颜色
    }
  };

  const getGumColor = (scheme: string): number => {
    switch (scheme) {
      case 'diagnostic':
        return 0xFF69B4; // 粉红色
      case 'heatmap':
        return 0xFF4500; // 橙红色
      default:
        return 0xFFB6C1; // 浅粉色
    }
  };

  const getIssueColor = (condition: string): number => {
    switch (condition) {
      case 'caries': return 0xFF0000;
      case 'plaque': return 0xFFFF00;
      case 'tartar': return 0x800080;
      default: return 0xFF6B6B;
    }
  };

  const updateVisualization = () => {
    if (sceneRef.current) {
      create3DModels(sceneRef.current);
    }
  };

  const animate = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;

    // 更新脉冲动画
    sceneRef.current.traverse((child) => {
      if (child.userData.pulsePhase !== undefined) {
        child.userData.pulsePhase += child.userData.pulseSpeed || 0.05;
        const scale = 1 + Math.sin(child.userData.pulsePhase) * 0.15;
        child.scale.setScalar(scale);
      }
    });

    // 更新控制器
    controlsRef.current.autoRotate = autoRotate;
    controlsRef.current.update();
    
    // 渲染场景
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    
    // 渲染标签
    if (labelRendererRef.current) {
      labelRendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    
    if (isAnimating) {
      animationIdRef.current = requestAnimationFrame(animate);
    }
  };

  const handlePlayPause = () => {
    setIsAnimating(!isAnimating);
    if (!isAnimating) {
      animate();
    }
  };

  const handleAutoRotate = () => {
    setAutoRotate(!autoRotate);
  };

  const handleScreenshot = () => {
    if (!rendererRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'dental-analysis-3d.png';
    link.href = rendererRef.current.domElement.toDataURL();
    link.click();
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.9);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.1);
    }
  };

  const handleReset = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 5);
      controlsRef.current.reset();
    }
  };

  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>正在加载3D可视化...</p>
          </div>
        </div>
      )}

      {/* 3D渲染容器 */}
      <div ref={mountRef} className="w-full h-full" onMouseMove={handleMouseMove} />
      <div ref={labelMountRef} className="absolute inset-0 pointer-events-none" />

      {/* 顶部控制栏 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 rounded-lg p-2 flex space-x-2">
        <button
          onClick={handlePlayPause}
          className={`p-2 rounded transition-colors ${
            isAnimating ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}
          title={isAnimating ? '暂停动画' : '播放动画'}
        >
          {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        
        <button
          onClick={handleAutoRotate}
          className={`p-2 rounded transition-colors ${
            autoRotate ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}
          title="自动旋转"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleScreenshot}
          className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          title="截图"
        >
          <Camera className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`p-2 rounded transition-colors ${
            showInfo ? 'bg-yellow-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}
          title="显示信息"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* 左侧控制面板 */}
      <div className="absolute top-16 left-4 bg-black bg-opacity-70 rounded-lg p-3 space-y-3">
        <div className="flex space-x-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            title="重置视角"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600"
          >
            <option value="full">完整视图</option>
            <option value="teeth">仅牙齿</option>
            <option value="gums">仅牙龈</option>
            <option value="issues">问题视图</option>
          </select>

          <select
            value={colorScheme}
            onChange={(e) => setColorScheme(e.target.value as any)}
            className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600"
          >
            <option value="natural">自然色彩</option>
            <option value="diagnostic">诊断色彩</option>
            <option value="heatmap">热力图</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-2 rounded transition-colors ${
              showLabels ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
            }`}
            title="显示标签"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded transition-colors ${
              showGrid ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
            }`}
            title="显示网格"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 右侧图例 */}
      <div className="absolute top-16 right-4 bg-black bg-opacity-70 rounded-lg p-3 text-white text-xs max-w-xs">
        <h4 className="font-semibold mb-2 flex items-center">
          <Palette className="w-3 h-3 mr-1" />
          图例
        </h4>
        {colorScheme === 'diagnostic' && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>健康</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span>龋齿</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>牙菌斑</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded"></div>
              <span>牙结石</span>
            </div>
          </div>
        )}
        {colorScheme === 'heatmap' && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>高置信度</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>中等置信度</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>低置信度</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>极低置信度</span>
            </div>
          </div>
        )}
        
        {selectedTooth && (
          <div className="mt-3 pt-2 border-t border-gray-600">
            <h5 className="font-semibold mb-1">选中牙齿</h5>
            {(() => {
              const tooth = teethData.find(t => t.id === selectedTooth);
              return tooth ? (
                <div className="text-xs">
                  <div>编号: {tooth.number}</div>
                  <div>名称: {tooth.name}</div>
                  <div>状态: {getConditionText(tooth.condition)}</div>
                  <div>置信度: {(tooth.confidence * 100).toFixed(1)}%</div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* 底部信息面板 */}
      {showInfo && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-80 rounded-lg p-3 text-white text-xs">
          <div className="flex justify-between items-start">
            <div>
              <h5 className="font-semibold mb-1">3D可视化信息</h5>
              <div className="space-y-1">
                <div>牙齿数量: {teethData.length}</div>
                <div>问题牙齿: {teethData.filter(t => t.condition !== 'healthy').length}</div>
                <div>平均置信度: {(teethData.reduce((sum, t) => sum + t.confidence, 0) / teethData.length * 100).toFixed(1)}%</div>
              </div>
            </div>
            <div className="text-right">
              <div>渲染模式: {viewMode}</div>
              <div>色彩方案: {colorScheme}</div>
              <div>动画状态: {isAnimating ? '运行中' : '已暂停'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}