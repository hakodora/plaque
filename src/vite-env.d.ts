/// <reference types="vite/client" />
declare module 'three/examples/jsm/controls/OrbitControls' {
  export class OrbitControls {
    constructor(object: any, domElement?: any);
    enabled: boolean;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    enablePan: boolean;
    autoRotate: boolean;
    autoRotateSpeed: number;
    update(): void;
    reset(): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/renderers/CSS2DRenderer' {
  export class CSS2DRenderer {
    domElement: HTMLDivElement;
    setSize(width: number, height: number): void;
    render(scene: any, camera: any): void;
    dispose(): void;
  }
  export class CSS2DObject {
    constructor(element: HTMLElement);
    position: { set: (x: number, y: number, z: number) => void };
    userData: any;
  }
}