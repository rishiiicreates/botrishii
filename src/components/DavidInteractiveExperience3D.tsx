"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface DavidInteractiveExperience3DProps {
  scrollProgress: number; // 0 (Hero sitting) -> 1 (About standing on pedestal)
  exitProgress?: number; // 0 (About active) -> 1 (Exiting into Projects)
  className?: string;
  onLoaded?: () => void;
}

export default function DavidInteractiveExperience3D({
  scrollProgress,
  exitProgress = 0,
  className = "",
  onLoaded,
}: DavidInteractiveExperience3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Store latest progress targets in refs for the 60fps render loop
  const targetProgressRef = useRef(scrollProgress);
  targetProgressRef.current = scrollProgress;

  const targetExitRef = useRef(exitProgress);
  targetExitRef.current = exitProgress;

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

    // 1. Scene & Camera Setup (38 FOV matching david-hckh.com bundle)
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
    renderer.setClearColor(0xf5efe6, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // 3. Color Palettes
    const heroBgColor = new THREE.Color("#f5efe6");
    const aboutBgColor = new THREE.Color("#011c3d");

    // 4. Asset Loaders
    const textureLoader = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();

    // Textures
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

    // 5. Room Grid Environment for About Mode (Glowing Cyan Floor & Wall)
    // ONLY visible when in About section!
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
    gridGroup.visible = false;
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

    // 6. Interactive Groups & Mesh Handles
    const roomGroup = new THREE.Group();
    const landscapeInit = isLandscape();
    roomGroup.position.set(landscapeInit ? 2 : 0, 0, 0);
    roomGroup.rotation.set(0, landscapeInit ? -2.3 : -2.1, 0);
    scene.add(roomGroup);

    const labGroup = new THREE.Group();
    labGroup.position.set(0, 0, 6);
    labGroup.visible = false;
    scene.add(labGroup);

    let chairMesh: THREE.Mesh | null = null;
    let musicMesh: THREE.Mesh | null = null;
    let baseMusicY = 0;

    let avatarGroup: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let idleAction: THREE.AnimationAction | null = null;
    let tIdleAction: THREE.AnimationAction | null = null;
    let faceUniformFrame: { value: number } | null = null;

    // Load Room Model (Desk, Monitor, Chair, Shelves)
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

    // Load Lab Model (Hologram Pedestal & Cyan Glowing Ring Base)
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
              color: new THREE.Color("#00ffff"),
              transparent: true,
              opacity: 0.45,
              blending: THREE.AdditiveBlending,
            });
            mesh.renderOrder = 30;
          }
        }
      });

      // Hologram vertical scanning cone beam
      const coneGeom = new THREE.CylinderGeometry(1.6, 1.1, 3.4, 32, 1, true);
      const coneMat = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPos;
          void main() {
            vUv = uv;
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          varying vec3 vPos;
          uniform float uTime;
          void main() {
            float rings = sin(vUv.y * 36.0 - uTime * 4.0) * 0.5 + 0.5;
            float verticalFade = smoothstep(0.0, 0.4, vUv.y) * (1.0 - smoothstep(0.8, 1.0, vUv.y));
            float alpha = rings * verticalFade * 0.35;
            vec3 col = mix(vec3(0.0, 0.6, 1.0), vec3(0.0, 1.0, 0.9), rings);
            gl_FragColor = vec4(col, alpha);
          }
        `,
        uniforms: {
          uTime: { value: 0 },
        },
      });
      const coneMesh = new THREE.Mesh(coneGeom, coneMat);
      coneMesh.position.set(0, 1.7, 0);
      coneMesh.name = "scannerCone";
      labGroup.add(coneMesh);

      // Number display "042" on pedestal
      const numCanvas = document.createElement("canvas");
      numCanvas.width = 128;
      numCanvas.height = 64;
      const ctx = numCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, 128, 64);
        ctx.fillStyle = "#00f0ff";
        ctx.font = "bold 38px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("042", 64, 32);
      }
      const numberTex = new THREE.CanvasTexture(numCanvas);
      const numberGeom = new THREE.PlaneGeometry(0.7, 0.35);
      const numberMat = new THREE.MeshBasicMaterial({
        map: numberTex,
        transparent: true,
      });
      const numberMesh = new THREE.Mesh(numberGeom, numberMat);
      numberMesh.position.set(0, 0.22, 1.15);
      labGroup.add(numberMesh);

      labGroup.add(labScene);
    });

    // 7. Load Avatar Model (Direct gltf.scene root to preserve 100% bone hierarchy)
    gltfLoader.load("/models/avatar-model.glb", (gltf) => {
      if (isDisposed) return;

      // Use gltf.scene directly to avoid bone skew/distortion
      avatarGroup = gltf.scene;

      const brain = avatarGroup.getObjectByName("brain");
      if (brain) brain.visible = false;

      const landscape = isLandscape();
      const baseRoomX = landscape ? 2 : 0;
      const startYaw = (landscape ? -2.3 : -2.1) + Math.PI / 2;
      avatarGroup.position.set(baseRoomX, 0, 0);
      avatarGroup.rotation.set(0, startYaw, 0);

      scene.add(avatarGroup);

      // Matcap Materials matching authentic David Heckhoff character
      avatarGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.SkinnedMesh;
          if (mesh.name === "black") {
            mesh.material = new THREE.MeshMatcapMaterial({ matcap: matcapBlack });
          } else if (mesh.name === "gray") {
            mesh.material = new THREE.MeshMatcapMaterial({ matcap: matcapGray });
          } else if (mesh.name === "skin") {
            mesh.material = new THREE.MeshMatcapMaterial({ matcap: matcapSkin });
          } else if (mesh.name === "white") {
            mesh.material = new THREE.MeshMatcapMaterial({ matcap: matcapWhite });
          }
        }
      });

      // Head hair texture
      const headMesh = avatarGroup.getObjectByName("head") as THREE.SkinnedMesh;
      if (headMesh && headTexture) {
        headMesh.material = new THREE.MeshBasicMaterial({ map: headTexture });
      }

      // Blinking face shader with 4x4 sprite frame atlas
      const faceMesh = avatarGroup.getObjectByName("face") as THREE.SkinnedMesh;
      if (faceMesh) {
        faceUniformFrame = { value: 12 }; // Frame 12 = eyes open
        faceMesh.material = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          vertexShader: `
            #include <skinning_pars_vertex>
            varying vec2 vUv;
            void main() {
              #include <skinbase_vertex>
              #include <begin_vertex>
              #include <skinning_vertex>
              #include <project_vertex>
              vUv = uv;
            }
          `,
          fragmentShader: `
            varying vec2 vUv;
            uniform sampler2D uTexture;
            uniform float uFrame;

            #define ROWS 4.0
            #define COLUMNS 4.0

            void main() {
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
          },
        });
      }

      // Animation Mixer on avatarGroup
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
        faceUniformFrame.value = 13;
        setTimeout(() => {
          if (isDisposed || !faceUniformFrame) return;
          faceUniformFrame.value = 14;
          setTimeout(() => {
            if (isDisposed || !faceUniformFrame) return;
            faceUniformFrame.value = 15;
            setTimeout(() => {
              if (isDisposed || !faceUniformFrame) return;
              faceUniformFrame.value = 12;
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
    let currentProgress = targetProgressRef.current;
    let currentExit = targetExitRef.current;
    const clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth scroll progress interpolation (0.09 lerp factor)
      const targetP = Math.max(0, Math.min(1, targetProgressRef.current));
      currentProgress += (targetP - currentProgress) * 0.1;
      const p = currentProgress;

      const targetE = Math.max(0, Math.min(1, targetExitRef.current));
      currentExit += (targetE - currentExit) * 0.1;
      const exitP = currentExit;

      if (mixer) {
        mixer.update(delta);
      }

      // Smooth easing matching GSAP power1.out (1 - (1 - p)^2)
      const easeT = 1 - (1 - p) * (1 - p);

      // Background color: Hero beige -> About deep space blue -> exit back to beige
      let currentBg: THREE.Color;
      if (exitP > 0) {
        currentBg = aboutBgColor.clone().lerp(heroBgColor, exitP);
      } else {
        currentBg = heroBgColor.clone().lerp(aboutBgColor, easeT);
      }
      renderer.setClearColor(currentBg, 1);

      // Room group transition (desk swivels, flies up and away)
      const landscape = isLandscape();
      const baseRoomX = landscape ? 2 : 0;
      const targetRoomX = landscape ? 4.5 : 0;
      const targetRoomY = landscape ? 5.7 : 5.4;

      roomGroup.position.set(
        THREE.MathUtils.lerp(baseRoomX, targetRoomX, easeT),
        THREE.MathUtils.lerp(0, targetRoomY, easeT),
        0
      );
      roomGroup.rotation.set(
        THREE.MathUtils.lerp(0, 0.1, easeT),
        landscape ? -2.3 : -2.1,
        THREE.MathUtils.lerp(0, 0.09, easeT)
      );
      const roomScale = THREE.MathUtils.lerp(1, 0.85, easeT);
      roomGroup.scale.set(roomScale, roomScale, roomScale);
      roomGroup.visible = p < 0.98;

      // Chair swivel on scroll
      if (chairMesh) {
        const chairT = Math.min(1, easeT / 0.6);
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

      // Avatar transition from desk to pedestal
      if (avatarGroup) {
        const startYaw = (landscape ? -2.3 : -2.1) + Math.PI / 2;
        const targetYaw = -Math.PI;

        const exitSinkY = exitP * 3.5;

        avatarGroup.position.set(
          THREE.MathUtils.lerp(baseRoomX, 0, easeT),
          -exitSinkY,
          THREE.MathUtils.lerp(0, 6, easeT)
        );
        avatarGroup.rotation.set(
          0,
          THREE.MathUtils.lerp(startYaw, targetYaw, easeT),
          0
        );

        // Crossfade animations: idle -> t-idle
        if (idleAction && tIdleAction) {
          // Smooth power1.out blending
          let blend = 0;
          if (p <= 0.12) {
            blend = 0;
          } else if (p >= 0.85) {
            blend = 1;
          } else {
            const raw = (p - 0.12) / 0.73;
            blend = 1 - (1 - raw) * (1 - raw);
          }
          idleAction.weight = 1.0 - blend;
          tIdleAction.weight = blend;
        }

        avatarGroup.visible = exitP < 0.98;
      }

      // Lab pedestal & Hologram appearance
      labGroup.visible = p > 0.05 && exitP < 0.98;
      if (exitP > 0) {
        labGroup.position.y = -exitP * 3.5;
      } else {
        labGroup.position.y = 0;
      }

      // Room Grid (cyan floor/wall lines)
      // Completely hidden during Hero (p <= 0.05), fully visible during About, fades out on exit
      gridGroup.visible = p > 0.05 && exitP < 0.99;
      const inGridOpacity = Math.min(1, Math.max(0, (p - 0.15) * 1.8));
      const finalGridOpacity = inGridOpacity * (1.0 - exitP);
      gridOpacityUniform.value = finalGridOpacity;

      // Scanner cone animation
      const cone = labGroup.getObjectByName("scannerCone") as THREE.Mesh;
      if (cone && (cone.material as THREE.ShaderMaterial).uniforms) {
        (cone.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
      }

      // Camera position & focus transition
      // Exact coordinates from David Heckhoff bundle Nh:
      // Landscape: hero (0, 6, 10) focus (0, 3, 0), about (0, 4.5, 15.5) focus (0, 2.2, 6)
      // Portrait: hero (0, 8.2, 16) focus (0, 5.2, 0), about (0, 4.75, 19.5) focus (0, 0.8, 6)
      const baseCamY = landscape ? 6 : 8.2;
      const baseCamZ = landscape ? 10 : 16;
      const baseFocusY = landscape ? 3 : 5.2;

      const targetCamY = landscape ? 4.5 : 4.75;
      const targetCamZ = landscape ? 15.5 : 19.5;
      const targetFocusY = landscape ? 2.2 : 0.8;

      const currentCamY = THREE.MathUtils.lerp(baseCamY, targetCamY, easeT) + exitP * 1.8;
      const currentCamZ = THREE.MathUtils.lerp(baseCamZ, targetCamZ, easeT);
      camera.position.set(0, currentCamY, currentCamZ);

      const currentFocusY = THREE.MathUtils.lerp(baseFocusY, targetFocusY, easeT);
      const currentFocusZ = THREE.MathUtils.lerp(0, 6, easeT);
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
