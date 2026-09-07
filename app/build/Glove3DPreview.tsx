"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import {
  colorMap,
  getGloveModelPath,
  embroideryLocationMaterialMap,
} from "../../lib/glove-options";

type Glove3DPreviewProps = {
  webStyle: string;

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

  embroideryText: string;
  embroideryColor: string;
  embroideryLocation: string;
};

function GloveModel({
  webStyle,

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

  embroideryText,
  embroideryColor,
  embroideryLocation,
}: Glove3DPreviewProps) {
  const decalMeshRef = useRef<THREE.Mesh>(null);
  /*
   * Most web styles are a recolor of the same glove mesh, but a style
   * like Basket Web needs completely different geometry, so it loads
   * its own GLB. Every other color choice below is reapplied to
   * whichever model loads here, so switching nets never loses the
   * rest of the customization.
   */
  const modelPath = getGloveModelPath(webStyle);
  const { scene, materials } = useGLTF(modelPath);

  useEffect(() => {
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
      material.normalMap = null;
      material.bumpMap = null;
      material.displacementMap = null;

      // Web/lace geometry is modeled as paper-thin, single-layer straps
      // (that's how a woven basket pattern is built), and the GLB doesn't
      // mark them double-sided. Three.js only renders the side the normal
      // faces by default, so in a woven over/under pattern roughly half the
      // strips get backface-culled from any given angle -- that's the black
      // checkerboard look in the pocket. Rendering both sides fixes it
      // regardless of which way an individual strip's normal points.
      material.side = THREE.DoubleSide;

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
    modelPath,
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

  // Projects the embroidery text as a decal onto whichever glove part the
  // user picked. Works generically across every web-style GLB: it finds
  // the target mesh by material name, then raycasts toward it from
  // outside the glove to find a real point + surface normal to build the
  // decal against, rather than relying on hardcoded coordinates that
  // would only be right for one model/orientation.
  useEffect(() => {
    const decalMesh = decalMeshRef.current;
    if (!decalMesh) {
      return;
    }

    if (!embroideryText || !embroideryText.trim()) {
      decalMesh.visible = false;
      return;
    }

    const targetMaterialName = embroideryLocationMaterialMap[embroideryLocation];
    if (!targetMaterialName) {
      decalMesh.visible = false;
      return;
    }

    let targetMesh: THREE.Mesh | null = null;
    scene.traverse((child) => {
      if (targetMesh) return;
      const mesh = child as THREE.Mesh;
      const material = mesh.material as THREE.Material | undefined;
      if (mesh.isMesh && material && material.name === targetMaterialName) {
        targetMesh = mesh;
      }
    });

    if (!targetMesh) {
      console.warn(
        `Embroidery: no mesh found for material "${targetMaterialName}" in ${modelPath}`
      );
      decalMesh.visible = false;
      return;
    }

    try {

    // Make sure every matrixWorld in the hierarchy (including whatever
    // offset <Center> applied) is current before we do any world-space
    // math against it.
    scene.updateMatrixWorld(true);

    const overallBox = new THREE.Box3().setFromObject(scene);
    const overallCenter = overallBox.getCenter(new THREE.Vector3());
    const overallSize = overallBox.getSize(new THREE.Vector3());

    const targetBox = new THREE.Box3().setFromObject(targetMesh);
    const targetCenter = targetBox.getCenter(new THREE.Vector3());
    const targetSize = targetBox.getSize(new THREE.Vector3());

    // "Outward" for this part, approximated as the direction from the
    // whole glove's center to this part's center. Parts near the
    // glove's center (like the wrist strap) fall back to roughly the
    // camera's viewing direction so the decal still lands on the
    // visible side instead of the back.
    const outward = targetCenter.clone().sub(overallCenter);
    if (outward.lengthSq() < 1e-6) {
      outward.set(0, -4, 2.5);
    }
    outward.normalize();

    const rayLength = overallSize.length() + targetSize.length() + 5;
    const rayOrigin = targetCenter.clone().addScaledVector(outward, rayLength);
    const rayDirection = outward.clone().negate();

    const raycaster = new THREE.Raycaster(rayOrigin, rayDirection);
    const hits = raycaster.intersectObject(targetMesh, false);

    let hitPoint: THREE.Vector3;
    let hitNormal: THREE.Vector3;

    if (hits.length > 0 && hits[0].face) {
      hitPoint = hits[0].point;
      hitNormal = hits[0].face.normal
        .clone()
        .transformDirection(targetMesh.matrixWorld)
        .normalize();
    } else {
      console.warn(
        `Embroidery: couldn't raycast a surface hit on "${targetMaterialName}" — using its bounding-box center as a fallback. Placement may need manual tuning.`
      );
      hitPoint = targetCenter;
      hitNormal = outward;
    }

    // Figure out which way the part is "long" (e.g. a finger's length
    // vs. its width) so the text can run along it instead of across
    // it. We use the mesh's own local bounding box -- its longest local
    // axis, converted to a world-space direction -- rather than
    // assuming a fixed world axis, so this works the same way for a
    // long finger, a short knuckle strap, or a wide wrist strap.
    targetMesh.geometry.computeBoundingBox();
    const localBox = targetMesh.geometry.boundingBox ?? new THREE.Box3();
    const localSize = localBox.getSize(new THREE.Vector3());

    let longAxisLocal: THREE.Vector3;
    if (localSize.x >= localSize.y && localSize.x >= localSize.z) {
      longAxisLocal = new THREE.Vector3(1, 0, 0);
    } else if (localSize.y >= localSize.z) {
      longAxisLocal = new THREE.Vector3(0, 1, 0);
    } else {
      longAxisLocal = new THREE.Vector3(0, 0, 1);
    }
    const alongWorld = longAxisLocal
      .clone()
      .transformDirection(targetMesh.matrixWorld)
      .normalize();

    // Build the decal's own coordinate frame directly (instead of
    // THREE.Object3D.lookAt, whose roll around the surface normal is
    // arbitrary and was leaving the text at a random, often
    // near-invisible-edge-on angle): zAxis faces along the surface
    // normal, xAxis is the part's long-axis direction projected flat
    // onto the surface (this is the text's reading direction, so text
    // runs along the finger/strap rather than across it), and yAxis
    // completes a right-handed basis.
    const buildFrame = (normal: THREE.Vector3) => {
      const zAxis = normal.clone().normalize();
      let xAxis = alongWorld
        .clone()
        .sub(zAxis.clone().multiplyScalar(alongWorld.dot(zAxis)));
      if (xAxis.lengthSq() < 1e-6) {
        // The long axis was almost parallel to the surface normal
        // (rare — e.g. decal sitting right on a fingertip). Fall back to
        // projecting world "up" onto the surface instead.
        xAxis = new THREE.Vector3(0, 1, 0).sub(
          zAxis.clone().multiplyScalar(zAxis.y)
        );
      }
      xAxis.normalize();
      const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();
      xAxis.crossVectors(yAxis, zAxis).normalize();
      return { xAxis, yAxis, zAxis };
    };

    // The raycast above finds *a* point on the part's surface, but for a
    // part that isn't flat/symmetric (a curved finger sitting right next
    // to its neighbors) that point can land off to one side -- e.g. right
    // at the seam with the next finger over -- instead of centered on the
    // part's own width. Re-center it: measure how far the target mesh's
    // own bounding-box center sits from the first hit point along the
    // width axis (yAxis) we just built, slide the sample point that far
    // along the surface, and raycast again from outside to land back on
    // the actual (possibly curved) surface at that recentered spot.
    const firstFrame = buildFrame(hitNormal);
    const lateralOffset = targetCenter
      .clone()
      .sub(hitPoint)
      .dot(firstFrame.yAxis);
    const recenteredOrigin = hitPoint
      .clone()
      .addScaledVector(firstFrame.yAxis, lateralOffset)
      .addScaledVector(outward, rayLength);
    const recenterHits = new THREE.Raycaster(
      recenteredOrigin,
      outward.clone().negate()
    ).intersectObject(targetMesh, false);
    if (recenterHits.length > 0 && recenterHits[0].face) {
      hitPoint = recenterHits[0].point;
      hitNormal = recenterHits[0].face.normal
        .clone()
        .transformDirection(targetMesh.matrixWorld)
        .normalize();
    }

    const { xAxis, yAxis, zAxis } = buildFrame(hitNormal);

    const orientation = new THREE.Euler().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis)
    );

    // Size the decal as a small, consistent patch relative to the whole
    // glove -- NOT relative to the target part's own bounding box. A
    // part's bounding box can be much bigger than the visible chunk of
    // it near the hit point (the "outerIndex" material, for instance,
    // covers the finger's entire sleeve down into the palm, so its
    // local Y extent is ~2.26 units -- almost the whole glove's height).
    // Sizing off that longest extent made the decal run nearly the full
    // length of the finger instead of sitting as a small name tag. Basing
    // the patch on the glove's overall diagonal instead keeps it the same
    // physical size no matter which part it lands on, and the extent
    // clamps below just keep it from overflowing a part that's shorter or
    // narrower than the patch (e.g. the thumb).
    const extents = [targetSize.x, targetSize.y, targetSize.z].sort(
      (a, b) => b - a
    );
    const [longExtent, midExtent, thinExtent] = extents;
    const gloveScale = overallSize.length();
    const decalWidth = Math.min(gloveScale * 0.16, longExtent * 0.85);
    const decalHeight = Math.min(decalWidth * 0.45, midExtent * 0.85);
    const decalDepth = Math.max(
      Math.min(thinExtent * 0.5, gloveScale * 0.02),
      0.01
    );
    // DecalGeometry's `size` is a HALF-extent -- the clip box spans
    // [-size, +size] on each local axis, so the box is 2x the physical
    // dimensions we actually want unless we halve them here. Missing
    // this doubled every dimension of the box, which is why the "fixed"
    // depth still swallowed most of the mesh (55k+ vertices survived
    // clipping instead of a few hundred).
    const decalSize = new THREE.Vector3(
      decalWidth / 2,
      decalHeight / 2,
      decalDepth / 2
    );

    const geometry = new DecalGeometry(targetMesh, hitPoint, orientation, decalSize);

    // Render the embroidery text onto a canvas, then use that as the
    // decal's texture. A dark stroke behind the fill mimics a stitched
    // outline and keeps the text legible against any thread color.
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      decalMesh.visible = false;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";

    let fontSize = 140;
    const maxTextWidth = canvas.width * 0.86;
    ctx.font = `bold ${fontSize}px Georgia, 'Times New Roman', serif`;
    while (fontSize > 40 && ctx.measureText(embroideryText).width > maxTextWidth) {
      fontSize -= 4;
      ctx.font = `bold ${fontSize}px Georgia, 'Times New Roman', serif`;
    }

    ctx.lineWidth = Math.max(fontSize * 0.08, 4);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.strokeText(embroideryText, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = colorMap[embroideryColor] ?? "#ffffff";
    ctx.fillText(embroideryText, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      roughness: 0.8,
      metalness: 0,
    });

    decalMesh.geometry = geometry;
    decalMesh.material = material;
    decalMesh.visible = true;

    return () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
    } catch (err) {
      console.error("Embroidery decal error", err);
      decalMesh.visible = false;
    }
  }, [scene, modelPath, embroideryText, embroideryColor, embroideryLocation]);

  return (
    <>
      <Center>
        <primitive object={scene} scale={3.5} />
      </Center>
      {/*
       * Rendered as a sibling of <Center>, not inside it: DecalGeometry
       * bakes the target mesh's matrixWorld (which already includes
       * Center's offset) into the decal's vertex positions, so this mesh
       * needs to stay at identity transform in the same world space.
       */}
      <mesh ref={decalMeshRef} renderOrder={2} visible={false} />
    </>
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

        <Suspense fallback={null}>
          <GloveModel {...props} />
        </Suspense>

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