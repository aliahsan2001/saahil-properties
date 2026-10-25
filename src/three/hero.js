/* Home hero: "From blueprint to skyline". A pencil sketch of a sea-facing tower draws itself
   on paper; as you scroll, colour climbs the tower, the paper becomes sky and sea, the glass
   picks up reflections and the evening lights come on. setProgress(p) drives it all (0..1). */

import * as THREE from 'three';
import { makeBuilding, buildCity, buildingMaterials } from './building.js';
import { BUILDINGS } from '../data.js';

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function mountHero(canvas, { small = false } = {}) {
  const wrap = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1500);

  /* ---------- the tower and the city ---------- */
  const tower = makeBuilding(BUILDINGS['sea-crest'], { sketchy: true });
  scene.add(tower.group);
  const U = tower.uniforms;
  const city = buildCity();
  const cityMats = buildingMaterials({ height: 14, floors: 1 });
  scene.add(new THREE.Mesh(city.solid, cityMats.solid));
  const cityLines = new THREE.LineSegments(city.edges, cityMats.edges);
  scene.add(cityLines);

  /* ---------- paper becomes sky ---------- */
  const bgU = { uBg: { value: 0 }, uSky: { value: 0 }, uHorizon: { value: 0.4 }, uAspect: { value: 1 }, uTime: { value: 0 } };
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: bgU, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform float uBg, uSky, uHorizon, uAspect, uTime; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        // paper: warm, with fibre grain and a faint drafting grid
        vec2 g = vUv * vec2(uAspect, 1.0) * 26.0;
        float grid = max(step(0.97, fract(g.x)), step(0.97, fract(g.y)));
        vec3 paper = vec3(0.953, 0.937, 0.902) - grid * 0.035 - hash(floor(vUv * 900.0)) * 0.025;
        // sky: day softens into dusk, warm at the horizon
        float t = smoothstep(uHorizon - 0.02, uHorizon + 0.55, vUv.y);
        vec3 day = mix(vec3(0.93, 0.9, 0.86), vec3(0.55, 0.68, 0.86), t);
        vec3 dusk = mix(vec3(0.98, 0.58, 0.34), mix(vec3(0.33, 0.22, 0.33), vec3(0.06, 0.07, 0.14), smoothstep(0.1, 0.7, t)), smoothstep(0.0, 0.35, t));
        vec3 sky = mix(day, dusk, uSky);
        // the sun sits low on the left
        vec2 sp = vec2(0.2, uHorizon + 0.06);
        float d = length((vUv - sp) * vec2(uAspect, 1.0));
        sky += vec3(1.0, 0.7, 0.4) * (exp(-d * 9.0) * 0.55 + smoothstep(0.03, 0.02, d) * 0.6) * uSky;
        // a few stars once it's dark
        float st = step(0.9985, hash(floor(vUv * vec2(uAspect, 1.0) * 300.0))) * smoothstep(0.75, 1.0, uSky) * smoothstep(uHorizon + 0.2, uHorizon + 0.6, vUv.y);
        sky += st * 0.7;
        gl_FragColor = vec4(mix(paper, sky, uBg), 1.0);
      }`,
  }));
  bg.frustumCulled = false;
  bg.renderOrder = -10;
  scene.add(bg);

  /* ---------- sea and shore ---------- */
  const seaU = { uColour: U.uColour, uSky: U.uSky, uLights: U.uLights, uTime: U.uTime, uDraw: U.uDraw };
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(500, 300, 1, 1), new THREE.ShaderMaterial({
    uniforms: seaU,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: /* glsl */ `
      uniform float uColour, uSky, uLights, uTime, uDraw; varying vec3 vW;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      void main(){
        vec3 V = normalize(cameraPosition - vW);
        float dist = length(vW.xz);
        // sketch: pencil strokes for water near the tower
        vec3 paper = vec3(0.953, 0.937, 0.902);
        float stroke = step(0.9, fract(vW.z * 0.9 + noise(vW.xz * 0.3) * 1.5)) * step(0.35, noise(vW.xz * vec2(0.15, 1.2)));
        vec3 pencil = paper - stroke * 0.22 * smoothstep(40.0, 6.0, dist) * step(0.0, uDraw);
        // render: waves, sky reflection, the sun's path and the tower's lights
        vec2 q = vW.xz * 0.35 + vec2(uTime * 0.08, uTime * 0.05);
        float fade = smoothstep(80.0, 10.0, length(vW.xz - cameraPosition.xz));
        vec3 N = normalize(vec3((noise(q * 3.0) - 0.5 + (noise(q * 9.0) - 0.5) * 0.5) * 0.16 * fade, 1.0, (noise(q * 3.0 + 7.0) - 0.5 + (noise(q * 9.0 + 3.0) - 0.5) * 0.5) * 0.16 * fade));
        vec3 R = reflect(-V, N);
        float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);
        float t = smoothstep(0.0, 0.6, R.y);
        vec3 skyR = mix(mix(vec3(0.93, 0.9, 0.86), vec3(0.55, 0.68, 0.86), t), mix(vec3(0.98, 0.58, 0.34), vec3(0.1, 0.12, 0.22), t), uSky);
        vec3 deep = mix(vec3(0.16, 0.3, 0.38), vec3(0.03, 0.06, 0.11), uSky);
        vec3 water = mix(deep, skyR, 0.14 + fres * 0.55);
        vec3 sun = normalize(vec3(-0.75, 0.08, -0.65));
        water += vec3(1.0, 0.68, 0.38) * pow(max(dot(R, sun), 0.0), 60.0) * (0.4 + uSky * 1.4);
        float streak = exp(-abs(vW.x) * 0.9) * smoothstep(30.0, 2.0, vW.z) * step(0.0, vW.z) * (0.6 + 0.4 * noise(vec2(vW.x * 3.0, vW.z * 0.6 - uTime)));
        water += vec3(1.0, 0.72, 0.4) * streak * uLights * 0.7;
        // colour spreads across the water from the tower outward
        float k = max(clamp((uColour * 140.0 - 10.0 - dist) / 12.0, 0.0, 1.0), smoothstep(0.55, 0.85, uColour));
        gl_FragColor = vec4(mix(pencil, water, k), 1.0);
      }`,
  }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(0, 0, 146);
  scene.add(sea);

  const land = new THREE.Mesh(new THREE.PlaneGeometry(2400, 1000), new THREE.ShaderMaterial({
    uniforms: seaU,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: /* glsl */ `
      uniform float uColour, uSky; varying vec3 vW;
      void main(){
        vec3 paper = vec3(0.953, 0.937, 0.902);
        float shore = smoothstep(-6.0, -1.0, vW.z);
        vec3 sand = mix(vec3(0.42, 0.4, 0.4), vec3(0.86, 0.78, 0.64), shore);
        vec3 col = mix(sand, sand * vec3(0.2, 0.17, 0.2), uSky);
        float k = max(clamp((uColour * 140.0 - 10.0 - length(vW.xz)) / 12.0, 0.0, 1.0), smoothstep(0.55, 0.85, uColour));
        gl_FragColor = vec4(mix(paper, col, k), 1.0);
      }`,
  }));
  land.rotation.x = -Math.PI / 2;
  land.position.set(0, 0.01, -500.5);
  scene.add(land);

  /* ---------- camera path ---------- */
  let wide = true;
  const path = { pos: null, look: null };
  function buildPath() {
    const end = wide ? { pos: [-11, 3.4, 30], look: [-4.6, 6.2, 0] } : { pos: [-5, 3.2, 36], look: [0, 7.4, 0] };
    const start = wide ? { pos: [-3.8, 1.8, 11.5], look: [-3.6, 7.2, 0] } : { pos: [0.6, 1.6, 14], look: [0, 7.6, 0] };
    path.pos = new THREE.CatmullRomCurve3([new THREE.Vector3(...start.pos), new THREE.Vector3(wide ? -6 : -2, 3, 19), new THREE.Vector3(...end.pos)]);
    path.look = new THREE.CatmullRomCurve3([new THREE.Vector3(...start.look), new THREE.Vector3(wide ? -4.2 : 0, 6.8, 0), new THREE.Vector3(...end.look)]);
  }

  let progress = 0;
  const goal = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  const cam = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  function setProgress(p, snap = false) {
    progress = p;
    const e = p * p * (3 - 2 * p);
    path.pos.getPoint(e, goal.pos);
    path.look.getPoint(e, goal.look);
    U.uColour.value = smooth(0.06, 0.5, p);
    U.uSky.value = smooth(0.42, 0.85, p);
    U.uLights.value = smooth(0.6, 0.92, p);
    cityMats.uniforms.uColour.value = U.uColour.value;
    cityMats.uniforms.uSky.value = U.uSky.value;
    cityMats.uniforms.uLights.value = U.uLights.value;
    bgU.uBg.value = smooth(0.12, 0.45, p);
    bgU.uSky.value = U.uSky.value;
    if (snap) { cam.pos.copy(goal.pos); cam.look.copy(goal.look); }
    kick();
  }

  function layout() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 52 : 40;
    camera.updateProjectionMatrix();
    bgU.uAspect.value = w / h;
    wide = w / h > 1.1;
    buildPath();
    setProgress(progress, true);
  }

  /* ---------- loop ---------- */
  const mouse = new THREE.Vector2(), sm = new THREE.Vector2();
  const onMove = (e) => mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  addEventListener('pointermove', onMove, { passive: true });
  const drawStart = performance.now();
  const horizon = new THREE.Vector3();
  let raf = 0, last = performance.now(), visible = true, dead = false;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
  io.observe(wrap);
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); // rAF time can predate last
    last = now;
    U.uTime.value += dt;
    bgU.uTime.value = U.uTime.value;
    // the pencil draws the tower from the ground up when the page opens
    const drawn = Math.min(1, (now - drawStart) / 2600);
    U.uDraw.value = cityMats.uniforms.uDraw.value = -1 + (tower.height + 2) * (1 - Math.pow(1 - drawn, 2));
    const k = 1 - Math.pow(0.02, dt);
    cam.pos.lerp(goal.pos, k);
    cam.look.lerp(goal.look, k);
    sm.lerp(mouse, 1 - Math.pow(0.1, dt));
    camera.position.set(cam.pos.x + sm.x * 0.8, cam.pos.y + sm.y * 0.4, cam.pos.z);
    camera.lookAt(cam.look);
    // where the horizon falls on screen, so the sky gradient lines up with the sea
    horizon.set(camera.position.x, 0, camera.position.z - 300).project(camera);
    bgU.uHorizon.value = horizon.y * 0.5 + 0.5;
    if (dead || renderer.getContext().isContextLost()) { raf = 0; return; } // context gone after a page change
    renderer.render(scene, camera);
    // the sea keeps moving, so animate whenever the hero is on screen
    if (visible && !document.hidden && !dead) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
  function kick() { if (!raf && !dead) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  const onVis = () => !document.hidden && kick();
  document.addEventListener('visibilitychange', onVis);
  // if frames stall, still show the finished sketch rather than blank paper
  const fallback = setTimeout(() => { if (!dead && U.uDraw.value < tower.height) { U.uDraw.value = 99; renderer.render(scene, camera); } }, 3200);

  const ro = new ResizeObserver(layout);
  ro.observe(wrap);
  layout();
  frame(performance.now());
  canvas.classList.add('is-ready');

  return {
    setProgress,
    dispose() {
      dead = true;
      clearTimeout(fallback);
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => m.dispose?.()); });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
