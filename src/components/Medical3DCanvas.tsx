import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Medical3DCanvasProps {
  interactive?: boolean;
}

export const Medical3DCanvas: React.FC<Medical3DCanvasProps> = ({ interactive = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c2f28, 0.08);

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x2dd4bf, 2.5);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xec4899, 2.0, 10);
    rimLight.position.set(0, 2, -2);
    scene.add(rimLight);

    const doctorTealLight = new THREE.PointLight(0x14b8a6, 3.0, 8);
    doctorTealLight.position.set(0, 0, 1.5);
    scene.add(doctorTealLight);

    // Root Assembly Group for gentle floating and rotation
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 3. Central 3D Medical Heart Model (Parametric / Extruded with Bevel)
    const heartShape = new THREE.Shape();
    // Heart path coordinates centered at origin
    heartShape.moveTo(0, 0.35);
    heartShape.bezierCurveTo(0, 0.65, -0.55, 0.85, -0.85, 0.55);
    heartShape.bezierCurveTo(-1.15, 0.25, -1.0, -0.25, -0.55, -0.65);
    heartShape.bezierCurveTo(-0.35, -0.85, 0, -1.2, 0, -1.35);
    heartShape.bezierCurveTo(0, -1.2, 0.35, -0.85, 0.55, -0.65);
    heartShape.bezierCurveTo(1.0, -0.25, 1.15, 0.25, 0.85, 0.55);
    heartShape.bezierCurveTo(0.55, 0.85, 0, 0.65, 0, 0.35);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.45,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 2,
      bevelSize: 0.18,
      bevelThickness: 0.18,
    };

    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeometry.center();

    // Deep Ruby / Crimson Medical Core Material
    const heartMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48,
      emissive: 0x9f1239,
      emissiveIntensity: 0.5,
      metalness: 0.15,
      roughness: 0.2,
      transmission: 0.2,
      thickness: 0.6,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
    });

    const heartMesh = new THREE.Mesh(heartGeometry, heartMaterial);
    heartMesh.scale.set(0.75, 0.75, 0.75);
    heartMesh.rotation.z = Math.PI; // Correct orientation
    mainGroup.add(heartMesh);

    // Holographic Diagnostic Wireframe overlay on the heart
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x5eead4,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const heartWireframe = new THREE.Mesh(heartGeometry, wireframeMaterial);
    heartWireframe.scale.set(0.77, 0.77, 0.77);
    heartWireframe.rotation.z = Math.PI;
    mainGroup.add(heartWireframe);

    // 4. Stethoscope Assembly
    const stethoscopeGroup = new THREE.Group();
    mainGroup.add(stethoscopeGroup);

    // Stethoscope Chest Piece (Bell & Diaphragm)
    const chestPieceGeometry = new THREE.CylinderGeometry(0.55, 0.65, 0.22, 32);
    const chestPieceMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.15,
    });
    const chestPiece = new THREE.Mesh(chestPieceGeometry, chestPieceMaterial);
    chestPiece.rotation.x = Math.PI / 2;
    chestPiece.position.set(0, -0.1, 0.6);
    stethoscopeGroup.add(chestPiece);

    // Diaphragm Rim Ring (Teal Clinic Accent)
    const rimGeometry = new THREE.TorusGeometry(0.66, 0.04, 16, 32);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      emissive: 0x0f766e,
      emissiveIntensity: 0.6,
      metalness: 0.5,
      roughness: 0.2,
    });
    const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
    rimMesh.position.set(0, -0.1, 0.72);
    stethoscopeGroup.add(rimMesh);

    // Stethoscope Stem
    const stemGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.45, 16);
    const stemMesh = new THREE.Mesh(stemGeometry, chestPieceMaterial);
    stemMesh.position.set(0, -0.7, 0.5);
    stemMesh.rotation.x = 0.3;
    stethoscopeGroup.add(stemMesh);

    // Flexible Medical PVC Tubing (Curving gracefully around the heart)
    const tubePoints = [
      new THREE.Vector3(0, -0.85, 0.45),
      new THREE.Vector3(-0.6, -1.25, 0.3),
      new THREE.Vector3(-1.3, -1.1, 0.0),
      new THREE.Vector3(-1.65, -0.3, -0.2),
      new THREE.Vector3(-1.5, 0.8, -0.3),
      new THREE.Vector3(-0.9, 1.45, -0.1),
      new THREE.Vector3(0, 1.6, 0.1),
      new THREE.Vector3(0.9, 1.45, -0.1),
      new THREE.Vector3(1.5, 0.8, -0.3),
      new THREE.Vector3(1.65, -0.3, -0.2),
      new THREE.Vector3(1.3, -1.1, 0.0),
      new THREE.Vector3(0.6, -1.25, 0.3),
      new THREE.Vector3(0, -0.85, 0.45),
    ];
    const tubeCurve = new THREE.CatmullRomCurve3(tubePoints, true);
    const tubeGeometry = new THREE.TubeGeometry(tubeCurve, 64, 0.075, 12, true);
    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.4,
      metalness: 0.2,
    });
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    stethoscopeGroup.add(tubeMesh);

    // 5. Orbiting Diagnostic Scanner Rings
    const scannerRingGroup = new THREE.Group();
    mainGroup.add(scannerRingGroup);

    const ringGeo1 = new THREE.TorusGeometry(1.6, 0.015, 16, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.7,
    });
    const scannerRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    scannerRing1.rotation.x = Math.PI / 3;
    scannerRing1.rotation.y = Math.PI / 6;
    scannerRingGroup.add(scannerRing1);

    const ringGeo2 = new THREE.TorusGeometry(1.85, 0.012, 16, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
    });
    const scannerRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    scannerRing2.rotation.x = -Math.PI / 4;
    scannerRing2.rotation.y = -Math.PI / 5;
    scannerRingGroup.add(scannerRing2);

    // 6. Double Helix DNA Strands (Medical Science Particles)
    const dnaGroup = new THREE.Group();
    mainGroup.add(dnaGroup);

    const helixPointsCount = 36;
    const helixRadius = 1.35;
    const helixHeight = 3.0;

    const sphereGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const dnaMat1 = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    const dnaMat2 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });

    for (let i = 0; i < helixPointsCount; i++) {
      const t = (i / helixPointsCount) * Math.PI * 3;
      const y = ((i / helixPointsCount) - 0.5) * helixHeight;

      // Strand A
      const pA = new THREE.Vector3(Math.cos(t) * helixRadius, y, Math.sin(t) * helixRadius);
      const meshA = new THREE.Mesh(sphereGeo, dnaMat1);
      meshA.position.copy(pA);
      dnaGroup.add(meshA);

      // Strand B (opposite)
      const pB = new THREE.Vector3(Math.cos(t + Math.PI) * helixRadius, y, Math.sin(t + Math.PI) * helixRadius);
      const meshB = new THREE.Mesh(sphereGeo, dnaMat2);
      meshB.position.copy(pB);
      dnaGroup.add(meshB);

      // Connecting rungs every 3rd point
      if (i % 3 === 0) {
        const rungCurve = new THREE.LineCurve3(pA, pB);
        const rungGeo = new THREE.TubeGeometry(rungCurve, 2, 0.012, 6, false);
        const rungMat = new THREE.MeshBasicMaterial({ color: 0x99f6e4, transparent: true, opacity: 0.35 });
        const rungMesh = new THREE.Mesh(rungGeo, rungMat);
        dnaGroup.add(rungMesh);
      }
    }

    // 7. Floating 3D Medical Crosses (Doctor & Healthcare Symbols)
    const crossesGroup = new THREE.Group();
    mainGroup.add(crossesGroup);

    const crossShape = new THREE.Shape();
    const w = 0.08;
    const l = 0.24;
    crossShape.moveTo(-w, -l);
    crossShape.lineTo(w, -l);
    crossShape.lineTo(w, -w);
    crossShape.lineTo(l, -w);
    crossShape.lineTo(l, w);
    crossShape.lineTo(w, w);
    crossShape.lineTo(w, l);
    crossShape.lineTo(-w, l);
    crossShape.lineTo(-w, w);
    crossShape.lineTo(-l, w);
    crossShape.lineTo(-l, -w);
    crossShape.lineTo(-w, -w);
    crossShape.closePath();

    const crossGeo = new THREE.ExtrudeGeometry(crossShape, { depth: 0.04, bevelEnabled: false });
    const crossMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.2,
    });

    const crossCount = 6;
    const crossMeshes: { mesh: THREE.Mesh; speed: number; rotSpeed: number; initY: number }[] = [];
    for (let i = 0; i < crossCount; i++) {
      const mesh = new THREE.Mesh(crossGeo, crossMat);
      const angle = (i / crossCount) * Math.PI * 2;
      const dist = 1.9 + Math.random() * 0.5;
      mesh.position.set(
        Math.cos(angle) * dist,
        (Math.random() - 0.5) * 2.2,
        Math.sin(angle) * dist
      );
      mesh.scale.set(0.6, 0.6, 0.6);
      crossesGroup.add(mesh);
      crossMeshes.push({
        mesh,
        speed: 0.6 + Math.random() * 0.5,
        rotSpeed: 0.8 + Math.random() * 0.8,
        initY: mesh.position.y,
      });
    }

    // 8. Ambient Bio-luminescent Background Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x5eead4,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 9. Interactive Mouse / Touch Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.35;
      targetY = y * 0.25;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!interactive || !e.touches[0]) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.35;
      targetY = y * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // 10. Animation Loop: Realistic Heartbeat & Medical Dynamics
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      camera.position.x = mouseX;
      camera.position.y = 0.2 + mouseY;
      camera.lookAt(0, 0, 0);

      // Gentle floating rotation of main medical group
      mainGroup.rotation.y = Math.sin(elapsedTime * 0.4) * 0.25 + (elapsedTime * 0.15);
      mainGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.08;

      // Realistic ECG Dual Heartbeat rhythm: Systole & Diastole (lub-dub)
      // Cycle period: ~0.9s (approx 67-70 bpm)
      const heartRate = 1.1; // frequency factor
      const phase = (elapsedTime * heartRate) % 1.0;
      let pulseScale = 1.0;

      if (phase < 0.12) {
        // First contraction (lub)
        pulseScale = 1.0 + Math.sin((phase / 0.12) * Math.PI) * 0.16;
      } else if (phase >= 0.18 && phase < 0.30) {
        // Second contraction (dub)
        pulseScale = 1.0 + Math.sin(((phase - 0.18) / 0.12) * Math.PI) * 0.09;
      }

      heartMesh.scale.set(0.75 * pulseScale, 0.75 * pulseScale, 0.75 * pulseScale);
      heartWireframe.scale.set(0.77 * pulseScale, 0.77 * pulseScale, 0.77 * pulseScale);
      doctorTealLight.intensity = 2.0 + (pulseScale - 1.0) * 8.0;

      // Diagnostic scanning rings counter-rotation
      scannerRing1.rotation.z += 0.015;
      scannerRing2.rotation.z -= 0.018;

      // DNA Helix continuous vertical spin
      dnaGroup.rotation.y = elapsedTime * 0.6;

      // Floating Medical Crosses bobbing and rotating
      crossMeshes.forEach((item, idx) => {
        item.mesh.position.y = item.initY + Math.sin(elapsedTime * item.speed + idx) * 0.15;
        item.mesh.rotation.y += 0.01 * item.rotSpeed;
        item.mesh.rotation.z += 0.008 * item.rotSpeed;
      });

      // Background ambient particles slow drift
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Handle Container Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Cleanup WebGL resources
      heartGeometry.dispose();
      heartMaterial.dispose();
      wireframeMaterial.dispose();
      chestPieceGeometry.dispose();
      chestPieceMaterial.dispose();
      rimGeometry.dispose();
      rimMaterial.dispose();
      stemGeometry.dispose();
      tubeGeometry.dispose();
      tubeMaterial.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      sphereGeo.dispose();
      dnaMat1.dispose();
      dnaMat2.dispose();
      crossGeo.dispose();
      crossMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center pointer-events-auto select-none"
      style={{ minHeight: '280px' }}
    />
  );
};
