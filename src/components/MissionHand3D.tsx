"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

// 3D Hand configuration
const HAND_CONFIG = {
  url: "/models/hand.glb",
  viewHeight: 0.8,
  outline: {
    tabletPlus: { outerWidth: 3.0, innerWidth: 1.5 },
    mobile: { outerWidth: 1.8, innerWidth: 1.0 },
  },
  shading: {
    light: { x: 1, y: -1, z: 0.53 },
    step: 0.15,
    shadow: 0.88,
  },
  offset: [0.415, 0.44],
  pose: {
    flip: 0.51,
    x: -0.22,
    y: -0.12,
    z: -0.81,
  },
  pointer: {
    yaw: 0.215,
    pitch: 0.475,
    ease: 4,
  },
  scroll: {
    drift: 0.025,
    extend: 0.04,
    ease: 4,
  },
};

export default function MissionHand3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.clientWidth || 900;
    let height = canvas.clientHeight || 930;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(10, width / height, 1, 20);
    const halfFovRad = ((10 / 2) * Math.PI) / 180;
    const cameraDistance = (HAND_CONFIG.viewHeight / 2) / Math.tan(halfFovRad);
    camera.position.set(0, 0, cameraDistance);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);

    const outerGroup = new THREE.Group();
    const poseGroup = new THREE.Group();
    outerGroup.add(poseGroup);
    scene.add(outerGroup);

    // Light direction from exact config: (1, -1, 0.53)
    const lightDir = new THREE.Vector3(
      HAND_CONFIG.shading.light.x,
      HAND_CONFIG.shading.light.y,
      HAND_CONFIG.shading.light.z
    ).normalize();

    // Cel shading toon materials
    const createCelMaterial = (baseHex: number, shadowHex: number) => {
      return new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(mat3(modelMatrix) * normal);
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
          uLightDir: { value: lightDir },
          uStep: { value: HAND_CONFIG.shading.step },
        },
      });
    };

    const whiteMat = createCelMaterial(0xf5f3ee, 0xd8d4c9);
    const tealMat = createCelMaterial(0x299093, 0x1b696b);
    const redMat = createCelMaterial(0xef6156, 0xb8443b);

    const outlineUniforms = {
      uWidth: { value: width < 768 ? 1.8 : 3.0 },
      uResolution: { value: new THREE.Vector2(width, height) },
    };

    const outlineMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uWidth;
        uniform vec2 uResolution;
        void main() {
          vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vec3 clipNormal = mat3(projectionMatrix) * (mat3(modelViewMatrix) * normal);
          vec2 offset = normalize(clipNormal.xy) * (uWidth / uResolution) * clipPos.w * 2.0;
          clipPos.xy += offset;
          gl_Position = clipPos;
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(0.024, 0.102, 0.118, 1.0); // #061a1e
        }
      `,
      uniforms: outlineUniforms,
      side: THREE.BackSide,
      depthTest: true,
      depthWrite: true,
    });

    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x061a1e,
      linewidth: 1.5,
    });

    let mixer: THREE.AnimationMixer | null = null;
    let handModel: THREE.Group | null = null;
    let isDisposed = false;

    MeshoptDecoder.ready.then(() => {
      if (isDisposed) return;

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      loader.load(
        HAND_CONFIG.url,
        (gltf) => {
          if (isDisposed) return;
          handModel = gltf.scene;

          // Process meshes and apply toon + outline materials
          const meshList: THREE.Mesh[] = [];
          handModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              meshList.push(child as THREE.Mesh);
            }
          });

          for (const mesh of meshList) {
            const matName = ((mesh.material as THREE.Material)?.name || "").toLowerCase();

            if (matName.includes("blue")) {
              mesh.material = tealMat;
            } else if (matName.includes("red")) {
              mesh.material = redMat;
            } else {
              mesh.material = whiteMat;
            }

            if (mesh.geometry) {
              const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);
              mesh.add(outlineMesh);

              // Only sharp mechanical crease lines (angle > 50 deg) to keep cylinders smooth
              const edgesGeom = new THREE.EdgesGeometry(mesh.geometry, 50);
              const edgesMesh = new THREE.LineSegments(edgesGeom, edgesMat);
              mesh.add(edgesMesh);
            }
          }

          // Initial model orientation
          handModel.rotation.y = HAND_CONFIG.pose.flip;

          // Animations
          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(handModel);
            const action = mixer.clipAction(gltf.animations[0]);
            action.reset().play();
          }

          poseGroup.add(handModel);
          setLoaded(true);
        },
        undefined,
        (err) => {
          console.error("Error loading /models/hand.glb:", err);
        }
      );
    });

    // Positioning and transform state
    let targetDrift = 0;
    let targetExtend = 0;
    let currentDrift = 0;
    let currentExtend = 0;

    let isPointerInside = false;
    let targetYaw = 0;
    let targetPitch = 0;
    let currentYaw = 0;
    let currentPitch = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inX = e.clientX >= rect.left && e.clientX <= rect.right;
      const inY = e.clientY >= rect.top && e.clientY <= rect.bottom;
      isPointerInside = inX && inY;

      if (isPointerInside) {
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        targetYaw = nx * HAND_CONFIG.pointer.yaw;
        targetPitch = ny * HAND_CONFIG.pointer.pitch;
      } else {
        targetYaw = 0;
        targetPitch = 0;
      }
    };

    const handlePointerLeave = () => {
      isPointerInside = false;
      targetYaw = 0;
      targetPitch = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave, { passive: true });

    // Scroll tracking: authentic ["start end", "end start"] mapping
    const handleScroll = () => {
      const rect = canvas.getBoundingClientRect();
      const winH = window.innerHeight;
      const progress = THREE.MathUtils.clamp((winH - rect.top) / (winH + rect.height), 0, 1);
      targetDrift = -progress * HAND_CONFIG.scroll.drift;
      targetExtend = -progress * HAND_CONFIG.scroll.extend;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.clientWidth || 900;
      height = canvas.clientHeight || 930;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      outlineUniforms.uResolution.value.set(width, height);
      outlineUniforms.uWidth.value = width < 768 ? 1.5 : 3.0;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Animation Loop
    let animId: number;
    let prevTime = performance.now();

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      const dt = Math.min((time - prevTime) / 1000, 0.1);
      prevTime = time;

      if (mixer) {
        mixer.update(dt);
      }

      // Smooth pointer parallax damping
      currentYaw = THREE.MathUtils.damp(currentYaw, isPointerInside ? targetYaw : 0, HAND_CONFIG.pointer.ease, dt);
      currentPitch = THREE.MathUtils.damp(currentPitch, isPointerInside ? targetPitch : 0, HAND_CONFIG.pointer.ease, dt);

      // Smooth scroll extension and drift damping
      currentDrift = THREE.MathUtils.damp(currentDrift, targetDrift, HAND_CONFIG.scroll.ease, dt);
      currentExtend = THREE.MathUtils.damp(currentExtend, targetExtend, HAND_CONFIG.scroll.ease, dt);

      const a = 0.5 * HAND_CONFIG.viewHeight;
      const c = a * (width / height);
      const [d, p] = HAND_CONFIG.offset;

      outerGroup.position.set(c, a, 0);
      outerGroup.rotation.y = currentYaw;
      outerGroup.rotation.x = currentPitch;

      poseGroup.position.set(d - c, p + currentDrift - a, 0);
      poseGroup.rotation.set(
        HAND_CONFIG.pose.x,
        HAND_CONFIG.pose.y,
        HAND_CONFIG.pose.z
      );

      if (handModel) {
        handModel.position.set(0, currentExtend, 0);
        handModel.rotation.y = HAND_CONFIG.pose.flip;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full transition-opacity duration-700 ease-out ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ display: "block" }}
      />
    </div>
  );
}
