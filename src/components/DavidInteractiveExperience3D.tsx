"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface DavidInteractiveExperience3DProps {
  heroOut: number; // 0 (Hero active) -> 1 (Hero fully scrolled out)
  scanProgress: number; // 0 (Scan at feet 000) -> 1 (Scan at head 100)
  aboutOut: number; // 0 (About active) -> 1 (About exiting into Projects)
  className?: string;
  onLoaded?: () => void;
  onProjectPoints?: (points: {
    details: { x: number; y: number };
    desc: { x: number; y: number };
    services: { x: number; y: number };
  }) => void;
}

export default function DavidInteractiveExperience3D({
  heroOut,
  scanProgress,
  aboutOut,
  className = "",
  onLoaded,
  onProjectPoints,
}: DavidInteractiveExperience3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Keep target progress in refs for 60fps animation loop
  const targetsRef = useRef({ heroOut, scanProgress, aboutOut });
  targetsRef.current = { heroOut, scanProgress, aboutOut };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let animationFrameId: number;

    const isLandscape = () =>
      typeof window !== "undefined"
        ? window.innerWidth / window.innerHeight >= 1
        : true;

    const width = container.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 1280);
    const height = container.clientHeight || (typeof window !== "undefined" ? window.innerHeight : 720);

    // 1. Scene & Perspective Camera (38° FOV authentic to david-hckh.com)
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      38,
      width / height,
      0.01,
      100
    );

    const cameraGroup = new THREE.Group();
    scene.add(cameraGroup);
    cameraGroup.add(camera);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0xe8e5e0, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // 3. Asset Loaders & Textures
    const textureLoader = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();

    const roomTexture = textureLoader.load("/models/room-texture.webp");
    roomTexture.flipY = false;
    roomTexture.colorSpace = THREE.SRGBColorSpace;

    const desktopsTexture = textureLoader.load("/models/desktops.webp");
    desktopsTexture.flipY = false;
    desktopsTexture.colorSpace = THREE.SRGBColorSpace;

    const roomShadowTexture = textureLoader.load("/models/room-shadow.webp");
    roomShadowTexture.flipY = false;

    const faceTexture = textureLoader.load("/models/face-texture.png");
    faceTexture.generateMipmaps = false;
    faceTexture.colorSpace = THREE.SRGBColorSpace;

    const headTexture = textureLoader.load("/models/head-texture.webp");
    headTexture.flipY = false;
    headTexture.generateMipmaps = false;
    headTexture.colorSpace = THREE.SRGBColorSpace;

    const matcapBlack = textureLoader.load("/models/matcap-black.webp");
    matcapBlack.colorSpace = THREE.SRGBColorSpace;
    const matcapGray = textureLoader.load("/models/matcap-gray.webp");
    matcapGray.colorSpace = THREE.SRGBColorSpace;
    const matcapSkin = textureLoader.load("/models/matcap-skin.webp");
    matcapSkin.colorSpace = THREE.SRGBColorSpace;
    const matcapWhite = textureLoader.load("/models/matcap-white.webp");
    matcapWhite.colorSpace = THREE.SRGBColorSpace;

    const diffuseMap = textureLoader.load("/models/diffuse-map.png");
    diffuseMap.colorSpace = THREE.SRGBColorSpace;
    diffuseMap.generateMipmaps = false;
    diffuseMap.flipY = false;

    const hologramPlaneTex = textureLoader.load("/models/hologram-plane-texture.webp");
    hologramPlaneTex.colorSpace = THREE.SRGBColorSpace;
    hologramPlaneTex.generateMipmaps = false;
    hologramPlaneTex.flipY = false;

    const numbersBitmapTex = textureLoader.load("/models/numbers-bitmap.webp");
    numbersBitmapTex.generateMipmaps = false;

    // 4. David Heckhoff Spherical Curved Dome Grid (tz vertex + nz fragment shader)
    const gridPlaneGeom = new THREE.PlaneGeometry(18, 18, 24, 24);
    gridPlaneGeom.rotateX(-Math.PI / 2);

    const gridVertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;

      #define CURVE 0.04

      void main() {
        vUv = uv;
        vNormal = normal;

        vec3 transformed = position;
        float dist = distance(transformed.xz, vec2(0.0));
        transformed.y += pow(dist, 2.0) * CURVE;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `;

    const gridFragmentShader = `
      varying vec2 vUv;
      varying vec3 vNormal;

      uniform vec3 uColor;
      uniform vec3 uLineColor;
      uniform float uOpacity;
      uniform float uTime;
      uniform float uProgress;

      #define CELLS 18.0
      #define LINE_WIDTH 0.012
      #define FOG_START 0.25
      #define SHADOW_COLOR vec3(0.0, 0.0, 0.075)

      void main() {
        vec2 coord = vUv * CELLS;
        coord.y += uTime * 0.25;
        vec2 grid = abs(fract(coord) - 0.5);

        float lineX = smoothstep(0.0, 0.5, grid.x);
        float lineY = smoothstep(0.0, 0.5, grid.y);
        float dots = lineX * lineY;
        dots = smoothstep(LINE_WIDTH - 0.005, LINE_WIDTH, 1.0 - dots);
        dots = 1.0 - dots;

        float halfLineWidth = LINE_WIDTH * 0.5;
        float lines = max(lineX, lineY);
        lines = smoothstep(halfLineWidth - 0.005, halfLineWidth, 1.0 - lines);
        lines = 1.0 - lines;
        lines *= 0.15;

        float pattern = max(dots, lines);
        
        float distToCenter = distance(vUv, vec2(0.5));
        float fadeProgress = mix(0.28, 0.52, uProgress);
        float alpha = 1.0 - smoothstep(FOG_START * 0.5, fadeProgress, distToCenter);

        vec2 center = vec2(0.5);
        float centerDist = distance(vUv, center);
        float centerAlpha = smoothstep(0.08, 0.055, centerDist) * 0.45;

        vec3 finalColor = mix(uColor, uLineColor, pattern);
        finalColor = mix(finalColor, SHADOW_COLOR, centerAlpha);

        gl_FragColor = vec4(finalColor, alpha * uOpacity);
      }
    `;

    const gridUniforms = {
      uColor: { value: new THREE.Color("#0157A0") },
      uLineColor: { value: new THREE.Color("#34BCFD") },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uProgress: { value: 0 },
    };

    const gridMaterial = new THREE.ShaderMaterial({
      vertexShader: gridVertexShader,
      fragmentShader: gridFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      uniforms: gridUniforms,
    });

    const gridMesh = new THREE.Mesh(gridPlaneGeom, gridMaterial);
    gridMesh.position.set(0, -0.4, 6);
    gridMesh.renderOrder = -100;
    scene.add(gridMesh);

    // 5. Interactive Groups & Mesh Handles
    const roomGroup = new THREE.Group();
    const landscapeInit = isLandscape();
    roomGroup.position.set(landscapeInit ? 2 : 0, 0, 0);
    roomGroup.rotation.set(0, landscapeInit ? -2.3 : -2.1, 0);
    scene.add(roomGroup);

    const labGroup = new THREE.Group();
    labGroup.position.set(0, 0, 6);
    scene.add(labGroup);

    let chairMesh: THREE.Mesh | null = null;
    let musicMesh: THREE.Mesh | null = null;
    let baseMusicY = 0;

    let avatarGroup: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let idleAction: THREE.AnimationAction | null = null;
    let tIdleAction: THREE.AnimationAction | null = null;
    let faceUniformFrame: { value: number } | null = null;

    // Scan progress uniform for the hologram beam
    const scanUniform = { value: 0 };
    const timeUniform = { value: 0 };

    // Load Room Model
    gltfLoader.load("/models/room-model.glb", (gltf) => {
      if (isDisposed) return;
      const roomScene = gltf.scene;

      chairMesh = roomScene.children.find((c) => c.name === "chair") as THREE.Mesh;
      musicMesh = roomScene.children.find((c) => c.name === "music") as THREE.Mesh;
      if (musicMesh) baseMusicY = musicMesh.position.y;

      const roomMaterial = new THREE.MeshBasicMaterial({ map: roomTexture });

      roomScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.name === "desktop-plane-0" || mesh.name === "desktop-plane-1") {
            mesh.material = new THREE.MeshBasicMaterial({ map: desktopsTexture });
          } else if (mesh.name === "shadow-catcher") {
            mesh.material = new THREE.ShaderMaterial({
              transparent: true,
              depthWrite: false,
              vertexShader: `
                varying vec2 vUv;
                void main() {
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  vUv = uv;
                }
              `,
              fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D uTexture;
                uniform vec3 uColorShadow;
                void main() {
                  vec4 shadow = texture2D(uTexture, vUv);
                  float shadowAlpha = (1.0 - shadow.r) * 0.38;
                  gl_FragColor = vec4(uColorShadow, shadowAlpha);
                }
              `,
              uniforms: {
                uTexture: { value: roomShadowTexture },
                uColorShadow: { value: new THREE.Color("rgb(190, 168, 142)") },
              },
            });
            mesh.renderOrder = -10;
          } else {
            mesh.material = roomMaterial;
          }
        }
      });

      roomGroup.add(roomScene);
    });

    // 6. Laser Slice Plane (horizontal scanning slice ring, 1:1 David Heckhoff Zd)
    const laserPlaneGeom = new THREE.PlaneGeometry(1.5, 1);
    laserPlaneGeom.rotateX(-Math.PI / 2);
    const laserPlaneMat = new THREE.MeshBasicMaterial({
      map: hologramPlaneTex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const laserPlaneMesh = new THREE.Mesh(laserPlaneGeom, laserPlaneMat);
    laserPlaneMesh.renderOrder = 27;
    labGroup.add(laserPlaneMesh);

    // 7. Dynamic Digital 3-Digit Counter on Front of Pedestal (1:1 David Heckhoff VB)
    const numberGeom = new THREE.PlaneGeometry(1, 1);
    const numUniforms = {
      uTexture: { value: numbersBitmapTex },
      uColor: { value: new THREE.Color("#bae9ff") },
    };
    const numberMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: numUniforms,
      vertexShader: `
        attribute float frame;
        varying vec2 vFrameUv;
        #define TOTAL_COLS 4.0
        #define TOTAL_ROWS 3.0
        #define UV_PADDING 0.01

        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          float column = mod(frame, TOTAL_COLS);
          float row = floor(frame / TOTAL_COLS);
          row = (TOTAL_ROWS - 1.0) - row;
          float frameWidth = 1.0 / TOTAL_COLS;
          float frameHeight = 1.0 / TOTAL_ROWS;
          float frameLeft = column * frameWidth;
          float frameBottom = row * frameHeight;
          vec2 paddedUv = uv * (1.0 - UV_PADDING * 2.0) + UV_PADDING;
          vFrameUv.x = frameLeft + paddedUv.x * frameWidth;
          vFrameUv.y = frameBottom + paddedUv.y * frameHeight;
        }
      `,
      fragmentShader: `
        varying vec2 vFrameUv;
        uniform sampler2D uTexture;
        uniform vec3 uColor;
        void main() {
          vec4 tex = texture2D(uTexture, vFrameUv);
          gl_FragColor = vec4(tex.rgb * uColor, tex.a);
        }
      `,
    });

    const numberMesh = new THREE.InstancedMesh(numberGeom, numberMat, 3);
    const frameArray = new Float32Array(3);
    const frameAttribute = new THREE.InstancedBufferAttribute(frameArray, 1);
    numberGeom.setAttribute("frame", frameAttribute);

    const digitMatrix = new THREE.Matrix4();
    for (let i = 0; i < 3; i++) {
      const xOffset = (i - 1) * 0.92;
      digitMatrix.makeTranslation(xOffset, 0, 0);
      numberMesh.setMatrixAt(i, digitMatrix);
    }
    numberMesh.instanceMatrix.needsUpdate = true;
    numberMesh.scale.set(0.17, 0.17, 0.17);
    numberMesh.position.set(0, -0.23, 1.07);
    numberMesh.renderOrder = 22;
    labGroup.add(numberMesh);

    const updateDigitDisplay = (val: number) => {
      const str = Math.min(100, Math.max(0, Math.floor(val))).toString().padStart(3, "0");
      for (let i = 0; i < 3; i++) {
        frameAttribute.setX(i, parseInt(str[i], 10));
      }
      frameAttribute.needsUpdate = true;
    };
    updateDigitDisplay(0);

    // 8. Load Lab Pedestal Model with Authentic Shaders (TA, SA, IA)
    const baseProgressUniform = { value: 0 };
    const coneProgressUniform = { value: 0 };

    const baseUniforms = {
      uDiffuseMap: { value: diffuseMap },
      uProgress: baseProgressUniform,
    };

    const baseMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: baseUniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vPosition = position;
          vUv = uv;
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform sampler2D uDiffuseMap;
        uniform float uProgress;

        #define COLOR_CYAN vec3(0.27, 1.0, 1.0)
        #define SHADOW_START -0.4
        #define SHADOW_END 0.0
        #define SHADOW_COLOR vec3(0.0, 0.0, 0.1)
        #define SHADOW_OPACITY 0.5
        #define RADIUS 2.11
        #define INNER_RADIUS 0.435
        #define OUTER_RADIUS 0.455
        #define RING_WIDTH 0.005
        #define RIGHT_BLOOM_WIDTH 0.045

        void main() {
          vec4 diffuse = texture2D(uDiffuseMap, vUv);
          float dist = length(vPosition.xz) / RADIUS;
          float ring = smoothstep(INNER_RADIUS, INNER_RADIUS + RING_WIDTH, dist) * 
                       smoothstep(OUTER_RADIUS + RING_WIDTH, OUTER_RADIUS, dist);
          float ringBloom = smoothstep(INNER_RADIUS, INNER_RADIUS + RIGHT_BLOOM_WIDTH, dist) *
                       smoothstep(OUTER_RADIUS + RIGHT_BLOOM_WIDTH, OUTER_RADIUS, dist);
          ring += ringBloom * 0.5;
          float centerCircle = smoothstep(0.4, 0.1, dist);
          ring += centerCircle * 0.5;
          ring = min(1.0, ring);
          float shadow = smoothstep(SHADOW_END, SHADOW_START, vPosition.y);
          vec3 color = mix(diffuse.rgb, COLOR_CYAN, ring * (0.1 + 0.9 * uProgress));
          color = mix(color, SHADOW_COLOR, shadow * SHADOW_OPACITY);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const lightConeMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: timeUniform,
        uProgress: coneProgressUniform,
      },
      vertexShader: `
        varying float vLightY;
        varying float vWave;
        uniform float uTime;
        uniform float uProgress;

        void main() {
          vec3 transformed = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
          float waveX = sin(position.x * 10.0 + uTime * 2.0);
          float waveZ = sin(position.z * 10.0 + uTime * 2.5);
          float wave = (waveX + waveZ) * 0.5 * 0.2;
          vWave = wave * -1.0;
          vLightY = position.y * (2.0 - uProgress) * 0.5 - wave;
        }
      `,
      fragmentShader: `
        varying float vLightY;
        varying float vWave;
        uniform float uProgress;
        #define COLOR vec3(0.1, 0.808, 1.0)

        void main() {
          float waveOpacity = 1.0 - smoothstep(0.0, 0.25, vWave);
          gl_FragColor = vec4(COLOR, (1.0 - vLightY) * 0.3 * waveOpacity * uProgress);
        }
      `,
    });

    const electricMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: timeUniform,
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vUv = uv;
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform float uOpacity;

        #define LINE_WIDTH 0.05
        #define WAVE_COUNT 50.0
        #define PI 3.14159265359
        #define MIN_LINE_STRENGTH 0.1
        #define LINE_STRENGTH_SPEED 6.0
        #define COLOR vec3(0.3, 1.0, 1.0)

        void main() {
          float baseStrength1 = smoothstep(LINE_WIDTH, 0.0, abs(vUv.y - 0.25));
          float baseStrength2 = smoothstep(LINE_WIDTH, 0.0, abs(vUv.y - 0.5));
          float baseStrength3 = smoothstep(LINE_WIDTH, 0.0, abs(vUv.y - 0.75));

          float strengthPattern1 = sin(vUv.x * WAVE_COUNT * 0.5 + uTime * LINE_STRENGTH_SPEED) * 0.5 + 0.5;
          float strengthPattern2 = sin(vUv.x * WAVE_COUNT * 0.5 + uTime * LINE_STRENGTH_SPEED + PI * 0.33) * 0.5 + 0.5;
          float strengthPattern3 = sin(vUv.x * WAVE_COUNT * 0.5 + uTime * LINE_STRENGTH_SPEED + PI * 0.66) * 0.5 + 0.5;

          strengthPattern1 = smoothstep(0.0, 0.5, strengthPattern1);
          strengthPattern2 = smoothstep(0.0, 0.5, strengthPattern2);
          strengthPattern3 = smoothstep(0.0, 0.5, strengthPattern3);

          float animatedPart1 = (1.0 - MIN_LINE_STRENGTH) * strengthPattern1;
          float animatedPart2 = (1.0 - MIN_LINE_STRENGTH) * strengthPattern2;
          float animatedPart3 = (1.0 - MIN_LINE_STRENGTH) * strengthPattern3;

          float multiplier1 = MIN_LINE_STRENGTH + animatedPart1 * uOpacity;
          float multiplier2 = MIN_LINE_STRENGTH + animatedPart2 * uOpacity;
          float multiplier3 = MIN_LINE_STRENGTH + animatedPart3 * uOpacity;

          float strength = baseStrength1 * multiplier1 + baseStrength2 * multiplier2 + baseStrength3 * multiplier3;
          gl_FragColor = vec4(COLOR, strength);
        }
      `,
    });

    gltfLoader.load("/models/lab-model.glb", (gltf) => {
      if (isDisposed) return;
      const labScene = gltf.scene;

      labScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.name === "base" || mesh.name === "display") {
            mesh.material = baseMaterial;
            mesh.renderOrder = mesh.name === "base" ? 20 : 21;
          } else if (mesh.name === "electric") {
            mesh.material = electricMaterial;
            mesh.renderOrder = 25;
          } else if (mesh.name === "shine") {
            mesh.material = lightConeMaterial;
            mesh.renderOrder = 30;
          }
        }
      });

      labGroup.add(labScene);
    });

    // 9. Floating Particle Field (David Heckhoff CA/RB points generator)
    const particleCount = 45;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pAngles = new Float32Array(particleCount);
    const pRadii = new Float32Array(particleCount);
    const pSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.2 + Math.random() * 0.75;
      pAngles[i] = angle;
      pRadii[i] = radius;
      pSpeeds[i] = 0.4 + Math.random() * 0.6;
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = Math.random() * 3.5;
      pPos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    pGeom.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeom.setAttribute("angle", new THREE.BufferAttribute(pAngles, 1));
    pGeom.setAttribute("radius", new THREE.BufferAttribute(pRadii, 1));
    pGeom.setAttribute("speed", new THREE.BufferAttribute(pSpeeds, 1));

    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: timeUniform,
        uProgress: scanUniform,
      },
      vertexShader: `
        attribute float angle;
        attribute float radius;
        attribute float speed;
        uniform float uTime;
        uniform float uProgress;
        varying float vAlpha;

        void main() {
          vec3 pos = position;
          pos.y = mod(pos.y + uTime * speed * 0.4, 3.5);
          float curAngle = angle + uTime * 0.3;
          pos.x = cos(curAngle) * radius;
          pos.z = sin(curAngle) * radius;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (14.0 / -mvPosition.z) * (0.8 + 0.5 * sin(uTime * 2.0 + angle));
          gl_Position = projectionMatrix * mvPosition;

          float fadeBottom = smoothstep(0.0, 0.4, pos.y);
          float fadeTop = 1.0 - smoothstep(2.5, 3.5, pos.y);
          vAlpha = fadeBottom * fadeTop * uProgress * 0.75;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          float strength = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(vec3(0.0, 0.92, 1.0), strength * vAlpha);
        }
      `,
    });

    const particles = new THREE.Points(pGeom, particleMaterial);
    particles.renderOrder = 22;
    labGroup.add(particles);

    // 10. Hologram Skinned Shaders (David Heckhoff m4 and g4)
    const hologramVertexShader = `
      #include <skinning_pars_vertex>
      varying float vModelProgress;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      uniform float uTime;
      uniform float uProgress;

      float getModelProgress(vec3 position) {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        return (worldPosition.y + 0.2) / 4.7;
      }

      void main() {
        #include <skinbase_vertex>
        #include <begin_vertex>
        #include <skinning_vertex>
        #include <project_vertex>

        vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);

        vec4 skinnedNormal = vec4(0.0);
        skinnedNormal += boneMatX * vec4(normal, 0.0) * skinWeight.x;
        skinnedNormal += boneMatY * vec4(normal, 0.0) * skinWeight.y;
        skinnedNormal += boneMatZ * vec4(normal, 0.0) * skinWeight.z;
        skinnedNormal += boneMatW * vec4(normal, 0.0) * skinWeight.w;
        vNormal = skinnedNormal.xyz;

        vWorldPos = worldPosition.xyz;
        vModelProgress = getModelProgress(transformed);
      }
    `;

    const hologramFragmentShader = `
      varying float vModelProgress;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      uniform float uProgress;
      uniform vec3 uColor;
      uniform float uTime;

      #define SMOOTH_WIDTH 0.002
      #define LINE_WIDTH 0.003
      #define FADE_WIDTH 0.02

      float getProgress() {
        float s = smoothstep(uProgress, uProgress + SMOOTH_WIDTH, vModelProgress);
        return mix(s, 1.0, step(uProgress, 0.0));
      }

      void main() {
        if (uProgress <= 0.0) discard;

        vec3 normal = normalize(vNormal);
        if (!gl_FrontFacing) normal *= -1.0;

        float progress = 1.0 - getProgress();
        if (progress <= 0.001) discard;

        // Scanning horizontal wireframe stripes
        float stripes = mod((vWorldPos.y - uTime * 0.1) * 25.0, 1.0);
        stripes = pow(stripes, 3.0);

        vec3 viewDir = normalize(cameraPosition - vWorldPos);

        float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 2.0);
        float falloff = smoothstep(0.8, 0.4, fresnel);

        float holographic = stripes * fresnel;
        holographic += fresnel;
        holographic += stripes * 0.05;
        holographic *= falloff;

        float dist = abs(vModelProgress - uProgress);
        float lineStrength = 1.0 - smoothstep(LINE_WIDTH - FADE_WIDTH, LINE_WIDTH + FADE_WIDTH, dist);

        holographic += lineStrength * 2.0;

        if (!gl_FrontFacing) holographic *= 0.4;

        gl_FragColor = vec4(uColor, clamp(holographic * progress, 0.0, 1.0));
      }
    `;

    const holoMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: hologramVertexShader,
      fragmentShader: hologramFragmentShader,
      uniforms: {
        uProgress: scanUniform,
        uTime: timeUniform,
        uColor: { value: new THREE.Color("rgb(0, 234, 255)") },
      },
    });

    // 11. Load Avatar Model (Solid Skinned Meshes + Hologram Clones)
    gltfLoader.load("/models/avatar-model.glb", (gltf) => {
      if (isDisposed) return;

      avatarGroup = gltf.scene;

      const brain = avatarGroup.getObjectByName("brain");
      if (brain) brain.visible = false;

      const landscape = isLandscape();
      const baseRoomX = landscape ? 2 : 0;
      const startYaw = landscape ? -2.3 : -2.1;
      const startAvatarYaw = startYaw + Math.PI / 2;
      avatarGroup.position.set(baseRoomX, 0, 0);
      avatarGroup.rotation.set(0, startAvatarYaw, 0);

      scene.add(avatarGroup);

      // A. Solid Skinned Mesh onBeforeCompile (clipping away where scanned)
      const applySolidScanShader = (mat: THREE.Material) => {
        mat.transparent = true;
        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uScan = scanUniform;
          shader.vertexShader = `
            varying float vModelProgress;
            float getModelProgress(vec3 position) {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              return (worldPosition.y + 0.2) / 4.7;
            }
            ${shader.vertexShader}
          `.replace(
            `#include <project_vertex>`,
            `#include <project_vertex>
             vModelProgress = getModelProgress(transformed);
            `
          );
          shader.fragmentShader = `
            uniform float uScan;
            varying float vModelProgress;
            #define SMOOTH_WIDTH 0.002
            float getProgress() {
              float s = smoothstep(uScan, uScan + SMOOTH_WIDTH, vModelProgress);
              return mix(s, 1.0, step(uScan, 0.0));
            }
            ${shader.fragmentShader}
          `.replace(
            `#include <dithering_fragment>`,
            `#include <dithering_fragment>
             float solidProg = getProgress();
             if (uScan > 0.0 && solidProg <= 0.001) {
               discard;
             }
             gl_FragColor.a *= solidProg;
            `
          );
        };
      };

      const holoEligibleNames = ["black", "gray", "skin", "white", "head"];
      const meshesToCloneForHolo: THREE.SkinnedMesh[] = [];

      avatarGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.SkinnedMesh;
          if (holoEligibleNames.includes(mesh.name)) {
            meshesToCloneForHolo.push(mesh);
          }

          let matcapTex = matcapSkin;
          if (mesh.name === "black") matcapTex = matcapBlack;
          else if (mesh.name === "gray") matcapTex = matcapGray;
          else if (mesh.name === "white") matcapTex = matcapWhite;

          const mat = new THREE.MeshMatcapMaterial({ matcap: matcapTex });
          applySolidScanShader(mat);
          mesh.material = mat;
          mesh.renderOrder = 24;
        }
      });

      // Head hair texture
      const headMesh = avatarGroup.getObjectByName("head") as THREE.SkinnedMesh;
      if (headMesh && headTexture) {
        const headMat = new THREE.MeshMatcapMaterial({
          matcap: matcapWhite,
          map: headTexture,
        });
        applySolidScanShader(headMat);
        headMesh.material = headMat;
      }

      // Blinking face shader with scanline clipping (disappears completely when scanned)
      const faceMesh = avatarGroup.getObjectByName("face") as THREE.SkinnedMesh;
      if (faceMesh) {
        faceUniformFrame = { value: 0 };
        const faceMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          vertexShader: `
            #include <skinning_pars_vertex>
            varying vec2 vUv;
            varying float vModelProgress;
            float getModelProgress(vec3 position) {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              return (worldPosition.y + 0.2) / 4.7;
            }
            void main() {
              #include <skinbase_vertex>
              #include <begin_vertex>
              #include <skinning_vertex>
              #include <project_vertex>
              vUv = uv;
              vModelProgress = getModelProgress(transformed);
            }
          `,
          fragmentShader: `
            varying vec2 vUv;
            varying float vModelProgress;
            uniform sampler2D uTexture;
            uniform float uFrame;
            uniform float uScan;

            #define ROWS 4.0
            #define COLUMNS 4.0
            #define SMOOTH_WIDTH 0.002

            float getProgress() {
              float s = smoothstep(uScan, uScan + SMOOTH_WIDTH, vModelProgress);
              return mix(s, 1.0, step(uScan, 0.0));
            }

            void main() {
              float progress = getProgress();
              if (uScan > 0.0 && progress <= 0.001) {
                discard;
              }

              float column = mod(uFrame, COLUMNS);
              float row = floor(uFrame / COLUMNS);
              row = (ROWS - 1.0) - row;

              vec2 uv = vUv;
              uv.x = (uv.x + column) / COLUMNS;
              uv.y = (uv.y + row) / ROWS;

              vec4 color = texture2D(uTexture, uv);
              gl_FragColor = vec4(color.rgb, color.a * progress);
            }
          `,
          uniforms: {
            uTexture: { value: faceTexture },
            uFrame: faceUniformFrame,
            uScan: scanUniform,
          },
        });
        faceMesh.material = faceMat;
        faceMesh.renderOrder = 25;
      }

      // B. Create Holographic Clones for each body mesh sharing the exact skeleton
      meshesToCloneForHolo.forEach((sourceMesh) => {
        const holoMesh = new THREE.SkinnedMesh(sourceMesh.geometry, holoMaterial);
        holoMesh.bind(sourceMesh.skeleton, sourceMesh.bindMatrix);
        holoMesh.frustumCulled = false;
        holoMesh.renderOrder = 26;
        avatarGroup?.add(holoMesh);
      });

      // Animation Mixer
      mixer = new THREE.AnimationMixer(avatarGroup);

      const idleClip = gltf.animations.find((a) => a.name === "idle");
      if (idleClip) {
        idleAction = mixer.clipAction(idleClip);
        idleAction.setEffectiveWeight(1.0);
        idleAction.play();
      }

      const tIdleClip = gltf.animations.find((a) => a.name === "t-idle");
      if (tIdleClip) {
        tIdleAction = mixer.clipAction(tIdleClip);
        tIdleAction.setEffectiveWeight(0.0);
        tIdleAction.play();
      }

      setLoading(false);
      onLoaded?.();
    });

    // 12. Eye Blinking Loop
    let blinkTimeout: NodeJS.Timeout | null = null;
    const scheduleNextBlink = () => {
      const delay = 2600 + Math.random() * 3200;
      blinkTimeout = setTimeout(() => {
        if (isDisposed || !faceUniformFrame) return;
        faceUniformFrame.value = 1;
        setTimeout(() => {
          if (isDisposed || !faceUniformFrame) return;
          faceUniformFrame.value = 2;
          setTimeout(() => {
            if (isDisposed || !faceUniformFrame) return;
            faceUniformFrame.value = 3;
            setTimeout(() => {
              if (isDisposed || !faceUniformFrame) return;
              faceUniformFrame.value = 0;
              scheduleNextBlink();
            }, 60);
          }, 80);
        }, 60);
      }, delay);
    };
    scheduleNextBlink();

    // 13. Interactive Mouse Parallax
    const mousePos = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX / window.innerWidth - 0.5;
      mousePos.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 14. Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // 15. 60fps Smooth Scrub Render Loop
    let currentHeroOut = targetsRef.current.heroOut;
    let currentScan = targetsRef.current.scanProgress;
    let currentAboutOut = targetsRef.current.aboutOut;
    const clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      timeUniform.value = elapsed;

      // Smooth progress interpolation
      const tHero = Math.max(0, Math.min(1, targetsRef.current.heroOut));
      currentHeroOut += (tHero - currentHeroOut) * 0.28;
      const hOut = currentHeroOut;

      const tScan = Math.max(0, Math.min(1, targetsRef.current.scanProgress));
      currentScan += (tScan - currentScan) * 0.28;
      const sProg = currentScan;

      // Exact David Heckhoff formula:
      // uProgress ranges from -0.1 (safely below shoes at 0%) to 1.0 (top of hair at 100%)
      const uProg = sProg * 1.1 - 0.1;
      scanUniform.value = uProg;
      coneProgressUniform.value = Math.max(0, sProg);
      baseProgressUniform.value = Math.max(0, sProg);

      // Digital counter strictly tracks Math.floor(sProg * 100) (000 to 100)
      const displayCount = Math.min(100, Math.max(0, Math.floor(sProg * 100)));
      updateDigitDisplay(displayCount);

      // Laser Slice Plane Y strictly matches shader progress:
      // (worldPosition.y + 0.2) / 4.7 == uProg <=> worldPosition.y = -0.2 + uProg * 4.7
      const laserY = -0.2 + uProg * 4.7;
      laserPlaneMesh.position.set(0, laserY + 0.01, 0);

      let planeOpacity = 0;
      if (uProg <= 0.01) planeOpacity = 0;
      else if (uProg <= 0.1) planeOpacity = (uProg - 0.01) / 0.09;
      else if (uProg <= 0.85) planeOpacity = 1;
      else if (uProg <= 0.98) planeOpacity = 1 - (uProg - 0.85) / 0.13;
      else planeOpacity = 0;

      let planeScale = 1;
      if (sProg <= 0.5) planeScale = 1 + (sProg / 0.5) * 0.5;
      else planeScale = 1.5 - ((sProg - 0.5) / 0.5) * 0.5;

      laserPlaneMesh.scale.x = planeScale;
      laserPlaneMat.opacity = planeOpacity;
      laserPlaneMesh.visible = planeOpacity > 0 && hOut >= 0.85;

      const tAboutOut = Math.max(0, Math.min(1, targetsRef.current.aboutOut));
      currentAboutOut += (tAboutOut - currentAboutOut) * 0.28;
      const aOut = currentAboutOut;

      if (mixer) {
        mixer.update(delta);
      }

      // Easing curves matching GSAP power1.out (1 - (1 - x)^2)
      const easeHero = 1 - (1 - hOut) * (1 - hOut);

      // Room group transition (desk stays stationary until hOut > 0.08, then flies UP smoothly)
      const landscape = isLandscape();
      const baseRoomX = landscape ? 2 : 0;
      const startYaw = landscape ? -2.3 : -2.1;
      const targetRoomX = landscape ? 4.5 : 0;
      const targetRoomY = landscape ? 5.7 : 5.4;

      const tRoom = hOut < 0.08 ? 0 : (hOut - 0.08) / 0.92;
      const easeRoom = tRoom * tRoom;

      roomGroup.position.set(
        THREE.MathUtils.lerp(baseRoomX, targetRoomX, easeRoom),
        THREE.MathUtils.lerp(0, targetRoomY, easeRoom),
        0
      );
      roomGroup.rotation.set(
        THREE.MathUtils.lerp(0, 0.1, easeRoom),
        startYaw,
        THREE.MathUtils.lerp(0, 0.09, easeRoom)
      );
      const roomScale = THREE.MathUtils.lerp(1, 0.85, easeRoom);
      roomGroup.scale.set(roomScale, roomScale, roomScale);
      roomGroup.visible = hOut < 0.88;

      // Chair swivel on scroll
      if (chairMesh) {
        const chairT = Math.min(1, tRoom / 0.5);
        chairMesh.rotation.set(
          THREE.MathUtils.lerp(0, -0.9, chairT),
          THREE.MathUtils.lerp(0, -1.1, chairT),
          THREE.MathUtils.lerp(0, -1.3, chairT)
        );
      }

      // Floating musical notes effect
      if (musicMesh) {
        musicMesh.position.y = baseMusicY + Math.sin(elapsed * 2.8) * 0.04;
        musicMesh.rotation.z = Math.sin(elapsed * 1.8) * 0.04;
      }

      // Dynamic background color lerp: #e8e5e0 (Hero) -> #001738 (About) -> #e8e5e0 (Projects)
      const heroBgColor = new THREE.Color("#e8e5e0");
      const aboutBgColor = new THREE.Color("#001738");
      const projectsBgColor = new THREE.Color("#e8e5e0");

      const curBg = heroBgColor.clone();
      if (hOut < 1.0) {
        curBg.lerp(aboutBgColor, easeHero);
      } else {
        curBg.lerpColors(aboutBgColor, projectsBgColor, aOut);
      }
      renderer.setClearColor(curBg, 1.0);

      // Avatar transition from desk to pedestal:
      if (avatarGroup) {
        const startAvatarYaw = startYaw + Math.PI / 2;
        const targetAvatarYaw = Math.PI / 2;

        // Smooth crossfade: sitting in chair at desk (hOut < 0.05),
        // standing up smoothly into t-idle as the room starts lifting
        const standT = Math.min(1, Math.max(0, hOut / 0.45));
        const easeStand = 1 - (1 - standT) * (1 - standT);
        if (idleAction && tIdleAction) {
          idleAction.setEffectiveWeight(1.0 - easeStand);
          tIdleAction.setEffectiveWeight(easeStand);
        }

        // Smooth step-forward from desk to pedestal (0, 0, 6)
        const moveT = Math.min(1, Math.max(0, (hOut - 0.08) / 0.92));
        const easeMove = 1 - (1 - moveT) * (1 - moveT);

        avatarGroup.position.set(
          THREE.MathUtils.lerp(baseRoomX, 0, easeMove),
          0,
          THREE.MathUtils.lerp(0, 6, easeMove)
        );
        avatarGroup.rotation.set(
          0,
          THREE.MathUtils.lerp(startAvatarYaw, targetAvatarYaw, easeMove),
          0
        );

        avatarGroup.visible = true;
      }

      // Lab pedestal at (0, 0, 6): only visible once room has lifted away (hOut >= 0.82)
      // This strictly guarantees the light cone NEVER renders under or cuts through the room rug!
      labGroup.position.set(0, 0, 6);
      labGroup.visible = hOut >= 0.82 && aOut < 0.99;

      // Authentic curved dome grid uniforms & visibility
      if (gridMesh) {
        gridMesh.position.set(0, -0.4, 6);
        gridMesh.visible = hOut >= 0.65 && aOut < 0.99;
        gridUniforms.uTime.value = elapsed;
        gridUniforms.uProgress.value = sProg;
        const inGridOpacity = Math.min(1, Math.max(0, (hOut - 0.65) / 0.25));
        gridUniforms.uOpacity.value = (0.2 + 0.8 * inGridOpacity) * (1.0 - aOut);
      }

      // Camera coordinates matching David Heckhoff points:
      // Hero: (0, 6, 10) focus (0, 3, 0)
      // About: (0, 4.5, 15.5) focus (0, 2.2, 6)
      const baseCamY = landscape ? 6 : 8.2;
      const baseCamZ = landscape ? 10 : 16;
      const baseFocusY = landscape ? 3 : 5.2;

      const targetCamY = landscape ? 4.5 : 4.75;
      const targetCamZ = landscape ? 15.5 : 19.5;
      const targetFocusY = landscape ? 2.2 : 0.8;

      const currentCamY = THREE.MathUtils.lerp(baseCamY, targetCamY, easeHero);
      const currentCamZ = THREE.MathUtils.lerp(baseCamZ, targetCamZ, easeHero);
      camera.position.set(0, currentCamY, currentCamZ);

      const currentFocusY = THREE.MathUtils.lerp(baseFocusY, targetFocusY, easeHero);
      const currentFocusZ = THREE.MathUtils.lerp(0, 6, easeHero);
      camera.lookAt(0, currentFocusY, currentFocusZ);

      // Camera parallax shift with mouse cursor
      const targetCamGroupX = mousePos.x * 0.7;
      const targetCamGroupY = -mousePos.y * 0.45;
      cameraGroup.position.x += (targetCamGroupX - cameraGroup.position.x) * 0.06;
      cameraGroup.position.y += (targetCamGroupY - cameraGroup.position.y) * 0.06;

      // Project 3D callout anchor points for HUD cards (David Heckhoff 1:1)
      if (onProjectPoints && hOut > 0.05 && aOut < 0.99) {
        const pDetails = new THREE.Vector3(-0.76, 3.6, 6.75).project(camera);
        const pDesc = new THREE.Vector3(-0.9, 2.0, 6.75).project(camera);
        const pServices = new THREE.Vector3(0.75, 2.75, 6.75).project(camera);

        const w = window.innerWidth;
        const h = window.innerHeight;

        onProjectPoints({
          details: {
            x: (pDetails.x * 0.5 + 0.5) * w,
            y: (-(pDetails.y * 0.5) + 0.5) * h,
          },
          desc: {
            x: (pDesc.x * 0.5 + 0.5) * w,
            y: (-(pDesc.y * 0.5) + 0.5) * h,
          },
          services: {
            x: (pServices.x * 0.5 + 0.5) * w,
            y: (-(pServices.y * 0.5) + 0.5) * h,
          },
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      if (blinkTimeout) clearTimeout(blinkTimeout);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);

      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 size-full pointer-events-none select-none ${className}`}
      style={{ touchAction: "none" }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="size-8 rounded-full border-2 border-[#299093]/30 border-t-[#299093] animate-spin" />
        </div>
      )}
    </div>
  );
}
