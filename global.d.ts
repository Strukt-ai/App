// Global JSX declarations for react-three-fiber components
// This ensures threejs material primitives are accepted in TSX.

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshStandardMaterial: any;
      meshPhysicalMaterial: any;
      planeGeometry: any;
      boxGeometry: any;
      sphereGeometry: any;
      circleGeometry: any;
      torusGeometry: any;
      bufferGeometry: any;
      // Fallback to allow any unknown react-three-fiber elements in this codebase.
      [elemName: string]: any;
    }
  }
}

export {}
