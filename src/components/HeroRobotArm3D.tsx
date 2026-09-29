"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

// 3D Arm configuration
const CONFIG = {
  url: "/models/arm.glb",
  pivot: { x: 0.008, y: 0.371, z: 0.13 },
  camera: {
    fieldOfView: 8.5,
    viewHeight: 0.45,
    fitAspectRatio: 16 / 9,
    fitStrength: 0.15,
  },
  tracks: {
    tabletPlus: {
      moveX: { start: 0.085, startAt: 0, middle: 0.03, middleAt: 0.5, end: 0, endAt: 1 },
      moveY: { start: -0.02, startAt: 0, middle: -0.04, middleAt: 0.5, end: 0.12, endAt: 1 },
      twist: { start: -1.51, startAt: 0, middle: -0.21, middleAt: 0.5, end: 1.08, endAt: 1 },
      tip: { start: 0, startAt: 0, middle: 0, middleAt: 0.5, end: 0.56, endAt: 1 },
      zoom: { start: 0.68, startAt: 0, middle: 0.72, middleAt: 0.5, end: 0.85, endAt: 1 },
    },
    mobile: {
      moveX: { start: 0.03, startAt: 0, middle: 0.02, middleAt: 0.5, end: 0, endAt: 1 },
      moveY: { start: -0.04, startAt: 0, middle: -0.05, middleAt: 0.446, end: -0.02, endAt: 0.946 },
      twist: { start: -1.51, startAt: 0, middle: -0.01, middleAt: 0.5, end: 0.84, endAt: 1 },
      tip: { start: 0, startAt: 0, middle: 0, middleAt: 0.5, end: -0.01, endAt: 1 },
      zoom: { start: 0.76, startAt: 0, middle: 0.72, middleAt: 0.5, end: 0.84, endAt: 1 },
    },
  },
  pointer: { yaw: 0.235, pitch: 0.145, ease: 4 },
  ease: 6,
};

function evaluateTrack(
  progress: number,
  track: { start: number; startAt: number; middle: number; middleAt: number; end: number; endAt: number }
) {
  const u = THREE.MathUtils.clamp(progress, track.startAt, track.endAt);
  return u < track.middleAt
    ? THREE.MathUtils.mapLinear(u, track.startAt, track.middleAt, track.start, track.middle)
    : THREE.MathUtils.mapLinear(u, track.middleAt, track.endAt, track.middle, track.end);
}

export default function HeroRobotArm3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.clientWidth || window.innerWidth;
    let height = canvas.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(CONFIG.camera.fieldOfView, width / height, 0.1, 100);

    const calcCameraDistance = (w: number, h: number) => {
      const aspect = w / h;
      const vh = CONFIG.camera.viewHeight;
      const fitAspect = CONFIG.camera.fitAspectRatio;
      const fitMultiplier = 1 + CONFIG.camera.fitStrength * Math.max(0, fitAspect / aspect - 1);
      const targetHeight = vh * fitMultiplier;
      const halfFovRad = ((CONFIG.camera.fieldOfView / 2) * Math.PI) / 180;
      return targetHeight / 2 / Math.tan(halfFovRad);
    };

    camera.position.set(0, 0, calcCameraDistance(width, height));

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

    const outlineUniforms = {
      uWidth: { value: width < 768 ? 2.5 : 4.0 },
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

    const lightDir = new THREE.Vector3(-0.48, -0.29, 0.45).normalize();

    const createCelMaterial = (baseColorHex: number, shadowColorHex: number) => {
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
          uBaseColor: { value: new THREE.Color(baseColorHex) },
          uShadowColor: { value: new THREE.Color(shadowColorHex) },
          uLightDir: { value: lightDir },
          uStep: { value: 0.13 },
        },
      });
    };

    const whiteMat = createCelMaterial(0xffffff, 0xc7c4bb);
    const tealMat = createCelMaterial(0x299093, 0x1d6a6c);
    const redMat = createCelMaterial(0xef6156, 0xb8443b);
    const greyMat = createCelMaterial(0xc5c2b9, 0xa19e95);

    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x061a1e,
      linewidth: 1.5,
    });

    let isDisposed = false;

    MeshoptDecoder.ready.then(() => {
      if (isDisposed) return;

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      loader.load(
        CONFIG.url,
        (gltf) => {
          if (isDisposed) return;
          const model = gltf.scene;

          model.position.set(-CONFIG.pivot.x, CONFIG.pivot.y, -CONFIG.pivot.z);
          // Scale cross-section radially (X and Z) to make the arm noticeably thicker and bulkier
          model.scale.set(1.22, 1.0, 1.22);

          const meshList: THREE.Mesh[] = [];
          model.traverse((child) => {
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
            } else if (matName.includes("grey_shadow")) {
              mesh.material = greyMat;
            } else {
              mesh.material = whiteMat;
            }

            if (mesh.geometry) {
              // 1. Screen-space outer outline
              const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);
              mesh.add(outlineMesh);

              // 2. Interior mechanical edge lines
              const edgesGeom = new THREE.EdgesGeometry(mesh.geometry, 26);
              const edgesMesh = new THREE.LineSegments(edgesGeom, edgesMat);
              mesh.add(edgesMesh);
            }
          }

          poseGroup.add(model);
          setLoaded(true);
        },
        undefined,
        (err) => {
          console.error("Error loading /models/arm.glb:", err);
        }
      );
    });

    let targetPointerX = 0;
    let targetPointerY = 0;
    let currentPointerX = 0;
    let currentPointerY = 0;
    let scrollProgress = 0;
    let currentProgress = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        targetPointerX = (x - 0.5) * 2;
        targetPointerY = -(y - 0.5) * 2;
      } else {
        targetPointerX = 0;
        targetPointerY = 0;
      }
    };

    const handleScroll = () => {
      const container = canvas.parentElement;
      const maxScroll = container ? container.offsetHeight : 2200;
      const p = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      scrollProgress = p;
    };

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      camera.aspect = width / height;
      camera.position.z = calcCameraDistance(width, height);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      outlineUniforms.uResolution.value.set(width, height);
      outlineUniforms.uWidth.value = width < 768 ? 2.5 : 4.0;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    handleScroll();

    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const isMobile = width < 768;
      const tracks = isMobile ? CONFIG.tracks.mobile : CONFIG.tracks.tabletPlus;

      currentProgress = THREE.MathUtils.damp(currentProgress, scrollProgress, CONFIG.ease, dt);
      currentPointerX = THREE.MathUtils.damp(currentPointerX, targetPointerX, CONFIG.pointer.ease, dt);
      currentPointerY = THREE.MathUtils.damp(currentPointerY, targetPointerY, CONFIG.pointer.ease, dt);

      const posX = evaluateTrack(currentProgress, tracks.moveX);
      const posY = evaluateTrack(currentProgress, tracks.moveY);
      const twist = evaluateTrack(currentProgress, tracks.twist);
      const tip = evaluateTrack(currentProgress, tracks.tip);
      const zoom = evaluateTrack(currentProgress, tracks.zoom);

      poseGroup.position.set(posX, posY, 0);
      poseGroup.rotation.x = tip;
      poseGroup.rotation.y = twist;
      poseGroup.scale.setScalar(zoom);

      outerGroup.rotation.y = currentPointerX * CONFIG.pointer.yaw;
      outerGroup.rotation.x = currentPointerY * CONFIG.pointer.pitch;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 size-full pointer-events-none z-10 transition-opacity duration-700 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    />
  );
}
