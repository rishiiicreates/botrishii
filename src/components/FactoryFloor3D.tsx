"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

// Exact parameters reverse-engineered from module 65675 & 87610 (mindrobotics.com)
const FACTORY_CONFIG = {
  camera: {
    fieldOfView: 14,
    heading: -45,
    pitch: -35.2,
    headingDrift: 0,
    pointer: { yaw: 0.8, pitch: 0.4, ease: 3 },
  },
  outline: {
    width: { tabletPlus: 1.5, mobile: 1.0 },
    creaseAngle: 36,
  },
  shading: {
    light: new THREE.Vector3(-0.66, 1.0, 0.28).normalize(),
    step: 0.15,
    shadow: 0.9,
  },
  models: [
    {
      name: "Pick and place",
      url: "/models/pick-and-place.glb",
      tabletPlus: {
        position: { x: 0.3, y: 0 },
        camera: { offset: { right: -0.57, up: 0.9 }, viewHeight: 4.5 },
      },
      mobile: {
        position: { x: 0.3, y: 0 },
        camera: { offset: { right: -0.27, up: 0.61 }, viewHeight: 6.4 },
      },
    },
    {
      name: "Sorting",
      url: "/models/sorting.glb",
      tabletPlus: {
        position: { x: 6, y: -5.7 },
        camera: { offset: { right: -0.33, up: 0.86 }, viewHeight: 4.5 },
      },
      mobile: {
        position: { x: 6, y: -5.7 },
        camera: { offset: { right: -0.19, up: 0.37 }, viewHeight: 6.4 },
      },
    },
    {
      name: "Fastening",
      url: "/models/fastening.glb",
      tabletPlus: {
        position: { x: 14.2, y: -8.3 },
        camera: { offset: { right: -0.63, up: 0.76 }, viewHeight: 4.5 },
      },
      mobile: {
        position: { x: 13.4, y: -10.1 },
        camera: { offset: { right: -0.34, up: 0.75 }, viewHeight: 6.4 },
      },
    },
    {
      name: "Connectors",
      url: "/models/connectors.glb",
      tabletPlus: {
        position: { x: 15.7, y: -17.9 },
        camera: { offset: { right: -0.73, up: 1.38 }, viewHeight: 4.5 },
      },
      mobile: {
        position: { x: 13.9, y: -19.1 },
        camera: { offset: { right: 0.01, up: 1.18 }, viewHeight: 6.4 },
      },
    },
  ],
  floor: {
    tileSize: 0.5,
    lineWidth: 1.2,
    highlightLineColor: "#252422",
    floorColor: "#e8e5e0",
    lineColor: "#d3d0c5",
    highlightEase: 6,
    trailLength: 6,
  },
  floorSize: 96,
  maxTrail: 12,
};

interface FactoryFloor3DProps {
  scrollProgress: number; // 0 to 1
  onStationChange?: (index: number) => void;
}

export default function FactoryFloor3D({
  scrollProgress,
  onStationChange,
}: FactoryFloor3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const progressRef = useRef(scrollProgress);
  progressRef.current = scrollProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.clientWidth || window.innerWidth;
    let height = canvas.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8e5e0);

    const camera = new THREE.PerspectiveCamera(
      FACTORY_CONFIG.camera.fieldOfView,
      width / height,
      0.1,
      120
    );

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);

    // Floor Shaders & Geometry matching module 0eat54eaowatd.js
    const MAX_TRAIL = FACTORY_CONFIG.maxTrail;
    const trailCells = new Float32Array(MAX_TRAIL * 2);
    const trailStrengths = new Float32Array(MAX_TRAIL);

    const floorUniforms = {
      uTileSize: { value: FACTORY_CONFIG.floor.tileSize },
      uLineWidth: { value: FACTORY_CONFIG.floor.lineWidth },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uFloorColor: { value: new THREE.Color(FACTORY_CONFIG.floor.floorColor) },
      uLineColor: { value: new THREE.Color(FACTORY_CONFIG.floor.lineColor) },
      uHighlightLineColor: { value: new THREE.Color(FACTORY_CONFIG.floor.highlightLineColor) },
      uTrailCells: { value: trailCells },
      uTrailStrengths: { value: trailStrengths },
    };

    const floorMaterial = new THREE.ShaderMaterial({
      uniforms: floorUniforms,
      vertexShader: `
        varying vec2 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        #define MAX_TRAIL ${MAX_TRAIL}
        uniform float uTileSize;
        uniform float uLineWidth;
        uniform float uPixelRatio;
        uniform vec3 uFloorColor;
        uniform vec3 uLineColor;
        uniform vec3 uHighlightLineColor;
        uniform vec2 uTrailCells[MAX_TRAIL];
        uniform float uTrailStrengths[MAX_TRAIL];
        varying vec2 vWorldPosition;

        void main() {
          vec2 cell = vWorldPosition / uTileSize;
          vec2 perPixel = fwidth(cell);
          float width = uLineWidth * 0.5 * uPixelRatio;

          vec2 distanceToLine = abs(fract(cell - 0.5) - 0.5) / perPixel;
          float line = 1.0 - min(min(distanceToLine.x, distanceToLine.y) / width, 1.0);

          float highlight = 0.0;
          for (int i = 0; i < MAX_TRAIL; i++) {
            float strength = uTrailStrengths[i];
            if (strength <= 0.001) continue;

            vec2 local = cell - uTrailCells[i];
            if (local.x < -0.5 || local.x > 1.5 || local.y < -0.5 || local.y > 1.5) continue;

            vec2 toSide = min(abs(local), abs(local - 1.0)) / perPixel;
            vec2 within = step(0.0, local) * step(local, vec2(1.0));
            float borderDistance = min(
              mix(1e6, toSide.x, within.y),
              mix(1e6, toSide.y, within.x)
            );
            highlight = max(highlight, (1.0 - min(borderDistance / width, 1.0)) * strength);
          }

          vec3 color = mix(uFloorColor, uLineColor, line);
          color = mix(color, uHighlightLineColor, highlight);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      polygonOffset: true,
      polygonOffsetFactor: 2,
      polygonOffsetUnits: 2,
    });

    const floorGeom = new THREE.PlaneGeometry(FACTORY_CONFIG.floorSize, FACTORY_CONFIG.floorSize);
    const floorMesh = new THREE.Mesh(floorGeom, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    scene.add(floorMesh);

    // Common Model Outline Shader (Screen Space Normalized)
    const outlineUniforms = {
      uWidth: { value: width < 768 ? 1.0 : 1.5 },
      uResolution: { value: new THREE.Vector2(width, height) },
    };

    const outlineMaterial = new THREE.ShaderMaterial({
      uniforms: outlineUniforms,
      vertexShader: `
        uniform float uWidth;
        uniform vec2 uResolution;
        const float MIN_EXTENT = 0.01;
        void main() {
          vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vec3 viewNormal = normalize(normalMatrix * normal);
          vec2 offset = (projectionMatrix * vec4(viewNormal, 0.0)).xy * uResolution * 0.5;
          float extent = length(offset);
          vec2 direction = extent > MIN_EXTENT ? offset / extent : vec2(0.0);
          clip.xy += direction * uWidth * 2.0 / uResolution * clip.w;
          gl_Position = clip;
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(0.024, 0.102, 0.118, 1.0); // #061a1e black contour
        }
      `,
      side: THREE.BackSide,
      depthTest: true,
      depthWrite: true,
    });

    // Cel-shading toon materials
    const createCelMat = (baseHex: number, shadowHex: number) => {
      return new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * viewMatrix * (modelMatrix * vec4(position, 1.0));
          }
        `,
        fragmentShader: `
          uniform vec3 uBaseColor;
          uniform vec3 uShadowColor;
          uniform vec3 uLightDir;
          uniform float uStep;
          varying vec3 vNormal;
          void main() {
            vec3 n = normalize(vNormal);
            vec3 l = normalize(uLightDir);
            float ndotl = dot(n, l);
            vec3 col = ndotl > uStep ? uBaseColor : uShadowColor;
            gl_FragColor = vec4(col, 1.0);
          }
        `,
        uniforms: {
          uBaseColor: { value: new THREE.Color(baseHex) },
          uShadowColor: { value: new THREE.Color(shadowHex) },
          uLightDir: { value: FACTORY_CONFIG.shading.light },
          uStep: { value: FACTORY_CONFIG.shading.step },
        },
      });
    };

    const whiteMat = createCelMat(0xffffff, 0xc7c4bb);
    const tealMat = createCelMat(0x299093, 0x1d6a6c);
    const yellowMat = createCelMat(0xffbd00, 0xd49b00);
    const redMat = createCelMat(0xef6156, 0xb8443b);
    const greyMat = createCelMat(0xdbd7ca, 0xa19e95);

    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x061a1e,
      linewidth: 1.2,
    });

    let isDisposed = false;
    const modelRoots: THREE.Group[] = [];
    const mixers: THREE.AnimationMixer[] = [];

    MeshoptDecoder.ready.then(() => {
      if (isDisposed) return;
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      let loadedCount = 0;
      FACTORY_CONFIG.models.forEach((cfg, idx) => {
        loader.load(
          cfg.url,
          (gltf) => {
            if (isDisposed) return;
            const model = gltf.scene;

            // Compute bounds and seat base on floor (Y = 0)
            const box = new THREE.Box3().setFromObject(model);
            const minY = box.isEmpty() ? 0 : box.min.y;
            model.position.y = -minY;

            const isMobile = width < 768;
            const modelCoords = isMobile ? cfg.mobile.position : cfg.tabletPlus.position;
            const modelGroup = new THREE.Group();
            modelGroup.position.set(modelCoords.x, 0, modelCoords.y);
            modelGroup.add(model);

            const meshList: THREE.Mesh[] = [];
            model.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                meshList.push(child as THREE.Mesh);
              }
            });

            for (const mesh of meshList) {
              const name = (mesh.name || "").toLowerCase();
              const matName = ((mesh.material as THREE.Material)?.name || "").toLowerCase();
              const combined = name + " " + matName;

              if (combined.includes("yellow") || combined.includes("gear") || combined.includes("gold")) {
                mesh.material = yellowMat;
              } else if (combined.includes("blue") || combined.includes("teal")) {
                mesh.material = tealMat;
              } else if (combined.includes("red")) {
                mesh.material = redMat;
              } else if (combined.includes("grey") || combined.includes("dark")) {
                mesh.material = greyMat;
              } else {
                mesh.material = whiteMat;
              }

              if (mesh.geometry) {
                // Outer screen-space outline
                const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);
                mesh.add(outlineMesh);

                // Technical crease lines
                const edgesGeom = new THREE.EdgesGeometry(mesh.geometry, FACTORY_CONFIG.outline.creaseAngle);
                const edgesMesh = new THREE.LineSegments(edgesGeom, edgesMat);
                mesh.add(edgesMesh);
              }
            }

            // Animation support
            if (gltf.animations && gltf.animations.length > 0) {
              const mixer = new THREE.AnimationMixer(model);
              gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
              });
              mixers.push(mixer);
            }

            scene.add(modelGroup);
            modelRoots[idx] = modelGroup;

            loadedCount++;
            if (loadedCount === FACTORY_CONFIG.models.length) {
              setIsLoaded(true);
            }
          },
          undefined,
          (err) => console.error("Error loading model:", cfg.url, err)
        );
      });
    });

    // Pointer Raycasting for tile hover highlights
    const raycaster = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeIntersection = new THREE.Vector3();
    const pointerPos = new THREE.Vector2(0, 0);
    let isPointerOver = false;

    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      if (px >= 0 && px <= 1 && py >= 0 && py <= 1) {
        pointerPos.set(px * 2 - 1, -(py * 2 - 1));
        isPointerOver = true;
      } else {
        isPointerOver = false;
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("mousemove", onPointerMove);

    // Camera Vector Math helpers
    const UP = new THREE.Vector3(0, 1, 0);
    const tempTargetA = new THREE.Vector3();
    const tempTargetB = new THREE.Vector3();
    const tempOffset = new THREE.Vector3();
    const tempRight = new THREE.Vector3();
    const tempUp = new THREE.Vector3();

    const computeTarget = (
      result: THREE.Vector3,
      offset: { right: number; up: number },
      pos: { x: number; y: number },
      right: THREE.Vector3,
      up: THREE.Vector3
    ) => {
      return result
        .set(pos.x, 0, pos.y)
        .addScaledVector(right, offset.right)
        .addScaledVector(up, offset.up);
    };

    let animId: number;
    let lastTime = performance.now();
    let currentStationIndex = -1;

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Update animations
      for (const mixer of mixers) {
        mixer.update(dt);
      }

      // Tile trail animation
      if (isPointerOver) {
        raycaster.setFromCamera(pointerPos, camera);
        if (raycaster.ray.intersectPlane(groundPlane, planeIntersection)) {
          const tileSize = FACTORY_CONFIG.floor.tileSize;
          const cellX = Math.floor(planeIntersection.x / tileSize);
          const cellZ = Math.floor(planeIntersection.z / tileSize);

          if (trailCells[0] !== cellX || trailCells[1] !== cellZ) {
            trailCells.copyWithin(2, 0, (MAX_TRAIL - 1) * 2);
            trailStrengths.copyWithin(1, 0, MAX_TRAIL - 1);
            trailCells[0] = cellX;
            trailCells[1] = cellZ;
            trailStrengths[0] = 1.0;
          }
        }
      }

      for (let i = 0; i < MAX_TRAIL; i++) {
        trailStrengths[i] = THREE.MathUtils.damp(
          trailStrengths[i],
          0,
          FACTORY_CONFIG.floor.highlightEase,
          dt
        );
      }

      // Camera kinematic motion along 4 stations
      const isMobile = width < 768;
      const modelsCfg = FACTORY_CONFIG.models;
      const numStations = modelsCfg.length;

      const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
      const L = p * (numStations - 1);
      const A = THREE.MathUtils.clamp(Math.floor(L), 0, numStations - 2);
      const b = THREE.MathUtils.smoothstep(L - A, 0, 1);

      const activeIdx = Math.round(L);
      if (activeIdx !== currentStationIndex) {
        currentStationIndex = activeIdx;
        onStationChange?.(activeIdx);
      }

      const modelA = modelsCfg[A];
      const modelB = modelsCfg[A + 1] || modelA;

      const cfgA = isMobile ? modelA.mobile : modelA.tabletPlus;
      const cfgB = isMobile ? modelB.mobile : modelB.tabletPlus;

      const heading = FACTORY_CONFIG.camera.heading;
      const pitch = FACTORY_CONFIG.camera.pitch;
      const xRad = THREE.MathUtils.degToRad(heading);
      const yRad = THREE.MathUtils.degToRad(pitch);

      tempOffset
        .set(
          Math.cos(yRad) * Math.sin(xRad),
          Math.sin(yRad),
          Math.cos(yRad) * Math.cos(xRad)
        )
        .negate();

      tempRight.crossVectors(UP, tempOffset).normalize();
      tempUp.crossVectors(tempOffset, tempRight);

      const targetA = computeTarget(tempTargetA, cfgA.camera.offset, cfgA.position, tempRight, tempUp);
      const targetB = computeTarget(tempTargetB, cfgB.camera.offset, cfgB.position, tempRight, tempUp);
      targetA.lerp(targetB, b);

      const viewHeight = THREE.MathUtils.lerp(cfgA.camera.viewHeight, cfgB.camera.viewHeight, b);
      const fovRad = (FACTORY_CONFIG.camera.fieldOfView / 2) * (Math.PI / 180);
      const camDist = viewHeight / 2 / Math.tan(fovRad);

      tempOffset.multiplyScalar(camDist);

      // Subtle pointer parallax
      if (isPointerOver) {
        tempOffset.applyAxisAngle(
          UP,
          -pointerPos.x * THREE.MathUtils.degToRad(FACTORY_CONFIG.camera.pointer.yaw)
        );
        tempOffset.applyAxisAngle(
          tempRight,
          -pointerPos.y * THREE.MathUtils.degToRad(FACTORY_CONFIG.camera.pointer.pitch)
        );
      }

      camera.position.copy(targetA).add(tempOffset);
      camera.lookAt(targetA);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(loop);

    const onResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      outlineUniforms.uResolution.value.set(width, height);
      outlineUniforms.uWidth.value = width < 768 ? 1.0 : 1.5;
      floorUniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
    };

    window.addEventListener("resize", onResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [onStationChange]);

  return (
    <canvas
      ref={canvasRef}
      className={`size-full absolute inset-0 transition-opacity duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    />
  );
}
