import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX, Heart, ZoomIn, ZoomOut } from 'lucide-react';

export interface Realistic3DHeartProps {
  size?: number;
  interactive?: boolean;
  className?: string;
  showTelemetry?: boolean;
  showSoundToggle?: boolean;
  bpm?: number;
  activeChamberId?: string | null;
  onChamberClick?: (chamberId: string) => void;
  showViewControls?: boolean;
  showEcgMonitor?: boolean;
}

/**
 * Creates ultra-realistic procedural anatomical textures for real human cardiac muscle:
 * 1. Deep oxblood/myocardial base with authentic spiral myofibril striations
 * 2. Epicardial adipose tissue (lobulated fat deposits in coronary and interventricular sulci)
 * 3. Micro-capillary vascular arborization (fine arterioles and venules)
 * 4. Microscopic fibrous bump texture for physical tissue relief
 */
function createAnatomicalCardiacTextures(): {
  colorTexture: THREE.CanvasTexture;
  bumpTexture: THREE.CanvasTexture;
  roughnessTexture: THREE.CanvasTexture;
} {
  const width = 1024;
  const height = 1024;

  // 1. Color Texture
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctx = colorCanvas.getContext('2d')!;

  // Deep biological myocardial base (Real human heart is dense oxblood/brownish-red, not candy red)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#36090e');    // Atrial base & sulcus
  bgGrad.addColorStop(0.24, '#4a0e16'); // AV groove region
  bgGrad.addColorStop(0.52, '#5e141e'); // Ventricular mid-body
  bgGrad.addColorStop(0.82, '#691823'); // Lower muscular body
  bgGrad.addColorStop(1, '#3a0a10');    // Apex tip
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Swirling helical muscle fibers (Torrent-Guasp helical ventricular band striations)
  ctx.lineWidth = 1.6;
  for (let i = 0; i < height; i += 3) {
    const yRatio = i / height;
    ctx.strokeStyle = yRatio < 0.3
      ? 'rgba(180, 24, 48, 0.16)'
      : 'rgba(215, 65, 85, 0.18)';
    ctx.beginPath();
    ctx.moveTo(0, i);
    // Helical vortex twist towards apex
    const wave = Math.sin(i * 0.04) * (20 + yRatio * 28);
    ctx.bezierCurveTo(
      width * 0.32, i + wave,
      width * 0.68, i - wave * 1.3,
      width, i + wave * 0.6
    );
    ctx.stroke();
  }

  // Inter-muscular bundle valleys (natural shadows between muscle fascicles)
  ctx.lineWidth = 2.0;
  ctx.strokeStyle = 'rgba(24, 3, 6, 0.35)';
  for (let i = 4; i < height; i += 8) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.bezierCurveTo(
      width * 0.35, i - Math.cos(i * 0.04) * 12,
      width * 0.65, i + Math.sin(i * 0.04) * 12,
      width, i
    );
    ctx.stroke();
  }

  // Epicardial Adipose (Fat Tissue) in AV groove (horizontal band near top)
  ctx.fillStyle = 'rgba(202, 148, 54, 0.52)';
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.26, width * 0.48, 44, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fatty deposits in Anterior Interventricular Sulcus (diagonal channel)
  ctx.strokeStyle = 'rgba(218, 165, 64, 0.48)';
  ctx.lineWidth = 34;
  ctx.beginPath();
  ctx.moveTo(width * 0.53, height * 0.22);
  ctx.bezierCurveTo(width * 0.48, height * 0.48, width * 0.44, height * 0.72, width * 0.37, height * 0.95);
  ctx.stroke();

  // Fine micro-vascular capillary bed (arborized coronary arterioles)
  ctx.strokeStyle = 'rgba(244, 165, 175, 0.40)';
  ctx.lineWidth = 1.0;
  for (let c = 0; c < 60; c++) {
    const startX = Math.random() * width;
    const startY = height * 0.18 + Math.random() * height * 0.78;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    const branchLen = 35 + Math.random() * 55;
    const angle = (Math.random() - 0.5) * 1.6;
    ctx.lineTo(startX + Math.sin(angle) * branchLen, startY + Math.cos(angle) * branchLen);
    ctx.stroke();
  }

  // 2. High-Frequency Tactile Bump Canvas (muscle relief)
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);

  // Microscopic muscular ridges
  for (let y = 0; y < 512; y += 2) {
    const noise = Math.floor(115 + Math.random() * 50);
    bCtx.fillStyle = `rgb(${noise},${noise},${noise})`;
    bCtx.fillRect(0, y, 512, 2);
  }

  // Sulcus depth groove in bump
  bCtx.lineWidth = 26;
  bCtx.strokeStyle = '#353535';
  bCtx.beginPath();
  bCtx.moveTo(260, 110);
  bCtx.bezierCurveTo(245, 240, 220, 370, 195, 480);
  bCtx.stroke();

  // 3. Roughness Canvas (Fat is matte, muscle has subtle moist sheen, sulci retain moisture)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const rCtx = roughCanvas.getContext('2d')!;
  rCtx.fillStyle = '#727272'; // baseline myocardial roughness ~0.45 (Natural moist organ, not rubber balloon!)
  rCtx.fillRect(0, 0, 512, 512);

  // Fat regions have higher roughness ~0.65
  rCtx.fillStyle = 'rgba(175, 175, 175, 0.7)';
  rCtx.beginPath();
  rCtx.ellipse(256, 135, 240, 32, 0, 0, Math.PI * 2);
  rCtx.fill();

  const colorTexture = new THREE.CanvasTexture(colorCanvas);
  colorTexture.wrapS = THREE.RepeatWrapping;
  colorTexture.wrapT = THREE.ClampToEdgeWrapping;
  colorTexture.colorSpace = THREE.SRGBColorSpace;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.ClampToEdgeWrapping;

  const roughnessTexture = new THREE.CanvasTexture(roughCanvas);
  roughnessTexture.wrapS = THREE.RepeatWrapping;
  roughnessTexture.wrapT = THREE.ClampToEdgeWrapping;

  return { colorTexture, bumpTexture, roughnessTexture };
}

/**
 * Authentic 3D Anatomical Human Heart
 * Eliminates balloon/toy appearance with:
 * - Real anatomical ventricular conical asymmetry with LV/RV demarcation
 * - Interventricular sulci, Atrioventricular groove, and clustered 3D Adipose (fat) pads
 * - Prominent Auricles (Left and Right Atrial Appendages) with notched pectinate margins
 * - Aortic Root with 3 distinct Sinuses of Valsalva (Aortic Bulb)
 * - True 3D Great Vessels (Ascending Aorta Arch + 3 branches, Pulmonary Trunk + Bifurcation, Vena Cava)
 * - 3D Coronary arterial tree in physical relief (LAD with diagonals, RCA, Circumflex, Great & Middle Cardiac Veins)
 * - Physiological Cardiac Wringing & Torsion (apex wrings, base pulls down, great vessels pulse)
 * - Continuous 360° turntable rotation with smooth user drag controls
 */
export const Realistic3DHeart: React.FC<Realistic3DHeartProps> = ({
  size = 220,
  interactive = true,
  className = '',
  showTelemetry = false,
  showSoundToggle = false,
  bpm = 72,
  activeChamberId = null,
  onChamberClick,
  showViewControls = false,
  showEcgMonitor = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ecgCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePreset, setActivePreset] = useState<'anterior' | 'posterior' | 'lateral' | 'superior'>('anterior');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundIntervalRef = useRef<number | null>(null);

  // Mouse & Touch interaction refs
  const isDraggingRef = useRef(false);
  const previousPointerPos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.12, y: 0.28 });
  const currentRotation = useRef({ x: 0.12, y: 0.28 });
  const targetScale = useRef(1);

  // Play realistic Lub-Dub stethoscopic heartbeat sound
  const playCardiacBeat = useCallback(() => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Lub (S1 - AV valve snap & muscular ventricular wall tension ~65Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(68, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 0.13);
      gain1.gain.setValueAtTime(0.28, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Dub (S2 - Semilunar aortic/pulmonary valve snap closure ~95Hz, 150ms later)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(98, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(40, now + 0.27);
      gain2.gain.setValueAtTime(0.22, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.3);
    } catch {
      // Audio autoplay policy handled smoothly
    }
  }, []);

  // Heartbeat sound loop
  useEffect(() => {
    if (isSoundOn) {
      playCardiacBeat();
      const interval = setInterval(playCardiacBeat, (60 / bpm) * 1000);
      soundIntervalRef.current = interval as any;
      return () => clearInterval(interval);
    } else if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
    }
  }, [isSoundOn, bpm, playCardiacBeat]);

  // Synchronized Real-Time ECG Waveform Canvas
  useEffect(() => {
    if (!showEcgMonitor) return;
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let ecgAnimId: number;
    const w = canvas.width;
    const h = canvas.height;
    const history: number[] = new Array(w).fill(h / 2);

    const drawEcg = () => {
      ecgAnimId = requestAnimationFrame(drawEcg);
      ctx.clearRect(0, 0, w, h);

      // ECG grid lines
      ctx.strokeStyle = 'rgba(13, 148, 136, 0.15)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 16) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 10) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Calculate instantaneous cardiac electrical potential
      const timeSec = performance.now() / 1000;
      const beatPeriod = 60 / bpm;
      const phase = (timeSec % beatPeriod) / beatPeriod; // 0 to 1

      let val = h / 2;
      // P wave (Atrial Depolarization)
      if (phase >= 0.08 && phase < 0.18) {
        val -= Math.sin(((phase - 0.08) / 0.1) * Math.PI) * 7;
      }
      // PR segment is flat
      // QRS Complex (Ventricular Depolarization)
      else if (phase >= 0.22 && phase < 0.24) {
        val += 4;
      } else if (phase >= 0.24 && phase < 0.29) {
        const rRatio = (phase - 0.24) / 0.05;
        val -= Math.sin(rRatio * Math.PI) * (h * 0.42);
      } else if (phase >= 0.29 && phase < 0.32) {
        val += 6;
      }
      // T wave (Ventricular Repolarization)
      else if (phase >= 0.40 && phase < 0.58) {
        val -= Math.sin(((phase - 0.4) / 0.18) * Math.PI) * 11;
      }

      history.shift();
      history.push(val);

      ctx.beginPath();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 6;
      for (let i = 0; i < history.length; i++) {
        if (i === 0) ctx.moveTo(i, history[i]);
        else ctx.lineTo(i, history[i]);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      const leadX = history.length - 1;
      const leadY = history[leadX];
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(leadX, leadY, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    drawEcg();
    return () => cancelAnimationFrame(ecgAnimId);
  }, [showEcgMonitor, bpm]);

  // Three.js Scene Setup & Anatomical Mesh Construction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    // 2. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(size, size);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
    } catch (e) {
      console.warn('WebGL init fallback:', e);
      return;
    }

    // 3. Clinical Surgical Theater Lighting (Balanced high-CRI illumination without glowing balloon light)
    const ambientLight = new THREE.AmbientLight(0x2d1418, 2.4);
    scene.add(ambientLight);

    // Primary High-CRI Overhead Surgical Spotlight
    const surgicalLight = new THREE.DirectionalLight(0xfff8f4, 3.2);
    surgicalLight.position.set(2.8, 4.5, 3.2);
    scene.add(surgicalLight);

    // Anterolateral Anatomic Fill
    const fillLight = new THREE.DirectionalLight(0xb45309, 1.1);
    fillLight.position.set(-2.5, 1.2, 2.8);
    scene.add(fillLight);

    // Delicate Posterior Cool Rim Light (Sharpens anatomical borders without plastic shine)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(-2.8, -1.5, -3.2);
    scene.add(rimLight);

    // 4. Root Groups
    const heartRootGroup = new THREE.Group();
    scene.add(heartRootGroup);

    const heartOrganMeshGroup = new THREE.Group();
    heartRootGroup.add(heartOrganMeshGroup);

    // Procedural Anatomical Textures
    const { colorTexture, bumpTexture, roughnessTexture } = createAnatomicalCardiacTextures();

    // =========================================================================
    // 4A. AUTHENTIC ANATOMICAL VENTRICULAR BODY (NOT A SPHERE!)
    // Sculpted with true Left Ventricle cone, Right Ventricle pocket & Conus Arteriosus
    // =========================================================================
    const vCols = 72;
    const vRows = 56;
    const ventriclesGeo = new THREE.SphereGeometry(1.0, vCols, vRows);
    const vPos = ventriclesGeo.attributes.position;

    for (let i = 0; i < vPos.count; i++) {
      let x = vPos.getX(i);
      let y = vPos.getY(i);
      let z = vPos.getZ(i);

      // Height factor w: 0 at Apex, 1 at Atrioventricular base
      const w = Math.max(0, Math.min(1, (y + 1.0) / 2.0));

      // 1. Organic conical taper (sharp muscular apex, broad muscular base)
      const taper = Math.pow(w, 0.48) * (1.15 - 0.22 * w);
      x *= taper * 0.94;
      y = (y - 0.08) * 1.14;
      z *= taper * 0.88;

      // 2. Antero-posterior flattening (A real heart is flattened front-to-back, NOT round like a balloon!)
      z *= 0.84;

      // 3. Left Ventricle Dominance (Muscular Apex is formed exclusively by LV pointing left & forward)
      if (x < 0) {
        // Thick lateral muscular wall of LV
        const lvFactor = Math.sin(Math.min(1, -x / 0.85) * Math.PI);
        x -= lvFactor * 0.16;
        z += lvFactor * 0.12 * (y < 0.2 ? 1.0 : 0.6);
      }

      // 4. Right Ventricle Crescent & Infundibulum (Conus Arteriosus)
      // The Conus is a smooth muscular funnel sweeping superiorly towards the pulmonary trunk
      if (x > 0) {
        if (y > 0.2 && z > 0) {
          // Conus arteriosus shoulder
          y += x * z * 0.22;
          z += x * 0.12;
        } else {
          // RV anterior pocket
          z += Math.sin(Math.min(1, x / 0.7) * Math.PI) * 0.10;
        }
      }

      // 5. Deep Anterior Interventricular Sulcus (LAD Groove - breaks the round sphere contour!)
      const antSulcusDist = Math.abs(x * 1.6 + y * 0.5);
      if (z > 0.05 && antSulcusDist < 0.26) {
        const indent = Math.cos((antSulcusDist / 0.26) * (Math.PI / 2)) * 0.11;
        z -= indent;
      }

      // 6. Deep Posterior Interventricular Sulcus (PDA Groove on diaphragmatic surface)
      const postSulcusDist = Math.abs(x * 1.7);
      if (z < -0.05 && postSulcusDist < 0.24) {
        const indent = Math.cos((postSulcusDist / 0.24) * (Math.PI / 2)) * 0.09;
        z += indent;
      }

      // 7. Atrioventricular (AV) Coronary Sulcus (Deep circumferential notch separating atria and ventricles)
      if (y > 0.44 && y < 0.74) {
        const avDepth = Math.sin(((y - 0.44) / 0.30) * Math.PI) * 0.09;
        x *= (1 - avDepth * 0.7);
        z *= (1 - avDepth * 0.7);
      }

      // 8. Natural Anatomical Apex Orientation (Points leftward, downward, and forward)
      if (y < -0.35) {
        const apexProg = Math.pow((-y - 0.35) / 0.75, 1.6);
        x -= apexProg * 0.18;
        z += apexProg * 0.12;
      }

      vPos.setXYZ(i, x, y, z);
    }
    ventriclesGeo.computeVertexNormals();

    // REAL BIOLOGICAL TISSUE MATERIAL (Eliminates high-gloss plastic/balloon shine!)
    const myocardiumMaterial = new THREE.MeshPhysicalMaterial({
      map: colorTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.045,
      roughnessMap: roughnessTexture,
      roughness: 0.46, // Semi-matte living muscular tissue (NOT 0.26 shiny plastic!)
      metalness: 0.01,
      clearcoat: 0.36, // Natural moist wet film (NOT 0.98 car paint/balloon!)
      clearcoatRoughness: 0.30,
      reflectivity: 0.35,
    });

    const ventriclesMesh = new THREE.Mesh(ventriclesGeo, myocardiumMaterial);
    heartOrganMeshGroup.add(ventriclesMesh);

    // =========================================================================
    // 4B. AURICULAR APPENDAGES & ATRIA (Pectinate wrinkles & crested ear flaps)
    // =========================================================================
    // Right Auricle (Characteristic triangular notched crested ear flap overlapping aortic root)
    const raGeo = new THREE.SphereGeometry(0.35, 26, 20);
    const raPos = raGeo.attributes.position;
    for (let i = 0; i < raPos.count; i++) {
      let x = raPos.getX(i);
      let y = raPos.getY(i);
      let z = raPos.getZ(i);
      // Crested pectinate ridges
      x *= 1.22 + Math.sin(y * 14) * 0.09;
      y *= 0.82;
      z *= 0.72 + Math.cos(x * 12) * 0.08;
      raPos.setXYZ(i, x, y, z);
    }
    raGeo.computeVertexNormals();
    const raMesh = new THREE.Mesh(raGeo, myocardiumMaterial);
    raMesh.position.set(0.36, 0.48, 0.26);
    raMesh.rotation.set(0.22, -0.42, -0.32);
    heartOrganMeshGroup.add(raMesh);

    // Left Auricle (Slender hook-shaped finger-like pouch clasping pulmonary trunk)
    const laGeo = new THREE.SphereGeometry(0.28, 24, 18);
    const laPos = laGeo.attributes.position;
    for (let i = 0; i < laPos.count; i++) {
      let x = laPos.getX(i);
      let y = laPos.getY(i);
      let z = laPos.getZ(i);
      x *= 0.78;
      y *= 1.15;
      z *= 1.35;
      laPos.setXYZ(i, x, y, z);
    }
    laGeo.computeVertexNormals();
    const laMesh = new THREE.Mesh(laGeo, myocardiumMaterial);
    laMesh.position.set(-0.40, 0.44, 0.14);
    laMesh.rotation.set(0.32, 0.52, 0.38);
    heartOrganMeshGroup.add(laMesh);

    // Right Atrial Body (Smooth posterior chamber between SVC & IVC)
    const raBodyGeo = new THREE.SphereGeometry(0.38, 20, 16);
    const raBodyMesh = new THREE.Mesh(raBodyGeo, myocardiumMaterial);
    raBodyMesh.scale.set(0.85, 1.25, 0.95);
    raBodyMesh.position.set(0.46, 0.42, -0.08);
    heartOrganMeshGroup.add(raBodyMesh);

    // Left Atrial Body (Posterior chamber receiving 4 pulmonary veins)
    const laBodyGeo = new THREE.SphereGeometry(0.42, 20, 16);
    const laBodyMesh = new THREE.Mesh(laBodyGeo, myocardiumMaterial);
    laBodyMesh.scale.set(1.15, 1.0, 0.90);
    laBodyMesh.position.set(-0.18, 0.46, -0.30);
    heartOrganMeshGroup.add(laBodyMesh);

    // =========================================================================
    // 4C. EPICARDIAL ADIPOSE TISSUE (Fat Pads in Sulci) - Key to Biological Realism!
    // =========================================================================
    const fatMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd4a84e, // Natural ochre-ivory biological adipose tissue
      roughness: 0.62, // Matte granular biological fat
      metalness: 0.01,
      clearcoat: 0.22,
      clearcoatRoughness: 0.35,
    });

    // AV Groove Fat Collar
    const avFatGeo = new THREE.TorusGeometry(0.72, 0.078, 14, 48);
    const avFatMesh = new THREE.Mesh(avFatGeo, fatMaterial);
    avFatMesh.rotation.x = Math.PI * 0.48;
    avFatMesh.rotation.y = 0.12;
    avFatMesh.position.set(0, 0.50, 0);
    heartOrganMeshGroup.add(avFatMesh);

    // Anterior Sulcus Fat Deposit along LAD
    const antFatCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.08, 0.48, 0.44),
      new THREE.Vector3(0.04, 0.20, 0.52),
      new THREE.Vector3(-0.02, -0.15, 0.46),
      new THREE.Vector3(-0.08, -0.48, 0.34),
    ]);
    const antFatGeo = new THREE.TubeGeometry(antFatCurve, 22, 0.058, 10, false);
    const antFatMesh = new THREE.Mesh(antFatGeo, fatMaterial);
    heartOrganMeshGroup.add(antFatMesh);

    // Apex Fat Cushion Cap
    const apexFatGeo = new THREE.SphereGeometry(0.18, 16, 12);
    const apexFatMesh = new THREE.Mesh(apexFatGeo, fatMaterial);
    apexFatMesh.scale.set(1.15, 0.65, 0.92);
    apexFatMesh.position.set(-0.17, -0.92, 0.16);
    heartOrganMeshGroup.add(apexFatMesh);

    // Posterior Interventricular Sulcus Fat Cushion
    const postFatCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.04, 0.46, -0.38),
      new THREE.Vector3(0.02, 0.16, -0.46),
      new THREE.Vector3(-0.04, -0.20, -0.42),
      new THREE.Vector3(-0.10, -0.55, -0.30),
    ]);
    const postFatGeo = new THREE.TubeGeometry(postFatCurve, 20, 0.054, 10, false);
    const postFatMesh = new THREE.Mesh(postFatGeo, fatMaterial);
    heartOrganMeshGroup.add(postFatMesh);

    // =========================================================================
    // 4D. TRUE 3D GREAT VESSELS (Arching Tubes with Sinuses of Valsalva & Branches)
    // =========================================================================

    // Aortic Material: Thick fibroelastic arterial wall (cream/pinkish-tan tint, not plastic red!)
    const aortaMat = new THREE.MeshPhysicalMaterial({
      color: 0xba6868, // Natural anatomical aorta tone
      roughness: 0.36,
      metalness: 0.02,
      clearcoat: 0.48,
      clearcoatRoughness: 0.22,
    });

    // 1. AORTIC BULB & SINUSES OF VALSALVA (3 Anatomical Bulges at Aortic Root)
    const sinusGeo1 = new THREE.SphereGeometry(0.13, 14, 12);
    const sinusMesh1 = new THREE.Mesh(sinusGeo1, aortaMat); // Right coronary sinus
    sinusMesh1.position.set(0.10, 0.40, 0.14);
    heartOrganMeshGroup.add(sinusMesh1);

    const sinusMesh2 = new THREE.Mesh(sinusGeo1, aortaMat); // Left coronary sinus
    sinusMesh2.position.set(-0.05, 0.40, 0.12);
    heartOrganMeshGroup.add(sinusMesh2);

    const sinusMesh3 = new THREE.Mesh(sinusGeo1, aortaMat); // Posterior non-coronary sinus
    sinusMesh3.position.set(0.02, 0.38, -0.04);
    heartOrganMeshGroup.add(sinusMesh3);

    // Ascending Aorta & Arch (Curves postero-superiorly and to the left)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.36, 0.08),
      new THREE.Vector3(0.06, 0.68, 0.04),
      new THREE.Vector3(-0.02, 0.98, -0.06),
      new THREE.Vector3(-0.18, 0.78, -0.22),
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 36, 0.165, 18, false);
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    heartOrganMeshGroup.add(aortaMesh);

    // Three Cephalic Branches emerging from Aortic Arch:
    // 1. Brachiocephalic Artery, 2. Left Common Carotid, 3. Left Subclavian
    const branchConfigs = [
      { pos: new THREE.Vector3(0.06, 0.96, -0.04), dir: new THREE.Vector3(0.08, 0.24, -0.02), r: 0.042, len: 0.24 },
      { pos: new THREE.Vector3(-0.01, 1.00, -0.08), dir: new THREE.Vector3(0.02, 0.26, -0.04), r: 0.036, len: 0.26 },
      { pos: new THREE.Vector3(-0.08, 0.96, -0.13), dir: new THREE.Vector3(-0.06, 0.24, -0.06), r: 0.034, len: 0.24 },
    ];
    branchConfigs.forEach((b) => {
      const bGeo = new THREE.CylinderGeometry(b.r * 0.85, b.r, b.len, 14);
      const bMesh = new THREE.Mesh(bGeo, aortaMat);
      bMesh.position.copy(b.pos);
      bMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.dir.clone().normalize());
      heartOrganMeshGroup.add(bMesh);
    });

    // 2. PULMONARY TRUNK & BIFURCATION (Arises anteriorly from RV infundibulum and crosses aorta)
    const pulmMat = new THREE.MeshPhysicalMaterial({
      color: 0x3d507a, // Deoxygenated deep venous/pulmonary slate blue
      roughness: 0.40,
      metalness: 0.02,
      clearcoat: 0.44,
      clearcoatRoughness: 0.24,
    });

    const pulmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.12, 0.28, 0.26),
      new THREE.Vector3(0.04, 0.62, 0.20),
      new THREE.Vector3(-0.06, 0.80, 0.04),
    ]);
    const pulmGeo = new THREE.TubeGeometry(pulmCurve, 26, 0.155, 18, false);
    const pulmMesh = new THREE.Mesh(pulmGeo, pulmMat);
    heartOrganMeshGroup.add(pulmMesh);

    // Left and Right Pulmonary Artery Branches
    const lpaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.80, 0.04),
      new THREE.Vector3(-0.32, 0.74, -0.10),
    ]);
    const lpaGeo = new THREE.TubeGeometry(lpaCurve, 14, 0.095, 12, false);
    const lpaMesh = new THREE.Mesh(lpaGeo, pulmMat);
    heartOrganMeshGroup.add(lpaMesh);

    const rpaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.80, 0.02),
      new THREE.Vector3(0.24, 0.75, -0.12),
      new THREE.Vector3(0.42, 0.70, -0.18),
    ]);
    const rpaGeo = new THREE.TubeGeometry(rpaCurve, 18, 0.095, 12, false);
    const rpaMesh = new THREE.Mesh(rpaGeo, pulmMat);
    heartOrganMeshGroup.add(rpaMesh);

    // 3. VENA CAVA (Superior & Inferior Vena Cava)
    const vcMat = new THREE.MeshPhysicalMaterial({
      color: 0x27395e, // Dark systemic venous blue
      roughness: 0.44,
      metalness: 0.02,
      clearcoat: 0.38,
      clearcoatRoughness: 0.25,
    });

    // Superior Vena Cava (SVC) entering Right Atrium from above
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.42, 0.52, -0.06),
      new THREE.Vector3(0.44, 0.88, -0.08),
    ]);
    const svcGeo = new THREE.TubeGeometry(svcCurve, 14, 0.105, 14, false);
    const svcMesh = new THREE.Mesh(svcGeo, vcMat);
    heartOrganMeshGroup.add(svcMesh);

    // Inferior Vena Cava (IVC) entering Right Atrium from below
    const ivcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.40, 0.22, -0.10),
      new THREE.Vector3(0.42, -0.14, -0.12),
    ]);
    const ivcGeo = new THREE.TubeGeometry(ivcCurve, 14, 0.10, 14, false);
    const ivcMesh = new THREE.Mesh(ivcGeo, vcMat);
    heartOrganMeshGroup.add(ivcMesh);

    // 4. PULMONARY VEINS (4 vessels entering Left Atrium posteriorly)
    const pvMat = new THREE.MeshPhysicalMaterial({
      color: 0x933842, // Oxygenated pulmonary venous red
      roughness: 0.40,
      metalness: 0.02,
      clearcoat: 0.40,
    });
    const pvPositions = [
      { start: new THREE.Vector3(-0.35, 0.56, -0.32), end: new THREE.Vector3(-0.52, 0.60, -0.36) }, // Left Superior
      { start: new THREE.Vector3(-0.35, 0.40, -0.32), end: new THREE.Vector3(-0.52, 0.38, -0.36) }, // Left Inferior
      { start: new THREE.Vector3(0.04, 0.54, -0.32), end: new THREE.Vector3(0.20, 0.58, -0.36) },  // Right Superior
      { start: new THREE.Vector3(0.04, 0.38, -0.32), end: new THREE.Vector3(0.20, 0.36, -0.36) },  // Right Inferior
    ];
    pvPositions.forEach((pv) => {
      const curve = new THREE.CatmullRomCurve3([pv.start, pv.end]);
      const geo = new THREE.TubeGeometry(curve, 10, 0.048, 10, false);
      const mesh = new THREE.Mesh(geo, pvMat);
      heartOrganMeshGroup.add(mesh);
    });

    // =========================================================================
    // 4E. 3D CORONARY ARTERY & VEIN TREE (Physical Relief in Sulci)
    // =========================================================================
    const coronaryArteryMat = new THREE.MeshPhysicalMaterial({
      color: 0xd62828, // Bright oxygenated arterial scarlet
      roughness: 0.32,
      metalness: 0.03,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18,
    });

    const veinMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8, // Venous deep blue
      roughness: 0.34,
      metalness: 0.03,
      clearcoat: 0.60,
      clearcoatRoughness: 0.20,
    });

    // Left Anterior Descending Artery (LAD - "Widowmaker")
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 0.46, 0.46),
      new THREE.Vector3(0.02, 0.22, 0.54),
      new THREE.Vector3(-0.03, -0.10, 0.48),
      new THREE.Vector3(-0.08, -0.44, 0.36),
      new THREE.Vector3(-0.14, -0.74, 0.22),
    ]);
    const ladGeo = new THREE.TubeGeometry(ladCurve, 32, 0.025, 8, false);
    const ladMesh = new THREE.Mesh(ladGeo, coronaryArteryMat);
    heartOrganMeshGroup.add(ladMesh);

    // Diagonal Branch 1 (D1)
    const d1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.18, 0.52),
      new THREE.Vector3(-0.16, 0.06, 0.50),
      new THREE.Vector3(-0.28, -0.06, 0.42),
    ]);
    const d1Geo = new THREE.TubeGeometry(d1Curve, 16, 0.016, 8, false);
    const d1Mesh = new THREE.Mesh(d1Geo, coronaryArteryMat);
    heartOrganMeshGroup.add(d1Mesh);

    // Diagonal Branch 2 (D2)
    const d2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, -0.18, 0.46),
      new THREE.Vector3(-0.20, -0.30, 0.38),
    ]);
    const d2Geo = new THREE.TubeGeometry(d2Curve, 14, 0.014, 8, false);
    const d2Mesh = new THREE.Mesh(d2Geo, coronaryArteryMat);
    heartOrganMeshGroup.add(d2Mesh);

    // Right Coronary Artery (RCA) running in right AV groove
    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.12, 0.44, 0.32),
      new THREE.Vector3(0.36, 0.40, 0.22),
      new THREE.Vector3(0.46, 0.24, 0.06),
      new THREE.Vector3(0.44, -0.05, -0.10),
      new THREE.Vector3(0.32, -0.28, -0.24),
    ]);
    const rcaGeo = new THREE.TubeGeometry(rcaCurve, 32, 0.024, 8, false);
    const rcaMesh = new THREE.Mesh(rcaGeo, coronaryArteryMat);
    heartOrganMeshGroup.add(rcaMesh);

    // Great Cardiac Vein (GCV - running alongside LAD)
    const gcvCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.10, -0.56, 0.30),
      new THREE.Vector3(-0.06, -0.16, 0.46),
      new THREE.Vector3(0.00, 0.24, 0.50),
      new THREE.Vector3(0.04, 0.46, 0.42),
      new THREE.Vector3(-0.14, 0.48, 0.32),
    ]);
    const gcvGeo = new THREE.TubeGeometry(gcvCurve, 30, 0.022, 8, false);
    const gcvMesh = new THREE.Mesh(gcvGeo, veinMat);
    heartOrganMeshGroup.add(gcvMesh);

    // Left Circumflex Artery (LCx) traveling in Left AV Sulcus
    const lcxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.42, 0.38),
      new THREE.Vector3(-0.35, 0.46, 0.22),
      new THREE.Vector3(-0.48, 0.42, -0.10),
      new THREE.Vector3(-0.36, 0.38, -0.32),
    ]);
    const lcxGeo = new THREE.TubeGeometry(lcxCurve, 24, 0.022, 8, false);
    const lcxMesh = new THREE.Mesh(lcxGeo, coronaryArteryMat);
    heartOrganMeshGroup.add(lcxMesh);

    // Posterior Descending Artery (PDA) in Posterior Interventricular Sulcus
    const pdaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.04, 0.42, -0.38),
      new THREE.Vector3(0.02, 0.14, -0.48),
      new THREE.Vector3(-0.03, -0.20, -0.44),
      new THREE.Vector3(-0.07, -0.52, -0.32),
      new THREE.Vector3(-0.11, -0.78, -0.16),
    ]);
    const pdaGeo = new THREE.TubeGeometry(pdaCurve, 28, 0.022, 8, false);
    const pdaMesh = new THREE.Mesh(pdaGeo, coronaryArteryMat);
    heartOrganMeshGroup.add(pdaMesh);

    // Coronary Sinus (CS) - Major Posterior Venous Trunk (collecting into Right Atrium)
    const csCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.36, 0.40, -0.26),
      new THREE.Vector3(-0.16, 0.44, -0.40),
      new THREE.Vector3(0.12, 0.46, -0.38),
      new THREE.Vector3(0.32, 0.42, -0.24),
    ]);
    const csGeo = new THREE.TubeGeometry(csCurve, 26, 0.038, 10, false);
    const csMesh = new THREE.Mesh(csGeo, veinMat);
    heartOrganMeshGroup.add(csMesh);

    // Middle Cardiac Vein (accompanying PDA in Posterior Sulcus)
    const mcvCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 0.38, -0.38),
      new THREE.Vector3(0.04, 0.10, -0.46),
      new THREE.Vector3(-0.01, -0.22, -0.42),
      new THREE.Vector3(-0.05, -0.52, -0.30),
    ]);
    const mcvGeo = new THREE.TubeGeometry(mcvCurve, 24, 0.020, 8, false);
    const mcvMesh = new THREE.Mesh(mcvGeo, veinMat);
    heartOrganMeshGroup.add(mcvMesh);

    heartOrganMeshGroup.position.set(0, -0.06, 0);

    // =========================================================================
    // 5. PHYSIOLOGICAL CARDIAC WRINGING & TORSION LOOP (NOT a balloon!)
    // Muscular transverse squeeze, longitudinal base-to-apex shortening & helical wring
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Cardiac cycle timing: period = 60 / bpm
      const cardiacFreq = (bpm / 60) * Math.PI * 2;
      const phase = (elapsedTime * cardiacFreq) % (Math.PI * 2);

      // Physiological Wiggers waveform computation:
      let systolicWring = 0;
      let apexTorsion = 0;
      let baseShortening = 0;
      let greatVesselPulse = 0;

      if (phase < 0.35) {
        // Atrial Kick & End-diastolic filling
        const p1 = phase / 0.35;
        systolicWring = Math.sin(p1 * Math.PI) * 0.03;
        apexTorsion = Math.sin(p1 * Math.PI) * 0.008;
      } else if (phase >= 0.35 && phase < 1.30) {
        // Ventricular Systole (LUB! - S1)
        // True muscular wringing: apex twists, base descends, transverse muscular squeeze
        const p2 = (phase - 0.35) / 0.95;
        const wave = Math.sin(p2 * Math.PI);
        systolicWring = Math.pow(wave, 1.4) * 0.14;
        apexTorsion = -Math.pow(wave, 1.3) * 0.08; // Helical torsion ~10 degrees
        baseShortening = systolicWring * 0.10;       // Base descends toward apex
        greatVesselPulse = Math.pow(wave, 1.6) * 0.08; // Aorta expands with ejected blood
      } else if (phase >= 1.30 && phase < 1.95) {
        // Semilunar Valve Closure & Elastic Untwisting Recoil (DUB! - S2)
        const p3 = (phase - 1.30) / 0.65;
        const rebound = Math.sin(p3 * Math.PI);
        systolicWring = Math.pow(rebound, 1.5) * 0.06;
        apexTorsion = Math.pow(rebound, 1.3) * 0.025;
        baseShortening = systolicWring * 0.05;
      }

      // TRUE MUSCULAR CARDIAC WRINGING (NO BALLOON INFLATION!):
      // Transverse ventricular contraction (narrowing slightly during squeeze)
      ventriclesMesh.scale.x = 1.0 - systolicWring * 0.18;
      ventriclesMesh.scale.z = 1.0 - systolicWring * 0.14;
      // Base descends slightly towards apex
      ventriclesMesh.position.y = -baseShortening;

      // Helical apex torsion (organic anatomical wringing)
      heartOrganMeshGroup.rotation.z = apexTorsion;

      // Great Vessels Pulse with ejected blood bolus
      aortaMesh.scale.set(1.0 + greatVesselPulse, 1.0 + greatVesselPulse * 0.3, 1.0 + greatVesselPulse);
      pulmMesh.scale.set(1.0 + greatVesselPulse * 0.7, 1.0 + greatVesselPulse * 0.2, 1.0 + greatVesselPulse * 0.7);

      // Camera / Model Smooth Zoom
      targetScale.current += (zoomLevel - targetScale.current) * 0.15;
      heartRootGroup.scale.setScalar(targetScale.current);

      // 360 DEGREE CONTINUOUS TURNTABLE ROTATION
      if (!isDraggingRef.current) {
        targetRotation.current.y += 0.0085;
        currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.16;
        currentRotation.current.x = THREE.MathUtils.lerp(
          currentRotation.current.x,
          targetRotation.current.x + Math.sin(elapsedTime * 0.75) * 0.030,
          0.10
        );
      } else {
        currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.35;
        currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.35;
      }

      heartRootGroup.rotation.x = currentRotation.current.x;
      heartRootGroup.rotation.y = currentRotation.current.y;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      colorTexture.dispose();
      bumpTexture.dispose();
      roughnessTexture.dispose();
      ventriclesGeo.dispose();
      myocardiumMaterial.dispose();
      raGeo.dispose();
      laGeo.dispose();
      raBodyGeo.dispose();
      laBodyGeo.dispose();
      fatMaterial.dispose();
      avFatGeo.dispose();
      antFatGeo.dispose();
      postFatGeo.dispose();
      apexFatGeo.dispose();
      aortaGeo.dispose();
      aortaMat.dispose();
      sinusGeo1.dispose();
      pulmGeo.dispose();
      pulmMat.dispose();
      lpaGeo.dispose();
      rpaGeo.dispose();
      svcGeo.dispose();
      ivcGeo.dispose();
      vcMat.dispose();
      pvMat.dispose();
      coronaryArteryMat.dispose();
      ladGeo.dispose();
      d1Geo.dispose();
      d2Geo.dispose();
      rcaGeo.dispose();
      lcxGeo.dispose();
      pdaGeo.dispose();
      csGeo.dispose();
      mcvGeo.dispose();
      gcvGeo.dispose();
      veinMat.dispose();
    };
  }, [size, bpm, zoomLevel]);

  // Pointer & Touch Drag Handlers (Smooth 360 rotation)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    previousPointerPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !isDraggingRef.current) return;

    const deltaX = e.clientX - previousPointerPos.current.x;
    const deltaY = e.clientY - previousPointerPos.current.y;

    previousPointerPos.current = { x: e.clientX, y: e.clientY };

    const speed = 0.007;
    targetRotation.current.y += deltaX * speed;
    targetRotation.current.x += deltaY * speed;

    targetRotation.current.x = Math.max(-0.85, Math.min(0.85, targetRotation.current.x));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // View Presets Handler
  const handleSetPreset = (preset: 'anterior' | 'posterior' | 'lateral' | 'superior') => {
    setActivePreset(preset);
    if (preset === 'anterior') {
      targetRotation.current = { x: 0.12, y: 0.28 };
    } else if (preset === 'posterior') {
      targetRotation.current = { x: 0.12, y: Math.PI + 0.28 };
    } else if (preset === 'lateral') {
      targetRotation.current = { x: 0.12, y: Math.PI * 0.5 + 0.28 };
    } else if (preset === 'superior') {
      targetRotation.current = { x: 0.85, y: 0.28 };
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Subtle soft-focus surgical cavity depth glow */}
      <div
        className="absolute inset-0 m-auto w-[76%] h-[76%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(180, 24, 48, 0.26) 0%, rgba(120, 15, 30, 0.14) 45%, transparent 75%)',
          filter: 'blur(30px)',
          transform: 'translateZ(0)',
          animation: 'pulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />

      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`w-full h-full object-contain ${
          interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
        }`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          touchAction: 'none',
        }}
      />

      {/* Floating View Presets Toolbar (Anterior / Posterior / Lateral / Superior) */}
      {showViewControls && (
        <div className="absolute top-2 left-2 flex items-center gap-1 p-1 rounded-lg bg-teal-950/85 border border-teal-700/60 backdrop-blur-md z-20 shadow-md">
          <button
            type="button"
            onClick={() => handleSetPreset('anterior')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              activePreset === 'anterior'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-teal-300 hover:text-white'
            }`}
            title="Anterior (Front) View"
          >
            Ant
          </button>
          <button
            type="button"
            onClick={() => handleSetPreset('posterior')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              activePreset === 'posterior'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-teal-300 hover:text-white'
            }`}
            title="Posterior (Back) View"
          >
            Post
          </button>
          <button
            type="button"
            onClick={() => handleSetPreset('lateral')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              activePreset === 'lateral'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-teal-300 hover:text-white'
            }`}
            title="Left Lateral View"
          >
            Lat
          </button>
          <button
            type="button"
            onClick={() => handleSetPreset('superior')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              activePreset === 'superior'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-teal-300 hover:text-white'
            }`}
            title="Superior (Great Vessels) View"
          >
            Sup
          </button>
        </div>
      )}

      {/* Zoom Controls (+ / -) */}
      {showViewControls && (
        <div className="absolute top-2 right-12 flex items-center gap-0.5 p-0.5 rounded-lg bg-teal-950/85 border border-teal-700/60 backdrop-blur-md z-20 shadow-md">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="p-1 rounded text-teal-300 hover:text-white hover:bg-teal-900/60"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.1))}
            className="p-1 rounded text-teal-300 hover:text-white hover:bg-teal-900/60"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Stethoscope Sound Toggle */}
      {showSoundToggle && (
        <button
          type="button"
          onClick={() => setIsSoundOn(!isSoundOn)}
          title={isSoundOn ? 'Mute Heartbeat Sound' : 'Play Stethoscope Heartbeat Sound'}
          className={`absolute top-2 right-2 p-1.5 rounded-full border transition-all cursor-pointer shadow-md active:scale-95 z-20 backdrop-blur-xs ${
            isSoundOn
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-cyan-500/50 shadow-sm'
              : 'bg-teal-950/80 hover:bg-teal-900 border-teal-700/60 text-teal-300 hover:text-white'
          }`}
        >
          {isSoundOn ? (
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* Real-Time Synchronized ECG Lead Strip */}
      {showEcgMonitor && (
        <div className="absolute bottom-2 inset-x-3 h-10 rounded-lg bg-teal-950/90 border border-teal-700/60 overflow-hidden backdrop-blur-md z-20 shadow-lg flex items-center px-1">
          <canvas
            ref={ecgCanvasRef}
            width={260}
            height={36}
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>
      )}

      {/* Cardiac Rhythm Status Pill */}
      {showTelemetry && !showEcgMonitor && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-950/85 border border-teal-700/50 text-[10px] font-mono text-cyan-300 pointer-events-none backdrop-blur-xs z-20">
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
          <span>{bpm} BPM</span>
        </div>
      )}
    </div>
  );
};
