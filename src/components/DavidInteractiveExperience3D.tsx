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
}

export default function DavidInteractiveExperience3D({
  heroOut,
  scanProgress,
  aboutOut,
  className = "",
  onLoaded,
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
    renderer.setClearColor(0x011c3d, 1);
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

    // 4. Room Grid Environment for About Mode (Curved Cyan Lines on Floor & Wall)
    const roomCorner = new THREE.Vector3(-16.0, 0.0, -2.0);
    const tileSize = 1.4;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const gridVertexShader = `
      varying vec3 vWorldPos;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const gridFragmentShader = `
      uniform vec3 uBaseColor;
      uniform vec3 uLineColor;
      uniform vec3 uAccentColor;
      uniform float uTileSize;
      uniform float uLineWidth;
      uniform float uPixelRatio;
      uniform vec3 uCorner;
      uniform int uPlaneType;
      uniform float uOpacity;

      varying vec3 vWorldPos;

      void main() {
        vec2 coord;
        float seamDist = 100.0;
        float edgeFade = 1.0;

        if (uPlaneType == 0) {
          coord = vec2(vWorldPos.x - uCorner.x, vWorldPos.z - uCorner.z);
          float distBack = max(0.0, vWorldPos.z - uCorner.z);
          float distLeft = max(0.0, vWorldPos.x - uCorner.x);
          seamDist = min(distBack, distLeft);
          
          float fadeZ = 1.0 - smoothstep(12.0, 26.0, vWorldPos.z);
          float fadeX = 1.0 - smoothstep(14.0, 28.0, vWorldPos.x);
          edgeFade = fadeZ * fadeX;
        } else {
          coord = vec2(vWorldPos.x - uCorner.x, vWorldPos.y - uCorner.y);
          float distFloor = max(0.0, vWorldPos.y - uCorner.y);
          float distLeft = max(0.0, vWorldPos.x - uCorner.x);
          seamDist = min(distFloor, distLeft);

          float fadeY = 1.0 - smoothstep(8.0, 18.0, vWorldPos.y);
          float fadeX = 1.0 - smoothstep(14.0, 28.0, vWorldPos.x);
          edgeFade = fadeY * fadeX;
        }

        vec2 cell = coord / uTileSize;
        vec2 perPixel = max(fwidth(cell), vec2(1e-5));
        float halfW = uLineWidth * 0.5 * uPixelRatio;

        vec2 distToLine = abs(fract(cell - 0.5) - 0.5) / perPixel;
        float lineAlpha = 1.0 - clamp(min(distToLine.x, distToLine.y) / halfW, 0.0, 1.0);

        vec2 majorCell = coord / (uTileSize * 4.0);
        vec2 majorPerPixel = max(fwidth(majorCell), vec2(1e-5));
        vec2 distToMajor = abs(fract(majorCell - 0.5) - 0.5) / majorPerPixel;
        float majorAlpha = 1.0 - clamp(min(distToMajor.x, distToMajor.y) / (halfW * 1.3), 0.0, 1.0);

        vec2 cellFract = abs(fract(cell - 0.5) - 0.5) * uTileSize;
        float dotAlpha = 1.0 - smoothstep(0.018, 0.045, length(cellFract));

        float ao = 1.0 - (1.0 - smoothstep(0.0, 2.5, seamDist)) * 0.15;
        float seamHighlight = (1.0 - smoothstep(0.0, 0.08, seamDist)) * 0.40;

        float minorOpacity = 0.22;
        float majorOpacity = 0.45;
        float combinedLines = clamp(lineAlpha * minorOpacity + majorAlpha * majorOpacity + dotAlpha * 0.45 + seamHighlight, 0.0, 1.0);

        vec3 lineCol = mix(uLineColor, uAccentColor, majorAlpha * 0.7 + dotAlpha * 0.5);
        vec3 baseCol = uBaseColor * ao;

        vec3 finalCol = mix(baseCol, lineCol, combinedLines * edgeFade);

        gl_FragColor = vec4(finalCol, uOpacity);
      }
    `;

    const gridOpacityUniform = { value: 0 };
    const createGridMaterial = (planeType: number) => {
      return new THREE.ShaderMaterial({
        transparent: true,
        vertexShader: gridVertexShader,
        fragmentShader: gridFragmentShader,
        side: THREE.DoubleSide,
        uniforms: {
          uBaseColor: { value: new THREE.Color("#011c3d") },
          uLineColor: { value: new THREE.Color("#00d2ff") },
          uAccentColor: { value: new THREE.Color("#00f0ff") },
          uTileSize: { value: tileSize },
          uLineWidth: { value: 1.25 },
          uPixelRatio: { value: pixelRatio },
          uCorner: { value: roomCorner },
          uPlaneType: { value: planeType },
          uOpacity: gridOpacityUniform,
        },
      });
    };

    const gridGroup = new THREE.Group();
    scene.add(gridGroup);

    const floorGeom = new THREE.PlaneGeometry(44, 38);
    const floorMesh = new THREE.Mesh(floorGeom, createGridMaterial(0));
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(roomCorner.x + 22, roomCorner.y - 0.01, roomCorner.z + 19);
    floorMesh.renderOrder = -20;
    gridGroup.add(floorMesh);

    const backWallGeom = new THREE.PlaneGeometry(44, 24);
    const backWallMesh = new THREE.Mesh(backWallGeom, createGridMaterial(1));
    backWallMesh.position.set(roomCorner.x + 22, roomCorner.y + 12, roomCorner.z);
    backWallMesh.renderOrder = -20;
    gridGroup.add(backWallMesh);

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

    // Dynamic Pedestal Display Canvas ("000" to "100")
    const numCanvas = document.createElement("canvas");
    numCanvas.width = 128;
    numCanvas.height = 64;
    const numCtx = numCanvas.getContext("2d");
    const numTexture = new THREE.CanvasTexture(numCanvas);
    numTexture.generateMipmaps = false;
    numTexture.colorSpace = THREE.SRGBColorSpace;

    const updatePedestalNumber = (count: number) => {
      if (!numCtx) return;
      numCtx.clearRect(0, 0, 128, 64);
      numCtx.fillStyle = "#011c3d";
      numCtx.fillRect(0, 0, 128, 64);
      numCtx.fillStyle = "#00f0ff";
      numCtx.font = "bold 38px monospace";
      numCtx.textAlign = "center";
      numCtx.textBaseline = "middle";
      const str = Math.min(100, Math.max(0, Math.floor(count))).toString().padStart(3, "0");
      numCtx.fillText(str, 64, 32);
      numTexture.needsUpdate = true;
    };
    updatePedestalNumber(0);

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

    // Load Lab Pedestal Model
    gltfLoader.load("/models/lab-model.glb", (gltf) => {
      if (isDisposed) return;
      const labScene = gltf.scene;

      labScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.name === "base") {
            mesh.material = new THREE.MeshBasicMaterial({ color: new THREE.Color("#0c2340") });
            mesh.renderOrder = 20;
          } else if (mesh.name === "display") {
            mesh.material = new THREE.MeshBasicMaterial({ color: new THREE.Color("#00f0ff") });
            mesh.renderOrder = 21;
          } else if (mesh.name === "electric") {
            mesh.material = new THREE.MeshBasicMaterial({
              color: new THREE.Color("#00d2ff"),
              transparent: true,
              opacity: 0.85,
            });
            mesh.renderOrder = 25;
          } else if (mesh.name === "shine") {
            mesh.material = new THREE.MeshBasicMaterial({
              color: new THREE.Color("#00d2ff"),
              transparent: true,
              opacity: 0.08,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            });
            mesh.renderOrder = 10;
          }
        }
      });



      // Number display on pedestal
      const numberGeom = new THREE.PlaneGeometry(0.7, 0.35);
      const numberMat = new THREE.MeshBasicMaterial({
        map: numTexture,
        transparent: true,
      });
      const numberMesh = new THREE.Mesh(numberGeom, numberMat);
      numberMesh.position.set(0, 0.22, 1.15);
      labGroup.add(numberMesh);

      labGroup.add(labScene);
    });

    // 6. Hologram Laser Scanner Shaders (Replicating exact david-hckh.com m4/g4 shaders)
    const hologramVertexShader = `
      #include <skinning_pars_vertex>
      varying float vModelProgress;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

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
        vModelProgress = clamp((worldPosition.y + 0.1) / 3.4, 0.0, 1.0);
      }
    `;

    const hologramFragmentShader = `
      varying float vModelProgress;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      uniform float uProgress;
      uniform vec3 uColor;
      uniform float uTime;

      #define SMOOTH_WIDTH 0.005
      #define LINE_WIDTH 0.009
      #define FADE_WIDTH 0.035

      void main() {
        if (vModelProgress > uProgress + FADE_WIDTH) {
          discard;
        }

        vec3 normal = normalize(vNormal);
        if (!gl_FrontFacing) normal *= -1.0;

        float s = smoothstep(uProgress, uProgress + SMOOTH_WIDTH, vModelProgress);
        float progress = 1.0 - mix(s, 1.0, step(uProgress, 0.0));

        // Scanning horizontal wireframe stripes
        float stripes = mod((vWorldPos.y - uTime * 0.1) * 32.0, 1.0);
        stripes = pow(stripes, 3.0);

        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 2.0);
        float falloff = smoothstep(0.85, 0.35, fresnel);

        float holographic = (stripes * fresnel + fresnel * 0.8 + stripes * 0.15) * falloff;

        // Glowing cyan laser ring at boundary
        float dist = abs(vModelProgress - uProgress);
        float lineStrength = 1.0 - smoothstep(LINE_WIDTH - FADE_WIDTH, LINE_WIDTH + FADE_WIDTH, dist);

        holographic += lineStrength * 2.8;

        if (!gl_FrontFacing) holographic *= 0.4;

        gl_FragColor = vec4(uColor, clamp(holographic * progress, 0.0, 1.0));
      }
    `;

    const hologramMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: hologramVertexShader,
      fragmentShader: hologramFragmentShader,
      uniforms: {
        uProgress: scanUniform,
        uTime: timeUniform,
        uColor: { value: new THREE.Color("#00f0ff") },
      },
    });

    // 7. Load Avatar Model
    gltfLoader.load("/models/avatar-model.glb", (gltf) => {
      if (isDisposed) return;

      avatarGroup = gltf.scene;

      const brain = avatarGroup.getObjectByName("brain");
      if (brain) brain.visible = false;

      const landscape = isLandscape();
      const baseRoomX = landscape ? 2 : 0;
      const startYaw = (landscape ? -2.3 : -2.1) + Math.PI / 2;
      avatarGroup.position.set(baseRoomX, 0, 0);
      avatarGroup.rotation.set(0, startYaw, 0);

      scene.add(avatarGroup);

      // Shared onBeforeCompile modifier that handles BOTH solid matcap AND hologram laser scan
      const applyHologramScanShader = (mat: THREE.Material) => {
        mat.transparent = true;
        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uScan = scanUniform;
          shader.uniforms.uTime = timeUniform;
          shader.vertexShader = `
            varying float vWorldY;
            varying vec3 vWorldPos;
            ${shader.vertexShader}
          `.replace(
            `#include <begin_vertex>`,
            `#include <begin_vertex>
             vec4 wPos = modelMatrix * vec4(transformed, 1.0);
             vWorldY = (wPos.y + 0.1) / 3.4;
             vWorldPos = wPos.xyz;
            `
          );
          shader.fragmentShader = `
            uniform float uScan;
            uniform float uTime;
            varying float vWorldY;
            varying vec3 vWorldPos;
            ${shader.fragmentShader}
          `.replace(
            `#include <dithering_fragment>`,
            `#include <dithering_fragment>
             if (uScan > 0.001 && vWorldY < uScan) {
               // Below laser scan line: Glowing Cyan Hologram
               float distToLine = abs(vWorldY - uScan);
               float laserLine = 1.0 - smoothstep(0.001, 0.02, distToLine);

               // Horizontal scanline stripes
               float stripes = mod((vWorldPos.y - uTime * 0.12) * 44.0, 1.0);
               stripes = smoothstep(0.2, 0.8, stripes);

               vec3 viewDir = normalize(cameraPosition - vWorldPos);
               float fresnel = 0.4;
               #ifdef USE_NORMAL
                 vec3 n = normalize(vNormal);
                 fresnel = pow(1.0 - max(0.0, dot(viewDir, n)), 2.5);
               #endif

               vec3 holoColor = mix(vec3(0.0, 0.75, 1.0), vec3(0.0, 1.0, 0.95), stripes);
               float holoIntensity = stripes * 0.45 + fresnel * 0.55 + laserLine * 2.5;

               gl_FragColor = vec4(holoColor * holoIntensity, 0.85);
             } else if (uScan > 0.001) {
               // Above laser scan line: Solid Matcap with Glowing Cyan Laser Beam at the slice
               float distToLine = abs(vWorldY - uScan);
               if (distToLine < 0.025) {
                 float laserLine = 1.0 - smoothstep(0.0, 0.025, distToLine);
                 gl_FragColor = mix(gl_FragColor, vec4(0.0, 1.0, 1.0, 1.0), laserLine * 0.95);
               }
             }
            `
          );
        };
      };

      // Matcap Materials with unified solid + hologram shader
      avatarGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.SkinnedMesh;
          let matcapTex = matcapSkin;
          if (mesh.name === "black") matcapTex = matcapBlack;
          else if (mesh.name === "gray") matcapTex = matcapGray;
          else if (mesh.name === "white") matcapTex = matcapWhite;

          const mat = new THREE.MeshMatcapMaterial({ matcap: matcapTex });
          applyHologramScanShader(mat);
          mesh.material = mat;
        }
      });

      // Head hair texture with neutral white matcap and unified scanline shader
      const headMesh = avatarGroup.getObjectByName("head") as THREE.SkinnedMesh;
      if (headMesh && headTexture) {
        const headMat = new THREE.MeshMatcapMaterial({
          matcap: matcapWhite,
          map: headTexture,
        });
        applyHologramScanShader(headMat);
        headMesh.material = headMat;
      }

      // Blinking face shader with scanline clipping
      const faceMesh = avatarGroup.getObjectByName("face") as THREE.SkinnedMesh;
      if (faceMesh) {
        faceUniformFrame = { value: 0 };
        const faceMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          vertexShader: `
            #include <skinning_pars_vertex>
            varying vec2 vUv;
            varying float vWorldY;
            void main() {
              #include <skinbase_vertex>
              #include <begin_vertex>
              #include <skinning_vertex>
              #include <project_vertex>
              vUv = uv;
              vec4 wPos = modelMatrix * vec4(transformed, 1.0);
              vWorldY = (wPos.y + 0.1) / 3.4;
            }
          `,
          fragmentShader: `
            varying vec2 vUv;
            varying float vWorldY;
            uniform sampler2D uTexture;
            uniform float uFrame;
            uniform float uScan;

            #define ROWS 4.0
            #define COLUMNS 4.0

            void main() {
              if (uScan > 0.001 && vWorldY < uScan) {
                // If scanned past face, render holographic eye glow or discard
                gl_FragColor = vec4(0.0, 0.9, 1.0, 0.85);
                return;
              }

              float column = mod(uFrame, COLUMNS);
              float row = floor(uFrame / COLUMNS);
              row = (ROWS - 1.0) - row;

              vec2 uv = vUv;
              uv.x = (uv.x + column) / COLUMNS;
              uv.y = (uv.y + row) / ROWS;

              vec4 color = texture2D(uTexture, uv);
              gl_FragColor = color;
            }
          `,
          uniforms: {
            uTexture: { value: faceTexture },
            uFrame: faceUniformFrame,
            uScan: scanUniform,
          },
        });
        faceMesh.material = faceMat;
      }

      // Animation Mixer
      mixer = new THREE.AnimationMixer(avatarGroup);

      const idleClip = gltf.animations.find((a) => a.name === "idle");
      if (idleClip) {
        idleAction = mixer.clipAction(idleClip);
        idleAction.weight = 1.0;
        idleAction.play();
      }

      const tIdleClip = gltf.animations.find((a) => a.name === "t-idle");
      if (tIdleClip) {
        tIdleAction = mixer.clipAction(tIdleClip);
        tIdleAction.weight = 0.0;
        tIdleAction.play();
      }

      setLoading(false);
      onLoaded?.();
    });

    // 8. Natural Eye Blinking Loop
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

    // 9. Interactive Mouse Parallax
    const mousePos = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX / window.innerWidth - 0.5;
      mousePos.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 10. Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // 11. 60fps Smooth Scrub Render Loop
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
      currentHeroOut += (tHero - currentHeroOut) * 0.12;
      const hOut = currentHeroOut;

      const tScan = Math.max(0, Math.min(1, targetsRef.current.scanProgress));
      currentScan += (tScan - currentScan) * 0.12;
      const sProg = currentScan;
      scanUniform.value = sProg;
      updatePedestalNumber(sProg * 100);

      const tAboutOut = Math.max(0, Math.min(1, targetsRef.current.aboutOut));
      currentAboutOut += (tAboutOut - currentAboutOut) * 0.12;
      const aOut = currentAboutOut;

      if (mixer) {
        mixer.update(delta);
      }

      // Easing curves matching GSAP power1.out (1 - (1 - x)^2)
      const easeHero = 1 - (1 - hOut) * (1 - hOut);

      // Room group transition (desk flies UP and swivels away)
      const landscape = isLandscape();
      const baseRoomX = landscape ? 2 : 0;
      const targetRoomX = landscape ? 4.5 : 0;
      const targetRoomY = landscape ? 5.7 : 5.4;

      roomGroup.position.set(
        THREE.MathUtils.lerp(baseRoomX, targetRoomX, easeHero),
        THREE.MathUtils.lerp(0, targetRoomY, easeHero),
        0
      );
      roomGroup.rotation.set(
        THREE.MathUtils.lerp(0, 0.1, easeHero),
        landscape ? -2.3 : -2.1,
        THREE.MathUtils.lerp(0, 0.09, easeHero)
      );
      const roomScale = THREE.MathUtils.lerp(1, 0.85, easeHero);
      roomGroup.scale.set(roomScale, roomScale, roomScale);
      roomGroup.visible = hOut < 0.99;

      // Chair swivel on scroll
      if (chairMesh) {
        const chairT = Math.min(1, easeHero / 0.6);
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

      // Dynamic background color lerp: #f5efe6 (Hero) -> #011c3d (About) -> #f5efe6 (Projects)
      const heroBgColor = new THREE.Color("#f5efe6");
      const aboutBgColor = new THREE.Color("#011c3d");
      const projectsBgColor = new THREE.Color("#f5efe6");

      const curBg = heroBgColor.clone();
      if (hOut < 1.0) {
        curBg.lerp(aboutBgColor, easeHero);
      } else {
        curBg.lerpColors(aboutBgColor, projectsBgColor, aOut);
      }
      renderer.setClearColor(curBg, 1.0);

      // Avatar transition from desk to pedestal
      if (avatarGroup) {
        const startYaw = (landscape ? -2.3 : -2.1) + Math.PI / 2;
        const targetYaw = Math.PI / 2;

        avatarGroup.position.set(
          THREE.MathUtils.lerp(baseRoomX, 0, easeHero),
          0,
          THREE.MathUtils.lerp(0, 6, easeHero)
        );
        avatarGroup.rotation.set(
          0,
          THREE.MathUtils.lerp(startYaw, targetYaw, easeHero),
          0
        );

        // Crossfade animations: idle -> t-idle
        if (idleAction && tIdleAction) {
          const blend = Math.min(1, Math.max(0, easeHero * 1.3));
          idleAction.weight = 1.0 - blend;
          tIdleAction.weight = blend;
        }

        avatarGroup.visible = true;
      }

      // Lab pedestal & Hologram appearance
      labGroup.visible = hOut > 0.05;
      labGroup.position.y = 0;

      // Cyan room grid opacity (active during About, fades out on exit)
      gridGroup.visible = hOut > 0.05;
      const inGridOpacity = Math.min(1, Math.max(0, (hOut - 0.1) * 2.0));
      gridOpacityUniform.value = inGridOpacity * (1.0 - aOut);

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
          <div className="size-8 rounded-full border-2 border-[#fa8207]/30 border-t-[#fa8207] animate-spin" />
        </div>
      )}
    </div>
  );
}
