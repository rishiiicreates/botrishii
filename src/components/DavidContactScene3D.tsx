"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface DavidContactScene3DProps {
  onLoaded?: () => void;
  className?: string;
}

export default function DavidContactScene3D({
  onLoaded,
  className = "",
}: DavidContactScene3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isDisposed = false;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const getIsLandscape = () => window.innerWidth >= 840;
    let isLandscape = getIsLandscape();

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.01,
      100
    );

    const updateCameraPosition = () => {
      isLandscape = getIsLandscape();
      if (isLandscape) {
        // Desktop landscape framing - avatar centered to right-center
        camera.position.set(0.6, -8.5, 9.2);
        camera.lookAt(0.6, -10.5, 0);
      } else {
        // Mobile portrait framing
        camera.position.set(0, -8.2, 12.5);
        camera.lookAt(0, -9.6, 0);
      }
    };
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xe8e5e0, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(4, 10, 8);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.7);
    fillLight.position.set(-6, 6, -3);
    scene.add(fillLight);

    // 3. Texture Loader & Textures
    const gltfLoader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    // 3.5 Room Grid Environment (Floor, Back Wall, Left Wall)
    // Anchored at room corner C = (-14.0, -13.0, -11.0)
    const roomCorner = new THREE.Vector3(-14.0, -13.0, -11.0);
    const tileSize = 1.4;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const roomVertexShader = `
      varying vec3 vWorldPos;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const roomFragmentShader = `
      uniform vec3 uBaseColor;
      uniform vec3 uLineColor;
      uniform vec3 uAccentColor;
      uniform float uTileSize;
      uniform float uLineWidth;
      uniform float uPixelRatio;
      uniform vec3 uCorner;
      uniform int uPlaneType; // 0: Floor (XZ), 1: Back Wall (XY), 2: Left Wall (ZY)

      varying vec3 vWorldPos;

      void main() {
        vec2 coord;
        float seamDist = 100.0;
        float edgeFade = 1.0;

        if (uPlaneType == 0) {
          // Floor: horizontal X and Z
          coord = vec2(vWorldPos.x - uCorner.x, vWorldPos.z - uCorner.z);
          float distBack = max(0.0, vWorldPos.z - uCorner.z);
          float distLeft = max(0.0, vWorldPos.x - uCorner.x);
          seamDist = min(distBack, distLeft);
          
          float fadeZ = 1.0 - smoothstep(6.0, 14.0, vWorldPos.z);
          float fadeX = 1.0 - smoothstep(14.0, 22.0, vWorldPos.x);
          edgeFade = fadeZ * fadeX;
        } else if (uPlaneType == 1) {
          // Back Wall: vertical in X and Y
          coord = vec2(vWorldPos.x - uCorner.x, vWorldPos.y - uCorner.y);
          float distFloor = max(0.0, vWorldPos.y - uCorner.y);
          float distLeft = max(0.0, vWorldPos.x - uCorner.x);
          seamDist = min(distFloor, distLeft);

          float fadeY = 1.0 - smoothstep(1.0, 9.0, vWorldPos.y);
          float fadeX = 1.0 - smoothstep(14.0, 22.0, vWorldPos.x);
          edgeFade = fadeY * fadeX;
        } else {
          // Left Wall: vertical in Z and Y
          coord = vec2(vWorldPos.z - uCorner.z, vWorldPos.y - uCorner.y);
          float distFloor = max(0.0, vWorldPos.y - uCorner.y);
          float distBack = max(0.0, vWorldPos.z - uCorner.z);
          seamDist = min(distFloor, distBack);

          float fadeY = 1.0 - smoothstep(1.0, 9.0, vWorldPos.y);
          float fadeZ = 1.0 - smoothstep(6.0, 14.0, vWorldPos.z);
          edgeFade = fadeY * fadeZ;
        }

        vec2 cell = coord / uTileSize;
        vec2 perPixel = max(fwidth(cell), vec2(1e-5));
        float halfW = uLineWidth * 0.5 * uPixelRatio;

        // Minor grid lines
        vec2 distToLine = abs(fract(cell - 0.5) - 0.5) / perPixel;
        float lineAlpha = 1.0 - clamp(min(distToLine.x, distToLine.y) / halfW, 0.0, 1.0);

        // Major grid line every 4 tiles
        vec2 majorCell = coord / (uTileSize * 4.0);
        vec2 majorPerPixel = max(fwidth(majorCell), vec2(1e-5));
        vec2 distToMajor = abs(fract(majorCell - 0.5) - 0.5) / majorPerPixel;
        float majorAlpha = 1.0 - clamp(min(distToMajor.x, distToMajor.y) / (halfW * 1.3), 0.0, 1.0);

        // Subtle intersection accent dots
        vec2 cellFract = abs(fract(cell - 0.5) - 0.5) * uTileSize;
        float dotAlpha = 1.0 - smoothstep(0.015, 0.038, length(cellFract));

        // Ambient occlusion crease where walls meet floor or wall meets wall
        float ao = 1.0 - (1.0 - smoothstep(0.0, 2.2, seamDist)) * 0.08;
        float seamHighlight = (1.0 - smoothstep(0.0, 0.05, seamDist)) * 0.30;

        float minorOpacity = 0.14;
        float majorOpacity = 0.24;
        float combinedLines = clamp(lineAlpha * minorOpacity + majorAlpha * majorOpacity + dotAlpha * 0.22 + seamHighlight, 0.0, 1.0);

        vec3 lineCol = mix(uLineColor, uAccentColor, majorAlpha * 0.5 + dotAlpha * 0.3);
        vec3 baseCol = uBaseColor * ao;

        vec3 finalCol = mix(baseCol, lineCol, combinedLines * edgeFade);

        gl_FragColor = vec4(finalCol, 1.0);
      }
    `;

    const createRoomMaterial = (planeType: number) => {
      return new THREE.ShaderMaterial({
        vertexShader: roomVertexShader,
        fragmentShader: roomFragmentShader,
        side: THREE.DoubleSide,
        uniforms: {
          uBaseColor: { value: new THREE.Color(0xe8e5e0) },
          uLineColor: { value: new THREE.Color("#061a1e") },
          uAccentColor: { value: new THREE.Color("#299093") },
          uTileSize: { value: tileSize },
          uLineWidth: { value: 1.15 },
          uPixelRatio: { value: pixelRatio },
          uCorner: { value: roomCorner },
          uPlaneType: { value: planeType },
        },
      });
    };

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    // 1. Floor Plane (XZ)
    const floorWidth = 36;
    const floorDepth = 26;
    const floorGeom = new THREE.PlaneGeometry(floorWidth, floorDepth);
    const floorMesh = new THREE.Mesh(floorGeom, createRoomMaterial(0));
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(
      roomCorner.x + floorWidth / 2,
      roomCorner.y - 0.01,
      roomCorner.z + floorDepth / 2
    );
    floorMesh.renderOrder = -2;
    roomGroup.add(floorMesh);

    // 2. Back Wall Plane (XY)
    const backWallHeight = 24;
    const backWallGeom = new THREE.PlaneGeometry(floorWidth, backWallHeight);
    const backWallMesh = new THREE.Mesh(backWallGeom, createRoomMaterial(1));
    backWallMesh.position.set(
      roomCorner.x + floorWidth / 2,
      roomCorner.y + backWallHeight / 2,
      roomCorner.z
    );
    backWallMesh.renderOrder = -2;
    roomGroup.add(backWallMesh);

    // 3. Left Wall Plane (ZY)
    const leftWallGeom = new THREE.PlaneGeometry(floorDepth, backWallHeight);
    const leftWallMesh = new THREE.Mesh(leftWallGeom, createRoomMaterial(2));
    leftWallMesh.rotation.y = Math.PI / 2;
    leftWallMesh.position.set(
      roomCorner.x,
      roomCorner.y + backWallHeight / 2,
      roomCorner.z + floorDepth / 2
    );
    leftWallMesh.renderOrder = -2;
    roomGroup.add(leftWallMesh);

    // Contact Props Textures
    const contactTexture = textureLoader.load("/models/contact-texture.webp");
    contactTexture.flipY = false;
    contactTexture.colorSpace = THREE.SRGBColorSpace;

    const shadowTexture = textureLoader.load("/models/contact-shadow.webp");
    shadowTexture.flipY = false;

    // Avatar Textures
    const faceTexture = textureLoader.load("/models/face-texture.png");
    faceTexture.generateMipmaps = false;
    faceTexture.colorSpace = THREE.SRGBColorSpace;

    const headTexture = textureLoader.load("/models/head-texture.webp");
    headTexture.flipY = false;
    headTexture.generateMipmaps = false;
    headTexture.colorSpace = THREE.SRGBColorSpace;

    // Matcaps for Clothes & Skin
    const matcapBlack = textureLoader.load("/models/matcap-black.webp");
    matcapBlack.colorSpace = THREE.SRGBColorSpace;
    const matcapGray = textureLoader.load("/models/matcap-gray.webp");
    matcapGray.colorSpace = THREE.SRGBColorSpace;
    const matcapSkin = textureLoader.load("/models/matcap-skin.webp");
    matcapSkin.colorSpace = THREE.SRGBColorSpace;
    const matcapWhite = textureLoader.load("/models/matcap-white.webp");
    matcapWhite.colorSpace = THREE.SRGBColorSpace;

    let mixer: THREE.AnimationMixer | null = null;
    let faceUniformFrame: { value: number } | null = null;
    let avatarGroup: THREE.Group | null = null;

    // 4. Contact Model (Boxes, envelopes, transparent shadow floor)
    const contactPropsGroup = new THREE.Group();
    contactPropsGroup.position.set(1, -13, 0);
    contactPropsGroup.rotation.set(0, -0.8, 0);
    scene.add(contactPropsGroup);

    gltfLoader.load("/models/contact-model.glb", (gltf) => {
      if (isDisposed) return;

      const baseMesh = gltf.scene.children.find((c) => c.name === "base") as THREE.Mesh;
      if (baseMesh) {
        baseMesh.material = new THREE.MeshBasicMaterial({
          map: contactTexture,
        });
        contactPropsGroup.add(baseMesh);
      }

      const shadowCatcher = gltf.scene.children.find(
        (c) => c.name === "shadow-catcher"
      ) as THREE.Mesh;
      if (shadowCatcher) {
        // Transparent soft shadow catcher that naturally blends into any warm background
        const shadowMat = new THREE.ShaderMaterial({
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
              float shadowAlpha = (1.0 - shadow.r) * 0.28;
              gl_FragColor = vec4(uColorShadow, shadowAlpha);
            }
          `,
          uniforms: {
            uTexture: { value: shadowTexture },
            uColorShadow: { value: new THREE.Color("#061a1e") },
          },
        });
        shadowCatcher.material = shadowMat;
        shadowCatcher.renderOrder = -1;
        contactPropsGroup.add(shadowCatcher);
      }
    });

    // 5. Avatar Model with Matcaps and Blinking Face Shader
    gltfLoader.load("/models/avatar-model.glb", (gltf) => {
      if (isDisposed) return;

      avatarGroup = gltf.scene;
      avatarGroup.position.set(0, -13, 0);
      avatarGroup.rotation.set(0, Math.PI / 2, 0); // Faces camera directly

      // Apply authentic Matcaps to each body mesh
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

      // Head texture (hair)
      const headMesh = avatarGroup.getObjectByName("head") as THREE.SkinnedMesh;
      if (headMesh && headTexture) {
        headMesh.material = new THREE.MeshBasicMaterial({
          map: headTexture,
        });
      }

      // Face shader with 4x4 sprite frame atlas
      const faceMesh = avatarGroup.getObjectByName("face") as THREE.SkinnedMesh;
      if (faceMesh) {
        faceUniformFrame = { value: 12 }; // proud-0 = open eyes
        const faceMat = new THREE.ShaderMaterial({
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
        faceMesh.material = faceMat;
      }

      // Animations: contact-idle
      mixer = new THREE.AnimationMixer(avatarGroup);
      const idleClip = gltf.animations.find((a) => a.name === "contact-idle");
      if (idleClip) {
        const action = mixer.clipAction(idleClip);
        action.play();
      }

      scene.add(avatarGroup);
      setLoading(false);
      onLoaded?.();
    });

    // 6. Organic Blink Loop: 12 -> 13 -> 14 -> 15 -> 12
    let blinkTimeout: NodeJS.Timeout | null = null;
    const scheduleNextBlink = () => {
      const delay = 2600 + Math.random() * 3000;
      blinkTimeout = setTimeout(() => {
        if (isDisposed || !faceUniformFrame) return;

        // Start blink animation
        faceUniformFrame.value = 13;
        setTimeout(() => {
          if (isDisposed || !faceUniformFrame) return;
          faceUniformFrame.value = 14; // Closed
          setTimeout(() => {
            if (isDisposed || !faceUniformFrame) return;
            faceUniformFrame.value = 15; // Reopening
            setTimeout(() => {
              if (isDisposed || !faceUniformFrame) return;
              faceUniformFrame.value = 12; // Open
              scheduleNextBlink();
            }, 60);
          }, 80);
        }, 60);
      }, delay);
    };
    scheduleNextBlink();

    // 7. Mouse Parallax
    let targetRotY = Math.PI / 2;
    let targetRotX = 0;
    let normMouseX = 0;
    let normMouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      normMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      normMouseY = (e.clientY / window.innerHeight) * 2 - 1;
      targetRotY = Math.PI / 2 + normMouseX * 0.18;
      targetRotX = normMouseY * 0.08;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 8. Resize Handler
    const onResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      updateCameraPosition();
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    // 9. Render Loop
    const clock = new THREE.Clock();
    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (mixer) {
        mixer.update(delta);
      }

      // Smooth avatar parallax
      if (avatarGroup) {
        avatarGroup.rotation.y += (targetRotY - avatarGroup.rotation.y) * 0.05;
        avatarGroup.rotation.x += (targetRotX - avatarGroup.rotation.x) * 0.05;
      }

      // Smooth camera parallax for dynamic room perspective
      const baseCamX = isLandscape ? 0.6 : 0;
      const baseCamY = isLandscape ? -8.5 : -8.2;
      const targetCamX = baseCamX + normMouseX * 0.35;
      const targetCamY = baseCamY - normMouseY * 0.20;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(baseCamX, isLandscape ? -10.5 : -9.6, 0);

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
  }, [onLoaded]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 size-full pointer-events-none select-none ${className}`}
      style={{ touchAction: "none" }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="size-8 rounded-full border-2 border-[#061a1e]/20 border-t-[#299093] animate-spin" />
        </div>
      )}
    </div>
  );
}
