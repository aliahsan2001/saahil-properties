/* Property detail: the building as a model you can turn. Hover a floor to highlight it, click to
   pick it. setFill(f) fills floors from the ground up with warm gold light, f = the share paid
   up front in the installment calculator. */

import * as THREE from 'three';
import { makeBuilding } from './building.js';

export function mountModel(canvas, { spec, mine = -9, onHover, onSelect }) {
  const wrap = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

  const b = makeBuilding(spec, { mode: 1 });
  const U = b.uniforms;
  U.uSky.value = spec.kind === 'house' ? 0.12 : 0.45;
  U.uLights.value = 0; // window lights read as noise at model scale
  U.uMine.value = mine;
  U.uSun.value.set(-0.5, 0.6, 0.7).normalize();
  scene.add(b.group);

  // a soft pool of light on the ground
  const g = document.createElement('canvas');
  g.width = g.height = 256;
  const gc = g.getContext('2d');
  const grd = gc.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(201,164,92,.28)');
  grd.addColorStop(0.45, 'rgba(201,164,92,.08)');
  grd.addColorStop(1, 'rgba(201,164,92,0)');
  gc.fillStyle = grd;
  gc.fillRect(0, 0, 256, 256);
  const floorDisc = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(g), transparent: true, depthWrite: false }));
  floorDisc.rotation.x = -Math.PI / 2;
  const span = Math.max(spec.plan[0], spec.plan[1]);
  floorDisc.scale.setScalar(span * (spec.kind === 'house' ? 3.2 : 4.2));
  scene.add(floorDisc);
  const ring = new THREE.Mesh(new THREE.RingGeometry(span * 1.25, span * 1.255, 96), new THREE.MeshBasicMaterial({ color: 0xc9a45c, transparent: true, opacity: 0.35 }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.005;
  scene.add(ring);

  /* ---------- camera framing ---------- */
  const H = b.height;
  const target = new THREE.Vector3(0, H * (spec.kind === 'house' ? 0.3 : 0.46), 0);
  const house = spec.kind === 'house';
  let dist = 10, yaw = 0.7, yawGoal = 0.7, pitch = house ? 0.42 : 0.18;
  function layout() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // fit the whole building with a margin
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const fitH = (H * (house ? 1.6 : 1.18)) / 2 / Math.tan(vfov / 2);
    const fitW = (span * (house ? 2.3 : 2.6)) / 2 / Math.tan(vfov / 2) / camera.aspect;
    dist = Math.max(fitH, fitW);
    kick();
  }

  /* ---------- picking ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const floorAt = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(b.mesh)[0];
    if (!hit) return -1;
    const f = b.mesh.geometry.attributes.aFloor.getX(hit.face.a);
    return f >= 0 && f < b.floors ? Math.round(f) : -1;
  };
  let hover = -1, drag = null, idleSpin = true;
  const onMove = (e) => {
    if (drag) {
      const dx = e.clientX - drag.x;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      yawGoal = drag.yaw - dx * 0.008;
      kick();
      return;
    }
    const f = floorAt(e);
    if (f !== hover) {
      hover = f;
      U.uHover.value = f;
      canvas.style.cursor = f >= 0 ? 'pointer' : 'grab';
      onHover?.(f, e);
      kick();
    } else if (f >= 0) onHover?.(f, e);
  };
  const onDown = (e) => { drag = { x: e.clientX, yaw: yawGoal, moved: 0 }; idleSpin = false; canvas.setPointerCapture?.(e.pointerId); };
  const onUp = (e) => {
    if (!drag) return;
    const click = drag.moved < 5;
    drag = null;
    if (click) { const f = floorAt(e); if (f >= 0) select(f); }
  };
  const onLeave = () => { if (!drag) { hover = -1; U.uHover.value = -9; onHover?.(-1); kick(); } };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointerleave', onLeave);

  function select(f) {
    U.uSel.value = f;
    onSelect?.(f);
    kick();
  }

  /* ---------- loop ---------- */
  let fillGoal = 0, raf = 0, last = performance.now(), visible = true, dead = false;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
  io.observe(wrap);
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); // rAF time can predate last
    last = now;
    U.uTime.value += dt;
    const k = 1 - Math.pow(0.004, dt);
    if (idleSpin) yawGoal += dt * 0.12;
    yaw += (yawGoal - yaw) * k;
    U.uFill.value += (fillGoal - U.uFill.value) * (1 - Math.pow(0.02, dt));
    camera.position.set(target.x + Math.sin(yaw) * dist * Math.cos(pitch), target.y + Math.sin(pitch) * dist, target.z + Math.cos(yaw) * dist * Math.cos(pitch));
    camera.lookAt(target);
    if (dead || renderer.getContext().isContextLost()) { raf = 0; return; } // context gone after a page change
    renderer.render(scene, camera);
    if (visible && !document.hidden && !dead) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
  function kick() { if (!raf && !dead) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  const onVis = () => !document.hidden && kick();
  document.addEventListener('visibilitychange', onVis);

  const ro = new ResizeObserver(layout);
  ro.observe(wrap);
  layout();
  frame(performance.now());
  canvas.classList.add('is-ready');

  return {
    floors: b.floors,
    setFill(f, instant = false) { fillGoal = f; if (instant || document.hidden) U.uFill.value = f; kick(); },
    select,
    dispose() {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => { m.map?.dispose(); m.dispose?.(); }); });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
