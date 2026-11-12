import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/**
 * One icon in real 3D: the fill weight extruded with a bevel, lit by a studio environment,
 * standing over a soft shadow. Drag to turn it; it sways on its own when `spin` is on.
 * Loaded only when someone opens the 3D style (three.js is the heaviest thing here).
 */

export type Material3D = 'clay' | 'glossy' | 'glass' | 'metal';
export const MATERIALS: { value: Material3D; label: string }[] = [
  { value: 'clay', label: 'Clay' }, { value: 'glossy', label: 'Glossy' }, { value: 'glass', label: 'Glass' }, { value: 'metal', label: 'Metal' },
];
export type Icon3DHandle = { png: (size?: number) => string | null };
type Props = { solid: string; color: string; material: Material3D; spin: boolean; className?: string };

type Stage = {
  renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera;
  group: THREE.Group; mesh: THREE.Mesh; controls: OrbitControls;
};

function geometryFor(solid: string) {
  const svg = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="${solid}"/></svg>`);
  const shapes = svg.paths.flatMap(p => SVGLoader.createShapes(p));
  const g = new THREE.ExtrudeGeometry(shapes, { depth: 26, bevelEnabled: true, bevelThickness: 6, bevelSize: 3, bevelSegments: 5, curveSegments: 12 });
  g.computeBoundingBox();
  const c = new THREE.Vector3(); g.boundingBox!.getCenter(c);
  const size = new THREE.Vector3(); g.boundingBox!.getSize(size);
  g.translate(-c.x, -c.y, -c.z);
  // SVG runs y down: turning half over about x puts it upright and keeps the faces facing out
  const s = 1.9 / Math.max(size.x, size.y);
  g.scale(s, -s, -s);
  return g;
}

function materialFor(kind: Material3D, color: string): THREE.Material {
  const c = new THREE.Color(color);
  if (kind === 'clay') return new THREE.MeshStandardMaterial({ color: c, roughness: 0.82, metalness: 0 });
  if (kind === 'glossy') return new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.24, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 });
  if (kind === 'metal') return new THREE.MeshStandardMaterial({ color: c.clone().lerp(new THREE.Color('#ffffff'), 0.3), roughness: 0.22, metalness: 1, envMapIntensity: 1.8 });
  // glass: see-through with bright edges (transmission needs something behind it; a transparent PNG has nothing)
  return new THREE.MeshPhysicalMaterial({
    color: c.clone().lerp(new THREE.Color('#ffffff'), 0.35), roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03,
    transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.6, specularIntensity: 1,
  });
}

const Icon3D = forwardRef<Icon3DHandle, Props>(function Icon3D({ solid, color, material, spin, className = '' }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<Stage | null>(null);
  const spinRef = useRef(spin);
  spinRef.current = spin;

  // the stage: built once
  useEffect(() => {
    const el = host.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // neutral keeps the chosen colour's hue and strength
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;cursor:grab';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.75;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0.6, 7);
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(2.5, 5, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 15 });
    key.shadow.radius = 8;
    scene.add(key);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.14 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.25;
    floor.receiveShadow = true;
    scene.add(floor);

    const group = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial());
    mesh.castShadow = true;
    group.add(mesh);
    scene.add(group);

    const controls = new OrbitControls(camera, renderer.domElement);
    Object.assign(controls, { enablePan: false, enableZoom: false, enableDamping: true, dampingFactor: 0.08, minPolarAngle: 0.5, maxPolarAngle: Math.PI / 2 - 0.08 });
    controls.addEventListener('start', () => { renderer.domElement.style.cursor = 'grabbing'; });
    controls.addEventListener('end', () => { renderer.domElement.style.cursor = 'grab'; });

    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();

    // a slow sway, not a spin: an icon is read from the front
    let raf = 0, t = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (spinRef.current) t += dt;
      group.rotation.y = Math.sin(t * 0.7) * 0.5;
      group.position.y = Math.sin(t * 1.4) * 0.04;
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    stage.current = { renderer, scene, camera, group, mesh, controls };
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      stage.current = null;
    };
  }, []);

  useEffect(() => {
    const s = stage.current; if (!s) return;
    s.mesh.geometry.dispose();
    s.mesh.geometry = geometryFor(solid);
  }, [solid]);

  useEffect(() => {
    const s = stage.current; if (!s) return;
    (s.mesh.material as THREE.Material).dispose();
    s.mesh.material = materialFor(material, color);
  }, [material, color]);

  useImperativeHandle(ref, () => ({
    // a square frame at the asked size, transparent around the icon
    png(size = 1024) {
      const s = stage.current; if (!s) return null;
      const { renderer, camera, scene } = s;
      const prev = new THREE.Vector2(); renderer.getSize(prev);
      const ratio = renderer.getPixelRatio(), aspect = camera.aspect;
      renderer.setPixelRatio(1);
      renderer.setSize(size, size, false);
      camera.aspect = 1; camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      const url = renderer.domElement.toDataURL('image/png');
      renderer.setPixelRatio(ratio);
      renderer.setSize(prev.x, prev.y, false);
      camera.aspect = aspect; camera.updateProjectionMatrix();
      return url;
    },
  }), []);

  return <div ref={host} className={className} />;
});

export default Icon3D;
