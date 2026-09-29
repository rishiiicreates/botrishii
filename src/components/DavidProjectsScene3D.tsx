"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface DavidProjectsScene3DProps {
  onLoaded?: () => void;
  className?: string;
}

export default function DavidProjectsScene3D({
  onLoaded,
  className = "",
}: DavidProjectsScene3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isDisposed = false;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const isLandscape = () => window.innerWidth >= 840;

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.01,
      100
    );

    // Camera Group for Parallax
    const cameraGroup = new THREE.Group();
    scene.add(cameraGroup);
    cameraGroup.add(camera);

    const updateCameraPosition = () => {
      if (isLandscape()) {
        camera.position.set(0, 6, 10);
        camera.lookAt(0, 3, 0);
      } else {
        camera.position.set(0, 8.2, 16);
        camera.lookAt(0, 5.2, 0);
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
    renderer.setClearColor(0xf5efe6, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // 3. Texture Loader
    const gltfLoader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    // Room Textures
    const roomTexture = textureLoader.load("/models/room-texture.webp");
    roomTexture.flipY = false;
    roomTexture.colorSpace = THREE.SRGBColorSpace;

    const desktopsTexture = textureLoader.load("/models/desktops.webp");
    desktopsTexture.flipY = false;
    desktopsTexture.colorSpace = THREE.SRGBColorSpace;

    const roomShadowTexture = textureLoader.load("/models/room-shadow.webp");
    roomShadowTexture.flipY = false;

    // Avatar Textures & Matcaps
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
    let avatarTransform: THREE.Group | null = null;
    let chairMesh: THREE.Mesh | null = null;
    let musicMesh: THREE.Mesh | null = null;
    let baseMusicY = 0;
    // 4. Load Room Model (Desk, monitors, chair, shelf, corkboard, plant, rug)
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    const applyGroupTransforms = () => {
      const landscape = isLandscape();
      if (landscape) {
        roomGroup.position.set(2, 0, 0);
        roomGroup.rotation.set(0, -2.3, 0);
        if (avatarTransform) {
          avatarTransform.position.set(2, 0, 0);
          avatarTransform.rotation.set(0, -2.3 + Math.PI / 2, 0);
        }
      } else {
        roomGroup.position.set(0, 0, 0);
        roomGroup.rotation.set(0, -2.1, 0);
        if (avatarTransform) {
          avatarTransform.position.set(0, 0, 0);
          avatarTransform.rotation.set(0, -2.1 + Math.PI / 2, 0);
        }
      }
    };
    applyGroupTransforms();

    gltfLoader.load("/models/room-model.glb", (gltf) => {
      if (isDisposed) return;

      const roomScene = gltf.scene;

      // Extract specific interactive objects
      chairMesh = roomScene.children.find((c) => c.name === "chair") as THREE.Mesh;
      musicMesh = roomScene.children.find((c) => c.name === "music") as THREE.Mesh;
      if (musicMesh) {
        baseMusicY = musicMesh.position.y;
      }

      // Configure materials across room meshes
      const roomMaterial = new THREE.MeshBasicMaterial({ map: roomTexture });

      roomScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          if (mesh.name === "desktop-plane-0" || mesh.name === "desktop-plane-1") {
            // Monitor screens displaying code
            mesh.material = new THREE.MeshBasicMaterial({
              map: desktopsTexture,
            });
          } else if (mesh.name === "shadow-catcher") {
            // Transparent shadow catcher layered on top of the room grid floor
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
          } else if (mesh.name === "carpet") {
            // Layered rounded rug
            mesh.material = roomMaterial;
            mesh.renderOrder = -5;
          } else {
            // Room accessories (desk, chair, shelf, plant, blackboard, etc.)
            mesh.material = roomMaterial;
          }
        }
      });

      roomGroup.add(roomScene);
    });

    // 5. Load Avatar Model (Sitting at desk, typing/coding)
    gltfLoader.load("/models/avatar-model.glb", (gltf) => {
      if (isDisposed) return;

      // Extract armature child directly (matching David Heckhoff's exact bundle architecture)
      const rawArmature = gltf.scene.children[0];
      if (!rawArmature) return;

      // CRITICAL: Overriding rotation.z = 0 aligns Mixamo/Blender export coordinates to the chair & desk!
      rawArmature.rotation.z = 0;

      // Remove internal brain mesh
      const brain = rawArmature.getObjectByName("brain");
      if (brain) {
        rawArmature.remove(brain);
      }

      // Group container for position and rotation waypoints
      avatarTransform = new THREE.Group();
      avatarTransform.add(rawArmature);
      applyGroupTransforms();

      // Apply authentic Matcaps to each body part
      rawArmature.traverse((child) => {
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
      const headMesh = rawArmature.getObjectByName("head") as THREE.SkinnedMesh;
      if (headMesh && headTexture) {
        headMesh.material = new THREE.MeshBasicMaterial({
          map: headTexture,
        });
      }

      // Face shader with 4x4 sprite frame atlas
      const faceMesh = rawArmature.getObjectByName("face") as THREE.SkinnedMesh;
      if (faceMesh) {
        faceUniformFrame = { value: 12 }; // proud-0 open eyes
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

      // Avatar Animation: 'idle' = sitting on chair, coding at desk
      mixer = new THREE.AnimationMixer(rawArmature);
      const idleClip = gltf.animations.find((a) => a.name === "idle");
      if (idleClip) {
        const action = mixer.clipAction(idleClip);
        action.play();
      }

      scene.add(avatarTransform);
      setLoading(false);
      onLoaded?.();
    });

    // 6. Organic Eye Blinking Loop
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

    // 7. Interactive Mouse Parallax (Chair swivel & 3D camera drift)
    const mousePos = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX / window.innerWidth - 0.5;
      mousePos.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 8. Resize Handler
    const onResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      updateCameraPosition();
      applyGroupTransforms();
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    // 9. Animation Render Loop
    const clock = new THREE.Clock();
    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (mixer) {
        mixer.update(delta);
      }

      // Chair locked squarely under the seated avatar
      if (chairMesh) {
        chairMesh.rotation.set(0, 0, 0);
      }

      // Floating musical notes effect
      if (musicMesh) {
        musicMesh.position.y = baseMusicY + Math.sin(elapsed * 2.8) * 0.04;
        musicMesh.rotation.z = Math.sin(elapsed * 1.8) * 0.04;
      }

      // 3D Camera parallax shift on cameraGroup
      const targetCamGroupX = mousePos.x * 0.8;
      const targetCamGroupY = -mousePos.y * 0.5;
      cameraGroup.position.x += (targetCamGroupX - cameraGroup.position.x) * 0.06;
      cameraGroup.position.y += (targetCamGroupY - cameraGroup.position.y) * 0.06;

      camera.lookAt(0, 3, 0);

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
