"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import WhiteboardChatbot from "@/components/WhiteboardChatbot";

interface DavidContactScene3DProps {
  onLoaded?: () => void;
  className?: string;
}

/**
 * Synthesizes a silky-smooth, seamless human breathing animation cycle from raw contact-idle.
 *
 * Root problems in raw avatar-model.glb contact-idle:
 * 1. Sawtooth half-cycle: The raw clip only moves downwards (exhale) over 2.08s, then snaps
 *    back to the top on loop repeat (+1.54cm instantaneous jump).
 * 2. Antipodal quaternion sign flips: Frame 15 and loop seam have dot product -1.0, collapsing
 *    slerp interpolations through zero and causing mechanical spine/chest twitches.
 * 3. Rapid panting tempo: 2.08s cycle = 28.8 breaths/min (hyperventilating).
 *
 * Solution:
 * - Continuously align quaternion signs so dot(q[i], q[i-1]) >= 0 everywhere.
 * - Symmetrically mirror the motion into a complete Inhale -> Exhale -> Inhale cycle (A -> B -> A).
 * - Full duration = 4.167s (14.4 breaths/min, textbook resting human breathing).
 * - 100% continuous derivatives: start and end frames match identically (0 seam jump, 0 jerk).
 */
function createSmoothBreathingClip(sourceClip: THREE.AnimationClip): THREE.AnimationClip {
  const origDuration = sourceClip.duration;
  const newTracks: THREE.KeyframeTrack[] = [];

  for (const track of sourceClip.tracks) {
    const stride = track.getValueSize();
    const n = track.times.length;

    if (n < 2) {
      newTracks.push(track.clone());
      continue;
    }

    // 1. Enforce quaternion sign continuity along forward path
    const rawValues = new Float32Array(track.values);
    if (track.ValueTypeName === "quaternion") {
      for (let i = 1; i < n; i++) {
        let dot = 0;
        for (let c = 0; c < 4; c++) {
          dot += rawValues[(i - 1) * 4 + c] * rawValues[i * 4 + c];
        }
        if (dot < 0) {
          for (let c = 0; c < 4; c++) {
            rawValues[i * 4 + c] = -rawValues[i * 4 + c];
          }
        }
      }
    }

    // 2. Mirror into full symmetric breath cycle (A -> B -> A)
    const totalSamples = 2 * n - 1;
    const newTimes = new Float32Array(totalSamples);
    const newValues = new Float32Array(totalSamples * stride);

    // Forward phase (0 -> origDuration)
    for (let i = 0; i < n; i++) {
      newTimes[i] = track.times[i];
      for (let c = 0; c < stride; c++) {
        newValues[i * stride + c] = rawValues[i * stride + c];
      }
    }

    // Return half (origDuration -> 2 * origDuration)
    for (let i = 1; i < n; i++) {
      const targetIdx = n - 1 + i;
      const sourceIdx = n - 1 - i;
      newTimes[targetIdx] = origDuration + (origDuration - track.times[sourceIdx]);

      if (track.ValueTypeName === "quaternion") {
        let dot = 0;
        for (let c = 0; c < 4; c++) {
          dot += newValues[(targetIdx - 1) * 4 + c] * rawValues[sourceIdx * 4 + c];
        }
        const sign = dot < 0 ? -1 : 1;
        for (let c = 0; c < 4; c++) {
          newValues[targetIdx * 4 + c] = sign * rawValues[sourceIdx * 4 + c];
        }
      } else {
        for (let c = 0; c < stride; c++) {
          newValues[targetIdx * stride + c] = rawValues[sourceIdx * stride + c];
        }
      }
    }

    const TrackConstructor = (track as any).constructor;
    newTracks.push(new TrackConstructor(track.name, newTimes, newValues, track.getInterpolation()));
  }

  return new THREE.AnimationClip(`${sourceClip.name}-smooth`, origDuration * 2, newTracks);
}

export default function DavidContactScene3D({
  onLoaded,
  className = "",
}: DavidContactScene3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chatOverlayRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Gesture callback handlers exposed to WhiteboardChatbot
  const gestureHandlersRef = useRef<{
    onUserSend?: () => void;
    onBotWritingStart?: () => void;
    onBotWritingEnd?: () => void;
  }>({});

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
        // Desktop landscape framing - balanced room showing avatar on left and whiteboard on right
        camera.position.set(0, -8.5, 9.2);
        camera.lookAt(0, -10.5, 0);
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

    container.insertBefore(renderer.domElement, container.firstChild);

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
    let currentAction: THREE.AnimationAction | null = null;
    let contactIdleAction: THREE.AnimationAction | null = null;
    let nodStartTime = -10;
    let lookMode: "user" | "board" = "user";
    let faceUniformFrame: { value: number } | null = null;
    let avatarGroup: THREE.Group | null = null;
    let avatarShadowMesh: THREE.Mesh | null = null;

    // 4. Contact Model (Boxes, envelopes, transparent shadow floor) on the left
    const contactPropsGroup = new THREE.Group();
    contactPropsGroup.position.set(-4.8, -13, -0.6);
    contactPropsGroup.rotation.set(0, -0.4, 0);
    scene.add(contactPropsGroup);

    // Additional container stacks to enrich the background and behind the whiteboard
    // Stack 1: Behind whiteboard (deep right background)
    const propsBehindBoard = new THREE.Group();
    propsBehindBoard.position.set(3.4, -13, -2.6);
    propsBehindBoard.rotation.set(0, 0.55, 0);
    propsBehindBoard.scale.set(1.15, 1.15, 1.15);
    scene.add(propsBehindBoard);

    // Stack 2: Deep center background (filling the empty room wall)
    const propsCenterBack = new THREE.Group();
    propsCenterBack.position.set(0.3, -13, -4.2);
    propsCenterBack.rotation.set(0, -0.28, 0);
    propsCenterBack.scale.set(0.95, 0.95, 0.95);
    scene.add(propsCenterBack);

    // Stack 3: Behind avatar / mid-left background
    const propsLeftBack = new THREE.Group();
    propsLeftBack.position.set(-4.2, -13, -3.4);
    propsLeftBack.rotation.set(0, 0.65, 0);
    propsLeftBack.scale.set(0.9, 0.9, 0.9);
    scene.add(propsLeftBack);

    gltfLoader.load("/models/contact-model.glb", (gltf) => {
      if (isDisposed) return;

      const baseMesh = gltf.scene.children.find((c) => c.name === "base") as THREE.Mesh;
      if (baseMesh) {
        baseMesh.material = new THREE.MeshBasicMaterial({
          map: contactTexture,
        });
        contactPropsGroup.add(baseMesh);

        // Clone base mesh into background stacks
        propsBehindBoard.add(baseMesh.clone());
        propsCenterBack.add(baseMesh.clone());
        propsLeftBack.add(baseMesh.clone());
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

        // Cloned shadow catchers
        const sc1 = shadowCatcher.clone();
        sc1.material = shadowMat;
        sc1.renderOrder = -1;
        propsBehindBoard.add(sc1);

        const sc2 = shadowCatcher.clone();
        sc2.material = shadowMat;
        sc2.renderOrder = -1;
        propsCenterBack.add(sc2);

        const sc3 = shadowCatcher.clone();
        sc3.material = shadowMat;
        sc3.renderOrder = -1;
        propsLeftBack.add(sc3);
      }
    });

    // 5. Avatar Model (Mannequin) rotated to face toward the right/center for direct eye contact with user
    gltfLoader.load("/models/avatar-model.glb", (gltf) => {
      if (isDisposed) return;

      avatarGroup = gltf.scene;
      avatarGroup.position.set(-1.6, -13, 0.6);
      avatarGroup.rotation.set(0, Math.PI / 2 + 0.28, 0); // Faces toward center/right to make eye contact with user

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

      // Soft contact shadow beneath avatar feet
      const avatarShadowGeom = new THREE.PlaneGeometry(1.5, 1.1);
      const avatarShadowMat = new THREE.ShaderMaterial({
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
          void main() {
            float dist = length((vUv - 0.5) * vec2(1.2, 1.8));
            float alpha = (1.0 - smoothstep(0.12, 0.48, dist)) * 0.35;
            gl_FragColor = vec4(0.02, 0.08, 0.1, alpha);
          }
        `,
      });
      avatarShadowMesh = new THREE.Mesh(avatarShadowGeom, avatarShadowMat);
      avatarShadowMesh.rotation.x = -Math.PI / 2;
      avatarShadowMesh.position.set(-1.6, -12.98, 0.6);
      avatarShadowMesh.renderOrder = -1;
      scene.add(avatarShadowMesh);

      // 5. Authentic Base Posture: Grounded standing folded-arms idle with silky smooth breathing
      mixer = new THREE.AnimationMixer(avatarGroup);
      const rawIdleClip = gltf.animations.find((a) => a.name === "contact-idle");
      if (rawIdleClip) {
        const contactIdleClip = createSmoothBreathingClip(rawIdleClip);
        contactIdleAction = mixer.clipAction(contactIdleClip);
        contactIdleAction.setLoop(THREE.LoopRepeat, Infinity);
        contactIdleAction.play();
        currentAction = contactIdleAction;
      }

      // Connect natural conversational gestures to chat events
      gestureHandlersRef.current.onUserSend = () => {
        lookMode = "user";
        if (faceUniformFrame) faceUniformFrame.value = 12;
        nodStartTime = clock.getElapsedTime(); // Conversational affirmative nod
      };

      gestureHandlersRef.current.onBotWritingStart = () => {
        lookMode = "board"; // Smoothly turn gaze towards whiteboard while writing
        if (faceUniformFrame) faceUniformFrame.value = 12;
      };

      gestureHandlersRef.current.onBotWritingEnd = () => {
        lookMode = "user"; // Smoothly return gaze to user to lock eye contact
        if (faceUniformFrame) faceUniformFrame.value = 12;
      };

      scene.add(avatarGroup);
      setLoading(false);
      onLoaded?.();
    });

    // 5.5 Whiteboard Model (low_poly_whiteboard.glb) on the right side of the room
    const whiteboardGroup = new THREE.Group();
    whiteboardGroup.position.set(2.4, -13, 0.1);
    whiteboardGroup.rotation.set(0, Math.PI / 2 - 0.12, 0); // Angled slightly towards avatar & camera
    whiteboardGroup.scale.set(1.24, 1.24, 1.24);
    scene.add(whiteboardGroup);

    // Anchor dummy object positioned precisely flush with the backboard face in local coordinates
    const chatAnchor = new THREE.Object3D();
    chatAnchor.position.set(-0.026, 2.47, 0);
    chatAnchor.rotation.set(0, -Math.PI / 2, 0);
    whiteboardGroup.add(chatAnchor);

    // Dimensions of the 3D dry-erase whiteboard canvas
    const elWidth = 840;
    const elHeight = 520;
    const elScale = 0.0031;

    // elementToLocal: shifts origin from top-left (0,0) to center, flips Y for CSS, and scales to 3D units
    const localTranslate = new THREE.Matrix4().makeTranslation(-elWidth / 2, -elHeight / 2, 0);
    // Note: inverting Z along with Y keeps the matrix determinant strictly positive so WebKit / Safari never culls it as back-facing
    const localScale = new THREE.Matrix4().makeScale(elScale, -elScale, -elScale);
    const elementToLocal = new THREE.Matrix4().multiplyMatrices(localScale, localTranslate);

    // Reusable matrices for 60fps screen projection without heap allocations
    const mWorld = new THREE.Matrix4();
    const viewMatrix = new THREE.Matrix4();
    const mvp = new THREE.Matrix4();
    const sMatrix = new THREE.Matrix4();
    const finalMatrix = new THREE.Matrix4();

    // Soft contact shadow beneath whiteboard wheels
    const wbShadowGeom = new THREE.PlaneGeometry(3.8, 1.8);
    const wbShadowMat = new THREE.ShaderMaterial({
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
        void main() {
          float dist = length((vUv - 0.5) * vec2(1.0, 2.0));
          float alpha = (1.0 - smoothstep(0.12, 0.48, dist)) * 0.24;
          gl_FragColor = vec4(0.024, 0.102, 0.118, alpha);
        }
      `,
    });
    const wbShadowMesh = new THREE.Mesh(wbShadowGeom, wbShadowMat);
    wbShadowMesh.rotation.x = -Math.PI / 2;
    wbShadowMesh.position.set(2.4, -12.98, 0.1);
    wbShadowMesh.renderOrder = -1;
    scene.add(wbShadowMesh);

    gltfLoader.load("/models/low_poly_whiteboard.glb", (gltf) => {
      if (isDisposed) return;
      const model = gltf.scene;

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (mesh.name.includes("Backboard")) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xfcfbf9,
              roughness: 0.18,
              metalness: 0.05,
            });
          } else if (
            mesh.name.includes("Sideboards") ||
            mesh.name.includes("Axles") ||
            mesh.name.includes("Marker")
          ) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xd0d5da,
              roughness: 0.35,
              metalness: 0.85,
            });
          } else if (mesh.name.includes("Stand") || mesh.name.includes("Undercarraige")) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x1e272c,
              roughness: 0.45,
              metalness: 0.65,
            });
          } else if (mesh.name.includes("Wheel") || mesh.name.includes("Corner")) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x0a1012,
              roughness: 0.75,
              metalness: 0.2,
            });
          }
        }
      });

      whiteboardGroup.add(model);
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

    // 7. Mouse Parallax (Mannequin turns smoothly with cursor, centered on eye contact)
    let targetRotY = Math.PI / 2 + 0.28;
    let targetRotX = 0;
    let normMouseX = 0;
    let normMouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      normMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      normMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const updateResponsiveState = () => {
      const mobile = window.innerWidth < 840;
      setIsMobile(mobile);
    };
    updateResponsiveState();

    let cachedWidth = container.clientWidth;
    let cachedHeight = container.clientHeight;

    // 8. Resize Handler
    const onResize = () => {
      if (!container) return;
      cachedWidth = container.clientWidth;
      cachedHeight = container.clientHeight;
      camera.aspect = cachedWidth / cachedHeight;
      updateCameraPosition();
      camera.updateProjectionMatrix();
      renderer.setSize(cachedWidth, cachedHeight);
      updateResponsiveState();
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

      // Smooth avatar parallax, dynamic gaze direction, and conversational nod
      if (avatarGroup) {
        if (lookMode === "board") {
          // Turned to the RIGHT towards the whiteboard (Math.PI / 2 + 0.65)
          const clampedMouseX = Math.max(-0.2, Math.min(0.5, normMouseX));
          targetRotY = (Math.PI / 2 + 0.65) + clampedMouseX * 0.05;
          targetRotX = normMouseY * 0.03;
        } else {
          // Centered on direct eye contact with visitor (Math.PI / 2 + 0.28)
          // Lower clamp on mouse X (-0.12) ensures mannequin NEVER swivels away to the left into dead space
          const clampedMouseX = Math.max(-0.12, Math.min(0.65, normMouseX));
          targetRotY = (Math.PI / 2 + 0.28) + clampedMouseX * 0.12;
          targetRotX = normMouseY * 0.06;
        }

        // Natural conversational affirmation nod on user send
        let nodOffset = 0;
        const elapsedSinceNod = clock.getElapsedTime() - nodStartTime;
        if (elapsedSinceNod >= 0 && elapsedSinceNod < 0.6) {
          nodOffset = Math.sin((elapsedSinceNod / 0.6) * Math.PI) * 0.045;
        }

        avatarGroup.rotation.y += (targetRotY - avatarGroup.rotation.y) * 0.05;
        avatarGroup.rotation.x += (targetRotX + nodOffset - avatarGroup.rotation.x) * 0.08;
      }

      // Smooth camera parallax for dynamic room perspective
      const baseCamX = 0;
      const baseCamY = isLandscape ? -8.5 : -8.2;
      const targetCamX = baseCamX + normMouseX * 0.35;
      const targetCamY = baseCamY - normMouseY * 0.20;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(baseCamX, isLandscape ? -10.5 : -9.6, 0);

      // CRITICAL FIX: Synchronize camera world and inverse matrices in the exact same frame
      camera.updateMatrixWorld(true);

      // Mathematically synchronize the whiteboard dry-erase chat overlay in 3D
      if (chatOverlayRef.current && container) {
        const isMobileScreen = window.innerWidth < 840;
        if (isMobileScreen) {
          chatOverlayRef.current.style.position = "absolute";
          chatOverlayRef.current.style.left = "16px";
          chatOverlayRef.current.style.right = "16px";
          chatOverlayRef.current.style.bottom = "80px";
          chatOverlayRef.current.style.top = "auto";
          chatOverlayRef.current.style.width = "calc(100% - 32px)";
          chatOverlayRef.current.style.maxWidth = "420px";
          chatOverlayRef.current.style.height = "320px";
          chatOverlayRef.current.style.transformOrigin = "center center";
          chatOverlayRef.current.style.webkitTransformOrigin = "center center";
          chatOverlayRef.current.style.transform = "none";
          chatOverlayRef.current.style.webkitTransform = "none";
          chatOverlayRef.current.style.opacity = "1";
        } else {
          const w = cachedWidth;
          const h = cachedHeight;

          // Compute exact 4x4 MVP viewport projection matrix
          chatAnchor.updateMatrixWorld(true);
          mWorld.multiplyMatrices(chatAnchor.matrixWorld, elementToLocal);
          viewMatrix.copy(camera.matrixWorldInverse);
          mvp.multiplyMatrices(camera.projectionMatrix, viewMatrix).multiply(mWorld);

          sMatrix.set(
            w / 2, 0, 0, w / 2,
            0, -h / 2, 0, h / 2,
            0, 0, 0.5, 0.5,
            0, 0, 0, 1
          );

          finalMatrix.multiplyMatrices(sMatrix, mvp);
          const el = finalMatrix.elements;
          const invM44 = 1 / el[15];

          chatOverlayRef.current.style.position = "absolute";
          chatOverlayRef.current.style.left = "0";
          chatOverlayRef.current.style.top = "0";
          chatOverlayRef.current.style.bottom = "auto";
          chatOverlayRef.current.style.right = "auto";
          chatOverlayRef.current.style.width = `${elWidth}px`;
          chatOverlayRef.current.style.height = `${elHeight}px`;
          chatOverlayRef.current.style.maxWidth = "none";
          chatOverlayRef.current.style.transformOrigin = "0 0";
          chatOverlayRef.current.style.webkitTransformOrigin = "0 0";
          const matrixStr = `matrix3d(${
            el[0] * invM44},${el[1] * invM44},${el[2] * invM44},${el[3] * invM44},${
            el[4] * invM44},${el[5] * invM44},${el[6] * invM44},${el[7] * invM44},${
            el[8] * invM44},${el[9] * invM44},${el[10] * invM44},${el[11] * invM44},${
            el[12] * invM44},${el[13] * invM44},${el[14] * invM44},1)`;
          chatOverlayRef.current.style.transform = matrixStr;
          chatOverlayRef.current.style.webkitTransform = matrixStr;
          chatOverlayRef.current.style.opacity = "1";
        }
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
      className={`absolute inset-0 size-full select-none ${className}`}
      style={{ touchAction: "none" }}
    >
      {/* 3D-Anchored Whiteboard Interactive Chatbot */}
      <div
        ref={chatOverlayRef}
        className={`pointer-events-auto transition-opacity duration-300 opacity-100 z-20 ${
          isMobile
            ? "bg-[#fcfbf9]/95 backdrop-blur-md rounded-2xl border-2 border-[#14191f]/20 shadow-xl overflow-hidden flex flex-col"
            : ""
        }`}
        style={{
          transformOrigin: "0 0",
          WebkitTransformOrigin: "0 0",
          transformStyle: "flat",
          backfaceVisibility: "visible",
          WebkitBackfaceVisibility: "visible",
          willChange: "transform",
        }}
      >
        <WhiteboardChatbot
          isMobile={isMobile}
          onUserSend={() => gestureHandlersRef.current.onUserSend?.()}
          onBotWritingStart={() => gestureHandlersRef.current.onBotWritingStart?.()}
          onBotWritingEnd={() => gestureHandlersRef.current.onBotWritingEnd?.()}
        />
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="size-8 rounded-full border-2 border-[#061a1e]/20 border-t-[#299093] animate-spin" />
        </div>
      )}
    </div>
  );
}
