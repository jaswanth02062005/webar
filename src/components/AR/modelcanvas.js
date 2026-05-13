import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

export default function ModelCanvas({ imageUrl, landmarksRef, measurements }) {
  const meshRef = useRef();
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  // Dynamic Geometry based on measured depth ratio
  const geomArgs = useMemo(() => {
    // Calculate curvature based on depth/width ratio (default to 0.5)
    const ratio = measurements?.depth && measurements?.width ? measurements.depth / measurements.width : 0.5;
    const thetaLength = Math.PI * (0.4 + ratio * 0.4); // More wrap if user is deeper
    return [1, 1, 1, 32, 1, true, -thetaLength / 2, thetaLength];
  }, [measurements]);

  const targetPos = useRef(new THREE.Vector3());
  const targetRot = useRef(new THREE.Euler());
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));

  useFrame(({ viewport }, delta) => {
    if (!landmarksRef.current || !meshRef.current) return;

    const landmarks = landmarksRef.current;
    const ls = landmarks[11];
    const rs = landmarks[12];
    const lh = landmarks[23];
    const rh = landmarks[24];

    if (ls && rs && lh && rh && ls.visibility > 0.5 && rs.visibility > 0.5) {
      const midX = (ls.x + rs.x + lh.x + rh.x) / 4;
      const midY = (ls.y + rs.y + lh.y + rh.y) / 4;
      const midZ = (ls.z + rs.z + lh.z + rh.z) / 4;

      targetPos.current.set(
        (0.5 - midX) * viewport.width,
        -(midY - 0.5) * viewport.height,
        -midZ * viewport.width - 0.2
      );

      const dx = ls.x - rs.x;
      const dy = ls.y - rs.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const h = Math.abs((ls.y + rs.y) / 2 - (lh.y + rh.y) / 2);

      // Width and Depth combined for realistic scaling
      const radius = dist * viewport.width * 1.4;
      targetScale.current.set(radius, h * viewport.height * 1.8, 1);

      const angle = Math.atan2(ls.y - rs.y, ls.x - rs.x);
      targetRot.current.set(0, 0, angle);

      meshRef.current.position.lerp(targetPos.current, 0.1);
      meshRef.current.scale.lerp(targetScale.current, 0.1);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRot.current.z, 0.1);
    }
  });

  return (
    <group>
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />
      <mesh ref={meshRef}>
        <cylinderGeometry args={geomArgs} />
        <meshStandardMaterial
          map={texture}
          transparent={true}
          alphaTest={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
