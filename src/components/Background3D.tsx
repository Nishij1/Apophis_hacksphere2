import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { Stethoscope3D } from './Stethoscope3D';

export const Background3D = () => {
  return (
    <div className="fixed inset-0 -z-10 opacity-20">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Float
          speed={4}
          rotationIntensity={1}
          floatIntensity={2}
        >
          <Stethoscope3D />
        </Float>
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
    </div>
  );
};