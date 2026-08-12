"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { colorMap } from "../../lib/glove-options";

type Glove3DPreviewProps = {
  outerPalmColor: string;
  outerThumbColor: string;
  outerIndexColor: string;
  outerMiddleColor: string;
  outerRingColor: string;
  outerPinkyColor: string;
  wristColor: string;

  palmColor: string;
  innerThumbColor: string;
  innerIndexColor: string;
  innerMiddleColor: string;
  innerRingColor: string;
  innerPinkyColor: string;

  laceColor: string;
  webColor: string;
  bindingColor: string;
  weltingColor: string;
  patchColor: string;
  palmLogoColor: string;
  logoColor: string;
};

function GloveModel({
  outerPalmColor,
  outerThumbColor,
  outerIndexColor,
  outerMiddleColor,
  outerRingColor,
  outerPinkyColor,
  wristColor,

  palmColor,
  innerThumbColor,
  innerIndexColor,
  innerMiddleColor,
  innerRingColor,
  innerPinkyColor,

  laceColor,
  webColor,
  bindingColor,
  weltingColor,
  patchColor,
  palmLogoColor,
  logoColor,

}: Glove3DPreviewProps) {
  const { scene, materials } = useGLTF("/models/BPSGlove1.glb");

  useEffect(() => {
    console.log("GLB materials:", Object.keys(materials));

    const setMaterialColor = (materialName: string, colorName: string) => {
      const material = materials[materialName] as THREE.MeshStandardMaterial | undefined;

      if (!material) {
        console.warn(`Missing material: ${materialName}`);
        return;
      }

      const hex = colorMap[colorName] ?? "#ffffff";

      material.map = null;
      material.aoMap = null;
      material.emissiveMap = null;
      material.roughnessMap = null;
      material.metalnessMap = null;

      material.color.set(hex);
      material.roughness = 0.65;
      material.metalness = 0;
      material.needsUpdate = true;
    };

    setMaterialColor("material_outerPalm", outerPalmColor);
    setMaterialColor("material_outerThumb", outerThumbColor);
    setMaterialColor("material_outerIndex", outerIndexColor);
    setMaterialColor("material_outerMiddle", outerMiddleColor);
    setMaterialColor("material_outerRing", outerRingColor);
    setMaterialColor("material_outerPinky", outerPinkyColor);
    setMaterialColor("material_wrist", wristColor);

    setMaterialColor("material_palm", palmColor);
    setMaterialColor("material_innerThumb", innerThumbColor);
    setMaterialColor("material_innerIndex", innerIndexColor);
    setMaterialColor("material_innerMiddle", innerMiddleColor);
    setMaterialColor("material_innerRing", innerRingColor);
    setMaterialColor("material_innerPinky", innerPinkyColor);

    setMaterialColor("material_lace", laceColor);
    setMaterialColor("material_web", webColor);
    setMaterialColor("material_binding", bindingColor);
    setMaterialColor("material_welting", weltingColor);

    setMaterialColor("material_patch", patchColor);
    setMaterialColor("material_palmLogo", palmLogoColor);
    setMaterialColor("material_logo", logoColor);
  }, [
    materials,
    outerPalmColor,
    outerThumbColor,
    outerIndexColor,
    outerMiddleColor,
    outerRingColor,
    outerPinkyColor,
    wristColor,
    palmColor,
    innerThumbColor,
    innerIndexColor,
    innerMiddleColor,
    innerRingColor,
    innerPinkyColor,
    laceColor,
    webColor,
    bindingColor,
    weltingColor,
    patchColor,
    palmLogoColor,
    logoColor,
  ]);

  return (
    <Center>
      <primitive object={scene} scale={3.5} />
    </Center>
  );
}

export default function Glove3DPreview(props: Glove3DPreviewProps) {
  return (
    <div id="glove-preview" className="h-full w-full">
      <Canvas
        camera={{
          position: [0, -4, 2.5],
          fov: 45,
        }}
        gl={{
          antialias: true,
          toneMappingExposure: 1.15,
        }}
      >
        {/* Soft overall lighting */}
        <ambientLight intensity={0.45} />

        {/* Main light */}
        <directionalLight
          position={[5, -3, 6]}
          intensity={2}
        />

        {/* Fill light for the darker side */}
        <directionalLight
          position={[-5, -2, 3]}
          intensity={1.1}
        />

        {/* Top/back light to separate black areas */}
        <directionalLight
          position={[0, 4, -4]}
          intensity={1.3}
        />

        <GloveModel {...props} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.7}
          zoomSpeed={0.8}
          minDistance={2.2}
          maxDistance={5.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}