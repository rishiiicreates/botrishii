"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface DavidAboutScene3DProps {
  onLoaded?: () => void;
  className?: string;
}

export default function DavidAboutScene3D({
  onLoaded,
  className = "",
}: DavidAboutScene3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isDisposed = false;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#011c3d");

    const isLandscape = () => window.innerWidth >= 840;

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.01,
      100
    );

    const cameraGroup = new THREE.Group();
    scene.add(cameraGroup);
    cameraGroup.add(camera);

    const updateCameraPosition = () => {
      if (isLandscape()) {
        camera.position.set(0, 4.5, 15.5);
        camera.lookAt(0, 2.2, 6);
      } else {
        camera.position.set(0, 4.75, 19.5);
        camera.lookAt(0, 0.8, 6);
      }
    };
    updateCameraPosition();

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x011c3d, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // 3. Room Grid Environment (Glowing Cyan Floor & Wall Grids)
    // Anchored at roomCorner = (-16.0, 0.0, -2.0)
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
          
          float fadeZ = 1.0 - smoothstep(12.0, 26.0, vWorldPos.z);
          float fadeX = 1.0 - smoothstep(14.0, 28.0, vWorldPos.x);
          edgeFade = fadeZ * fadeX;
        } else if (uPlaneType == 1) {
          // Back Wall: vertical in X and Y
          coord = vec2(vWorldPos.x - uCorner.x, vWorldPos.y - uCorner.y);
          float distFloor = max(0.0, vWorldPos.y - uCorner.y);
          float distLeft = max(0.0, vWorldPos.x - uCorner.x);
          seamDist = min(distFloor, distLeft);

          float fadeY = 1.0 - smoothstep(8.0, 18.0, vWorldPos.y);
          float fadeX = 1.0 - smoothstep(14.0, 28.0, vWorldPos.x);
          edgeFade = fadeY * fadeX;
        } else {
          // Left Wall: vertical in Z and Y
          coord = vec2(vWorldPos.z - uCorner.z, vWorldPos.y - uCorner.y);
          float distFloor = max(0.0, vWorldPos.y - uCorner.y);
          float distBack = max(0.0, vWorldPos.z - uCorner.z);
          seamDist = min(distFloor, distBack);

          float fadeY = 1.0 - smoothstep(8.0, 18.0, vWorldPos.y);
          float fadeZ = 1.0 - smoothstep(12.0, 26.0, vWorldPos.z);
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
        float dotAlpha = 1.0 - smoothstep(0.018, 0.045, length(cellFract));

        // Ambient occlusion crease where walls meet floor
        float ao = 1.0 - (1.0 - smoothstep(0.0, 2.5, seamDist)) * 0.15;
        float seamHighlight = (1.0 - smoothstep(0.0, 0.08, seamDist)) * 0.40;

        float minorOpacity = 0.22;
        float majorOpacity = 0.45;
        float combinedLines = clamp(lineAlpha * minorOpacity + majorAlpha * majorOpacity + dotAlpha * 0.45 + seamHighlight, 0.0, 1.0);

        vec3 lineCol = mix(uLineColor, uAccentColor, majorAlpha * 0.7 + dotAlpha * 0.5);
        vec3 baseCol = uBaseColor * ao;

        vec3 finalCol = mix(baseCol, lineCol, combinedLines * edgeFade);

        gl_FragColor = vec4(finalCol, 1.0);
      }
    `;

    const createGridMaterial = (planeType: number) => {
      return new THREE.ShaderMaterial({
        vertexShader: gridVertexShader,
        fragmentShader: gridFragmentShader,
        side: THREE.DoubleSide,
        uniforms: {
          uBaseColor: { value: new THREE.Color("#011c3d") },
          uLineColor: { value: new THREE.Color("#0077b6") },
          uAccentColor: { value: new THREE.Color("#00f0ff") },
          uTileSize: { value: tileSize },
          uLineWidth: { value: 1.25 },
          uPixelRatio: { value: pixelRatio },
          uCorner: { value: roomCorner },
          uPlaneType: { value: planeType },
        },
      });
    };

    const gridGroup = new THREE.Group();
    scene.add(gridGroup);

    // Floor Plane (XZ)
    const floorWidth = 46;
    const floorDepth = 38;
    const floorGeom = new THREE.PlaneGeometry(floorWidth, floorDepth);
    const floorMesh = new THREE.Mesh(floorGeom, createGridMaterial(0));
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(
      roomCorner.x + floorWidth / 2,
      roomCorner.y - 0.01,
      roomCorner.z + floorDepth / 2
    );
    floorMesh.renderOrder = -20;
    gridGroup.add(floorMesh);

    // Back Wall Plane (XY)
    const backWallHeight = 22;
    const backWallGeom = new THREE.PlaneGeometry(floorWidth, backWallHeight);
    const backWallMesh = new THREE.Mesh(backWallGeom, createGridMaterial(1));
    backWallMesh.position.set(
      roomCorner.x + floorWidth / 2,
      roomCorner.y + backWallHeight / 2,
      roomCorner.z
    );
    backWallMesh.renderOrder = -20;
    gridGroup.add(backWallMesh);

    // Left Wall Plane (ZY)
    const leftWallGeom = new THREE.PlaneGeometry(floorDepth, backWallHeight);
    const leftWallMesh = new THREE.Mesh(leftWallGeom, createGridMaterial(2));
    leftWallMesh.rotation.y = Math.PI / 2;
    leftWallMesh.position.set(
      roomCorner.x,
      roomCorner.y + backWallHeight / 2,
      roomCorner.z + floorDepth / 2
    );
    leftWallMesh.renderOrder = -20;
    gridGroup.add(leftWallMesh);

    // 4. Texture Loader & Matcaps
    const gltfLoader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

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

    let mixer: THREE.AnimationMixer | null = null;
    let faceUniformFrame: { value: number } | null = null;
    let avatarGroup: THREE.Group | null = null;

    // 5. Load Lab Hologram Pedestal (lab-model.glb)
    const labGroup = new THREE.Group();
    labGroup.position.set(0, 0, 6);
    scene.add(labGroup);

    gltfLoader.load("/models/lab-model.glb", (gltf) => {
      if (isDisposed) return;
      const labScene = gltf.scene;

      labScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.name === "base") {
            mesh.material = new THREE.MeshBasicMaterial({
              color: new THREE.Color("#0c2340"),
            });
            mesh.renderOrder = 20;
          } else if (mesh.name === "display") {
            mesh.material = new THREE.MeshBasicMaterial({
              color: new THREE.Color("#00f0ff"),
            });
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

      labGroup.add(labScene);
    });

    // 6. Load Avatar Model (Standing upright in t-idle pose on the pedestal)
    gltfLoader.load("/models/avatar-model.glb", (gltf) => {
      if (isDisposed) return;

      avatarGroup = gltf.scene;
      avatarGroup.position.set(0, 0, 6);
      avatarGroup.rotation.set(0, -Math.PI, 0);

      // Apply Matcaps to body parts
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
        headMesh.material = new THREE.MeshBasicMaterial({
          map: headTexture,
        });
      }

      // Face shader with blinking animation
      const faceMesh = avatarGroup.getObjectByName("face") as THREE.SkinnedMesh;
      if (faceMesh) {
        faceUniformFrame = { value: 12 };
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

      // Play standing t-idle animation clip
      mixer = new THREE.AnimationMixer(avatarGroup);
      const standClip =
        gltf.animations.find((a) => a.name === "t-idle") ||
        gltf.animations.find((a) => a.name === "contact-idle") ||
        gltf.animations[0];

      if (standClip) {
        const action = mixer.clipAction(standClip);
        action.play();
      }

      scene.add(avatarGroup);
      setLoading(false);
      onLoaded?.();
    });

    // 7. Organic Eye Blinking Loop
    let blinkTimeout: NodeJS.Timeout | null = null;
    const scheduleNextBlink = () => {
      const delay = 2600 + Math.random() * 3200;
      blinkTimeout = setTimeout(() => {
        if (isDisposed || !faceUniformFrame) return;

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

    // 8. Mouse Parallax
    const mousePos = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX / window.innerWidth - 0.5;
      mousePos.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 9. Resize Handler
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

    // 10. Animation Render Loop
    const clock = new THREE.Clock();
    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (mixer) {
        mixer.update(delta);
      }

      // Parallax shift on cameraGroup
      const targetCamGroupX = mousePos.x * 0.7;
      const targetCamGroupY = -mousePos.y * 0.4;
      cameraGroup.position.x += (targetCamGroupX - cameraGroup.position.x) * 0.06;
      cameraGroup.position.y += (targetCamGroupY - cameraGroup.position.y) * 0.06;

      // Subtle avatar swivel
      if (avatarGroup) {
        const targetRotY = -Math.PI + mousePos.x * 0.2;
        avatarGroup.rotation.y += (targetRotY - avatarGroup.rotation.y) * 0.05;
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
  }, [onLoaded]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 size-full pointer-events-none select-none ${className}`}
      style={{ touchAction: "none" }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="size-8 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
        </div>
      )}
    </div>
  );
}
