/* Procedural buildings and the one material that draws them.
   The material blends between an architect's pencil sketch (paper, hatching, graphite edges)
   and a finished render (stone, reflective glass, evening window lights). A colour wipe climbs
   the building as uColour goes 0 -> 1. In model mode it can also fill floors with gold light
   (the installment share), highlight a hovered floor and mark the selected one. */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const FLOOR_H = 0.34;
const PODIUM_H = 0.9;

function roundedRect(w, d, r) {
  const s = new THREE.Shape(), x = w / 2, z = d / 2;
  s.moveTo(-x + r, -z);
  s.lineTo(x - r, -z); s.absarc(x - r, -z + r, r, -Math.PI / 2, 0);
  s.lineTo(x, z - r); s.absarc(x - r, z - r, r, 0, Math.PI / 2);
  s.lineTo(-x + r, z); s.absarc(-x + r, z - r, r, Math.PI / 2, Math.PI);
  s.lineTo(-x, -z + r); s.absarc(-x + r, -z + r, r, Math.PI, Math.PI * 1.5);
  return s;
}

// an extruded footprint standing up the y axis, from y = 0 to y = h
function slabGeo(w, d, r, h) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w, d, r), { depth: h, bevelEnabled: false, curveSegments: 7 });
  g.rotateX(-Math.PI / 2);
  return g;
}

function tag(g, floor, part) {
  const n = g.attributes.position.count;
  g.setAttribute('aFloor', new THREE.Float32BufferAttribute(new Float32Array(n).fill(floor), 1));
  g.setAttribute('aPart', new THREE.Float32BufferAttribute(new Float32Array(n).fill(part), 1));
  return g;
}

/* parts: 0 stone, 1 glass, 2 distant city */
function collector() {
  const solids = [], edges = [];
  return {
    add(geo, floor, part, matrix, withEdges = true) {
      if (matrix) geo.applyMatrix4(matrix);
      let g = geo.index ? geo.toNonIndexed() : geo;
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      g = tag(g, floor, part);
      solids.push(g);
      if (withEdges) edges.push(tag(new THREE.EdgesGeometry(g, 28), floor, part));
    },
    done() {
      return { solid: mergeGeometries(solids), edges: mergeGeometries(edges) };
    },
  };
}

export function buildTower({ floors, twist = 0, plan: [w, d] }) {
  const c = collector();
  const r = Math.min(w, d) * 0.38;
  const m = new THREE.Matrix4();
  // podium
  c.add(slabGeo(w * 1.75, d * 1.9, r * 0.6, PODIUM_H - 0.08), -1, 0);
  c.add(slabGeo(w * 1.62, d * 1.78, r * 0.55, 0.42), -1, 1, m.clone().makeTranslation(0, 0.22, 0));
  // floors: a stone slab, then a band of glass, each turned a little further than the last
  for (let f = 0; f < floors; f++) {
    const y = PODIUM_H + f * FLOOR_H;
    const turn = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(f * twist));
    c.add(slabGeo(w * 1.1, d * 1.1, r * 1.1, 0.055), f, 0, turn.clone().premultiply(new THREE.Matrix4().makeTranslation(0, y, 0)));
    c.add(slabGeo(w * 0.95, d * 0.95, r * 0.95, FLOOR_H - 0.055), f, 1, turn.clone().premultiply(new THREE.Matrix4().makeTranslation(0, y + 0.055, 0)));
  }
  // crown: a roof slab and two fins
  const top = PODIUM_H + floors * FLOOR_H;
  const turn = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(floors * twist));
  c.add(slabGeo(w * 1.12, d * 1.12, r * 1.1, 0.12), floors, 0, turn.clone().premultiply(new THREE.Matrix4().makeTranslation(0, top, 0)));
  [-1, 1].forEach((s) => {
    const fin = new THREE.BoxGeometry(0.07, 1.0, d * 0.55);
    fin.translate(s * w * 0.3, top + 0.6, 0);
    c.add(fin, floors, 0, turn);
  });
  return { ...c.done(), height: top + 1.6, floors };
}

// a modern villa: stacked, offset volumes with glass fronts
export function buildHouse({ floors, plan: [w, d] }) {
  const c = collector();
  const box = (bw, bh, bd, x, y, z, floor, part) => { const g = new THREE.BoxGeometry(bw, bh, bd); g.translate(x, y + bh / 2, z); c.add(g, floor, part); };
  const H = 1.15;
  box(w * 1.5, 0.12, d * 1.6, 0, 0, 0, -1, 0); // plinth
  // ground floor: mostly glass behind a stone frame
  box(w, 0.1, d, 0, 0.12, 0, 0, 0);
  box(w * 0.96, H - 0.1, d * 0.92, 0, 0.22, 0, 0, 1);
  box(0.18, H, d * 0.96, -w / 2 + 0.09, 0.12, 0, 0, 0);
  // first floor cantilevers out to one side, stone with a glass strip
  const x1 = w * 0.18;
  box(w * 0.86, 0.14, d * 1.04, x1, 0.12 + H, 0, 1, 0);
  box(w * 0.82, H - 0.14, d * 0.9, x1, 0.26 + H, 0, 1, 0);
  box(w * 0.6, H * 0.62, 0.06, x1 + w * 0.06, 0.42 + H, d * 0.45 + 0.02, 1, 1);
  box(w * 0.86, 0.12, d * 1.04, x1, 0.12 + H * 2, 0, floors > 2 ? 2 : 1, 0); // roof
  if (floors > 2) {
    box(w * 0.42, H - 0.2, d * 0.7, -w * 0.18, 0.24 + H * 2, -d * 0.08, 2, 1);
    box(w * 0.5, 0.1, d * 0.8, -w * 0.18, 0.04 + H * 3 - 0.2, -d * 0.08, 2, 0);
  }
  return { ...c.done(), height: 0.3 + H * floors, floors };
}

// low silhouettes behind the tower, for the skyline
export function buildCity(seed = 3) {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const c = collector();
  for (let i = 0; i < 46; i++) {
    const x = (r() - 0.5) * 120, z = -24 - r() * 60;
    if (Math.abs(x) < 9 && z > -34) continue;
    const h = 1.5 + Math.pow(r(), 2) * 12, bw = 1.5 + r() * 3.5, bd = 1.5 + r() * 3;
    const g = new THREE.BoxGeometry(bw, h, bd);
    g.translate(x, h / 2, z);
    c.add(g, r() * 40, 2, null, r() < 0.5);
  }
  return c.done();
}

/* ---------- the material ---------- */
export function buildingMaterials({ height, floors, mode = 0, box = 0 }) {
  const uniforms = {
    uColour: { value: mode ? 1 : 0 }, uSky: { value: 0 }, uLights: { value: 0 },
    uFill: { value: 0 }, uHover: { value: -9 }, uSel: { value: -9 }, uMine: { value: -9 },
    uFloors: { value: floors }, uHeight: { value: height }, uMode: { value: mode }, uBox: { value: box },
    uTime: { value: 0 }, uSun: { value: new THREE.Vector3(-0.6, 0.45, 0.65).normalize() },
    uDraw: { value: mode ? 999 : -2 },
  };
  const solid = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      attribute float aFloor; attribute float aPart;
      varying vec3 vW; varying vec3 vN; varying vec3 vL; varying float vFloor; varying float vPart;
      void main(){
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz; vL = position; vN = normalize(mat3(modelMatrix) * normal);
        vFloor = aFloor; vPart = aPart;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uColour, uSky, uLights, uFill, uHover, uSel, uMine, uFloors, uHeight, uMode, uBox, uTime, uDraw;
      uniform vec3 uSun;
      varying vec3 vW; varying vec3 vN; varying vec3 vL; varying float vFloor; varying float vPart;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      vec3 skyCol(float y){
        float t = smoothstep(-0.05, 0.6, y);
        vec3 day = mix(vec3(0.93, 0.9, 0.86), vec3(0.55, 0.68, 0.86), t);
        vec3 dusk = mix(vec3(0.98, 0.58, 0.34), vec3(0.1, 0.12, 0.22), t);
        return mix(day, dusk, uSky);
      }
      void main(){
        vec3 N = normalize(vN), V = normalize(cameraPosition - vW), L = normalize(uSun);
        float diff = max(dot(N, L), 0.0);

        /* the pencil sketch */
        vec3 paper = vec3(0.953, 0.937, 0.902);
        float hatch = step(0.62, fract((gl_FragCoord.x - gl_FragCoord.y) * 0.11));
        float shade = smoothstep(0.25, 0.95, 1.0 - diff) * (1.0 - step(0.6, N.y));
        vec3 pencil = paper - vec3(0.36, 0.35, 0.34) * hatch * shade * 0.5;
        // not drawn yet: blank paper
        pencil = mix(paper, pencil, step(vW.y, uDraw));

        /* the finished building */
        vec3 ambient = mix(vec3(0.6, 0.62, 0.68), vec3(0.36, 0.32, 0.42), uSky);
        vec3 sunC = mix(vec3(1.0, 0.96, 0.9), vec3(1.0, 0.64, 0.4), uSky);
        vec3 col;
        float fres = 0.0;
        if (vPart < 0.5) {
          col = vec3(0.87, 0.84, 0.79) * (ambient + sunC * diff * 0.85);
        } else if (vPart < 1.5) {
          vec3 R = reflect(-V, N);
          fres = pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.8 + 0.2;
          col = mix(vec3(0.06, 0.1, 0.13), skyCol(R.y), fres);
          // mullions and window cells
          float u = uBox > 0.5 ? (abs(N.x) > 0.5 ? vL.z : vL.x) * 2.4 : atan(vL.z, vL.x) * 7.0;
          float mull = step(0.92, fract(u));
          col *= 1.0 - mull * 0.55;
          float lit = step(0.5, hash(vec2(vFloor + 1.0, floor(u))));
          col += vec3(1.0, 0.74, 0.44) * lit * uLights * 0.75 * (1.0 - mull);
        } else {
          float h = hash(vec2(floor(vW.y * 6.0), floor((vW.x + vW.z) * 4.0)));
          col = mix(vec3(0.66, 0.64, 0.62) * (ambient + sunC * diff * 0.5), vec3(0.07, 0.08, 0.11), uSky * 0.9);
          col += vec3(1.0, 0.8, 0.5) * step(0.9, h) * uLights * 0.6 * step(0.5, fract(vW.y * 6.0));
        }

        /* model mode: gold fill, hover, selection */
        if (uMode > 0.5 && vFloor > -0.5 && vFloor < uFloors - 0.5) {
          float filled = step(vFloor + 0.5, uFill * uFloors + 0.001);
          vec3 gold = vec3(1.0, 0.72, 0.32);
          vec3 lit = vPart > 0.5 ? gold * (0.7 + 0.5 * fres) + gold * 0.25 : col * vec3(1.08, 0.9, 0.66);
          col = mix(col, lit, filled * 0.9);
          float pulse = 0.5 + 0.5 * sin(uTime * 3.0);
          if (abs(vFloor - uMine) < 0.5) col = mix(col, vec3(1.0, 0.9, 0.7), 0.25 + 0.2 * pulse);
          if (abs(vFloor - uHover) < 0.5) col = mix(col, vec3(1.0), 0.32);
          if (abs(vFloor - uSel) < 0.5) col = mix(col, vec3(1.0, 0.82, 0.5), 0.6);
        }

        // the colour climbs the building from the ground up
        float wipeY = mix(-1.5, uHeight + 1.5, uColour);
        float k = vPart > 1.5 ? smoothstep(0.35, 0.85, uColour) : clamp((wipeY - vW.y) / 1.6 + 0.5, 0.0, 1.0);
        gl_FragColor = vec4(mix(pencil, col, k), 1.0);
      }`,
  });
  const edges = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform float uColour, uHeight, uMode, uDraw;
      varying vec3 vW;
      void main(){
        float wipeY = mix(-1.5, uHeight + 1.5, uColour);
        float k = clamp((wipeY - vW.y) / 1.6 + 0.5, 0.0, 1.0);
        float a = mix(0.8, 0.07, k) * step(vW.y, uDraw);
        vec3 c = vec3(0.17, 0.16, 0.15);
        if (uMode > 0.5) { a = 0.14; c = vec3(1.0, 0.95, 0.86); }
        gl_FragColor = vec4(c, a);
      }`,
  });
  return { solid, edges, uniforms };
}

// one object with solid + edges, ready to add to a scene
export function makeBuilding(spec, { mode = 0, sketchy = false } = {}) {
  const built = spec.kind === 'house' ? buildHouse(spec) : buildTower(spec);
  const mats = buildingMaterials({ height: built.height, floors: built.floors, mode, box: spec.kind === 'house' ? 1 : 0 });
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(built.solid, mats.solid);
  group.add(mesh);
  group.add(new THREE.LineSegments(built.edges, mats.edges));
  // a second, slightly offset pass of lines reads as a hand-drawn sketch
  if (sketchy) {
    const l2 = new THREE.LineSegments(built.edges, mats.edges);
    l2.scale.set(1.006, 1.002, 1.006);
    l2.position.set(0.012, -0.01, 0.01);
    group.add(l2);
  }
  return { group, mesh, uniforms: mats.uniforms, height: built.height, floors: built.floors };
}
