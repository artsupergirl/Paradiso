import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ---------------------------------------------------------------------
   FlyMingo Studio — 3D
   A stylized, low-poly recreation of the FlyMingo design studio render:
   window wall with neon palm, yellow signage wall, two workstation
   desks, a sewing corner, a shelving unit of products, and a
   foreground drawing table with a color-swatch fan and sketchbook.
--------------------------------------------------------------------- */

const COLORS = {
  wall: 0xf3efe6,
  floor: 0xd8c6a1,
  floorDark: 0xc9b48a,
  yellow: 0xf4c60d,
  yellowDeep: 0xe0b400,
  pink: 0xec1e8f,
  pinkDeep: 0xc8116f,
  orange: 0xff5a36,
  white: 0xffffff,
  cream: 0xf6efe0,
  wood: 0xdcc79c,
  woodDeep: 0xc7ac78,
  metal: 0xb9bec4,
  metalDark: 0x8b9096,
  gold: 0xf6c453,
  black: 0x232323,
  sky: 0xbfe0f2,
};

let scene, camera, renderer, controls;
let autoRotate = false;

init();
buildScene();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe9e4d8);
  scene.fog = new THREE.Fog(0xe9e4d8, 22, 42);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(9.5, 5.6, 11.5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(-0.5, 1.6, 0.5);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 4;
  controls.maxDistance = 26;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.update();

  window.addEventListener("resize", onResize);

  document.getElementById("resetBtn").addEventListener("click", () => {
    camera.position.set(9.5, 5.6, 11.5);
    controls.target.set(-0.5, 1.6, 0.5);
    controls.update();
  });
  const rotateBtn = document.getElementById("rotateBtn");
  rotateBtn.addEventListener("click", () => {
    autoRotate = !autoRotate;
    controls.autoRotate = autoRotate;
    rotateBtn.textContent = "Auto-rotate: " + (autoRotate ? "On" : "Off");
  });
  controls.autoRotateSpeed = 1.1;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

/* ----------------------------- helpers ----------------------------- */

function box(w, h, d, color, opts = {}) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.75,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
  });
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = opts.castShadow ?? true;
  m.receiveShadow = opts.receiveShadow ?? true;
  return m;
}

function cyl(rt, rb, h, color, opts = {}) {
  const geo = new THREE.CylinderGeometry(rt, rb, h, opts.seg ?? 20);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.6,
    metalness: opts.metalness ?? 0.15,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = opts.castShadow ?? true;
  m.receiveShadow = opts.receiveShadow ?? true;
  return m;
}

function makeCanvasTexture(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function drawFlamingoMark(ctx, cx, cy, s, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // legs
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-4, 40);
  ctx.lineTo(-10, 92);
  ctx.moveTo(4, 40);
  ctx.lineTo(14, 92);
  ctx.stroke();

  // body
  ctx.beginPath();
  ctx.ellipse(0, 26, 15, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // neck
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(6, 10);
  ctx.bezierCurveTo(24, -8, -14, -26, -2, -46);
  ctx.stroke();

  // head
  ctx.beginPath();
  ctx.arc(-2, -50, 8, 0, Math.PI * 2);
  ctx.fill();

  // beak
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-9, -50);
  ctx.lineTo(-22, -46);
  ctx.stroke();

  ctx.restore();
}

/* ----------------------------- scene ----------------------------- */

function buildScene() {
  addLights();
  addFloor();
  addWalls();
  addWindow(-7, -1.5);
  addNeonPalm(-6.3, -2.2);
  addSignageWall();
  addSmallPoster(0.6, -3.85, 2.4);
  addShelvingUnit(4.1, 0.8);
  addDesk(-3.6, -1.6, 0, COLORS.pink, true);
  addDesk(-0.6, -1.9, 0, COLORS.pink, false);
  addSewingCorner(2.6, -2.4);
  addDrawingTable(-1.4, 3.4);

  document.getElementById("loading").style.opacity = "0";
  setTimeout(() => document.getElementById("loading").remove(), 550);
}

function addLights() {
  const hemi = new THREE.HemisphereLight(0xffffff, 0xcbb98f, 1.0);
  scene.add(hemi);

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff3d6, 1.5);
  sun.position.set(-9, 9, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  sun.shadow.camera.far = 30;
  sun.shadow.bias = -0.0015;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  const fill = new THREE.PointLight(0xffe9f4, 0.6, 20);
  fill.position.set(3, 4, 6);
  scene.add(fill);

  const rim = new THREE.PointLight(0xfff0c2, 0.5, 18);
  rim.position.set(-6, 3.5, -2);
  scene.add(rim);
}

function addFloor() {
  const tex = makeCanvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#d8c6a1";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(150,120,70,0.18)";
    ctx.lineWidth = 2;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let i = 0; i < 400; i++) {
      ctx.strokeStyle = "rgba(120,95,55,0.08)";
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20 + Math.random() * 20, y);
      ctx.stroke();
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 5);

  const geo = new THREE.PlaneGeometry(16, 14);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
  const floor = new THREE.Mesh(geo, mat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(-1, 0, 1.5);
  floor.receiveShadow = true;
  scene.add(floor);
}

function addWalls() {
  const wallMat = new THREE.MeshStandardMaterial({
    color: COLORS.wall,
    roughness: 0.95,
  });

  const back = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.4), wallMat);
  back.position.set(-1, 2.2, -4);
  back.receiveShadow = true;
  scene.add(back);

  const left = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.4), wallMat);
  left.rotation.y = Math.PI / 2;
  left.position.set(-7, 2.2, 1.5);
  left.receiveShadow = true;
  scene.add(left);

  // baseboards
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.16, 0.05), baseMat);
  base1.position.set(-1, 0.08, -3.97);
  scene.add(base1);
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.16, 0.05), baseMat);
  base2.rotation.y = Math.PI / 2;
  base2.position.set(-6.97, 0.08, 1.5);
  scene.add(base2);
}

function addWindow(x, z) {
  const group = new THREE.Group();

  // sky backdrop
  const skyTex = makeCanvasTexture(512, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#bfe0f2");
    g.addColorStop(1, "#e9f4f7");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // building silhouette
    ctx.fillStyle = "#d9d3c8";
    ctx.fillRect(40, h * 0.25, w * 0.5, h * 0.75);
    ctx.fillStyle = "#c7c0b2";
    for (let gx = 60; gx < w * 0.5; gx += 34) {
      for (let gy = h * 0.32; gy < h; gy += 40) {
        ctx.fillRect(gx, gy, 18, 24);
      }
    }
  });
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6.5),
    new THREE.MeshStandardMaterial({ map: skyTex, roughness: 1 })
  );
  sky.rotation.y = Math.PI / 2;
  sky.position.set(x - 0.35, 2.6, z);
  scene.add(sky);

  // glass
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, 6.3),
    new THREE.MeshStandardMaterial({
      color: 0xdcefff,
      transparent: true,
      opacity: 0.12,
      roughness: 0.1,
      metalness: 0,
      depthWrite: false,
    })
  );
  glass.rotation.y = Math.PI / 2;
  glass.position.set(x - 0.02, 2.6, z);
  glass.castShadow = false;
  glass.receiveShadow = false;
  scene.add(glass);

  // mullions (grid)
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.4, metalness: 0.3 });
  for (let i = -3; i <= 3; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 6.3, 0.08), frameMat);
    bar.position.set(x, 2.6, z - 2.9 + (i + 3) * (5.8 / 6));
    group.add(bar);
  }
  for (let j = 0; j < 4; j++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 5.8), frameMat);
    bar.position.set(x, 0.5 + j * (6.3 / 3), z);
    group.add(bar);
  }
  scene.add(group);
}

function addNeonPalm(x, z) {
  const group = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: COLORS.gold,
    emissive: 0xf6b93a,
    emissiveIntensity: 1.6,
    roughness: 0.3,
    metalness: 0.4,
  });

  // trunk (curved via segments)
  const trunkPts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    trunkPts.push(new THREE.Vector3(Math.sin(t * 1.4) * 0.25, t * 3.1, 0));
  }
  const trunkCurve = new THREE.CatmullRomCurve3(trunkPts);
  const trunk = new THREE.Mesh(
    new THREE.TubeGeometry(trunkCurve, 20, 0.07, 8, false),
    goldMat
  );
  group.add(trunk);

  // fronds
  const top = trunkCurve.getPoint(1);
  const frondCount = 9;
  for (let i = 0; i < frondCount; i++) {
    const ang = (i / frondCount) * Math.PI * 2;
    const droop = 0.55 + Math.random() * 0.25;
    const len = 1.1 + Math.random() * 0.35;
    const pts = [];
    for (let s = 0; s <= 6; s++) {
      const t = s / 6;
      pts.push(
        new THREE.Vector3(
          top.x + Math.cos(ang) * len * t,
          top.y + t * (0.4 - droop * t * 1.4),
          top.z + Math.sin(ang) * len * t
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const frond = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.035, 6, false), goldMat);
    group.add(frond);
  }

  // coconuts
  for (let i = 0; i < 3; i++) {
    const co = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), goldMat);
    co.position.set(top.x + (Math.random() - 0.5) * 0.2, top.y - 0.05, top.z + (Math.random() - 0.5) * 0.2);
    group.add(co);
  }

  // base ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.03, 8, 24),
    goldMat
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);

  // soft glow sprite
  const glowTex = makeCanvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(246,196,83,0.55)");
    g.addColorStop(1, "rgba(246,196,83,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  glow.scale.set(3.2, 3.2, 1);
  glow.position.set(0, 1.8, 0.1);
  group.add(glow);

  group.position.set(x, 0, z);
  group.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  scene.add(group);
}

function addSignageWall() {
  const tex = makeCanvasTexture(1024, 512, (ctx, w, h) => {
    ctx.fillStyle = "#f4c60d";
    ctx.fillRect(0, 0, w, h);
    drawFlamingoMark(ctx, 150, h / 2, 1.9, "#ec1e8f");
    ctx.fillStyle = "#ec1e8f";
    ctx.font = "italic 800 108px 'Segoe Script','Brush Script MT',cursive";
    ctx.textBaseline = "middle";
    ctx.fillText("FlyMingo", 300, h / 2 + 12);
  });
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 2.3),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })
  );
  panel.position.set(-3.2, 2.7, -3.94);
  scene.add(panel);

  // thin frame
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(4.7, 2.4, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
  );
  frame.position.set(-3.2, 2.7, -3.97);
  scene.add(frame);
}

function addSmallPoster(x, z, y) {
  const tex = makeCanvasTexture(320, 420, (ctx, w, h) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    drawFlamingoMark(ctx, w / 2, h / 2 + 20, 2.4, "#ec1e8f");
    ctx.fillStyle = "#f4c60d";
    ctx.beginPath();
    ctx.arc(w / 2 - 24, h / 2 - 118, 6, 0, Math.PI * 2);
    ctx.arc(w / 2 + 8, h / 2 - 128, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  const poster = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 1.7),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })
  );
  poster.position.set(x, y, z);
  scene.add(poster);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 1.85, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 })
  );
  frame.position.set(x, y, z - 0.03);
  scene.add(frame);
}

/* --------------------------- furniture --------------------------- */

function addDesk(x, z, rotY, chairColor, hasSecondMonitorAngle) {
  const group = new THREE.Group();

  const top = box(2.6, 0.08, 1.3, COLORS.wood, { roughness: 0.5 });
  top.position.y = 1.15;
  group.add(top);

  const legMat = COLORS.metal;
  const legGeo = [
    [-1.2, 0.575, -0.55],
    [1.2, 0.575, -0.55],
    [-1.2, 0.575, 0.55],
    [1.2, 0.575, 0.55],
  ];
  legGeo.forEach(([lx, ly, lz]) => {
    const leg = cyl(0.03, 0.03, 1.15, legMat, { roughness: 0.4, metalness: 0.6 });
    leg.position.set(lx, ly, lz);
    group.add(leg);
  });

  // monitor
  const standBase = cyl(0.16, 0.16, 0.03, COLORS.metal, { metalness: 0.5, castShadow: false, receiveShadow: false });
  standBase.position.set(0, 1.2, -0.25);
  group.add(standBase);
  const standNeck = cyl(0.025, 0.03, 0.35, COLORS.metal, { metalness: 0.5, castShadow: false, receiveShadow: false });
  standNeck.position.set(0, 1.36, -0.25);
  group.add(standNeck);
  const screen = box(0.85, 0.5, 0.03, 0xdfe6ea, {
    roughness: 0.3,
    castShadow: false,
    receiveShadow: false,
    emissive: 0xcfd8dd,
    emissiveIntensity: 0.4,
  });
  screen.position.set(0, 1.62, -0.25);
  group.add(screen);

  // mug + notebook accents
  const mug = cyl(0.05, 0.045, 0.09, 0xec6f6f, { roughness: 0.5, receiveShadow: false });
  mug.position.set(0.75, 1.24, 0.25);
  group.add(mug);
  const pad = box(0.22, 0.02, 0.28, COLORS.orange, { roughness: 0.6, receiveShadow: false });
  pad.position.set(-0.85, 1.2, 0.2);
  pad.rotation.y = 0.15;
  group.add(pad);

  group.add(createChair(0, -0.95, Math.PI, chairColor));

  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  scene.add(group);
}

function createChair(x, z, rotY, seatColor) {
  const group = new THREE.Group();
  const seatMat = new THREE.MeshStandardMaterial({ color: seatColor, roughness: 0.65 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.4, metalness: 0.2 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.5 });

  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.09, 16), seatMat);
  seat.position.y = 0.62;
  seat.castShadow = true;
  group.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.07), seatMat);
  back.position.set(0, 1.0, -0.22);
  back.rotation.x = -0.12;
  back.castShadow = true;
  group.add(back);

  const backFrame = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.015, 6, 16, Math.PI), frameMat);
  backFrame.position.set(0, 1.26, -0.22);
  backFrame.rotation.z = Math.PI;
  group.add(backFrame);

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.35, 10), blackMat);
  post.position.y = 0.42;
  group.add(post);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10), blackMat);
  hub.position.y = 0.24;
  group.add(hub);

  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.04), frameMat);
    leg.position.set(Math.cos(ang) * 0.14, 0.2, Math.sin(ang) * 0.14);
    leg.rotation.y = -ang;
    group.add(leg);
    const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), blackMat);
    wheel.position.set(Math.cos(ang) * 0.27, 0.19, Math.sin(ang) * 0.27);
    group.add(wheel);
  }

  const armMat = frameMat;
  [-1, 1].forEach((s) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.28), armMat);
    arm.position.set(s * 0.24, 0.85, -0.02);
    group.add(arm);
    const armPost = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.2, 8), armMat);
    armPost.position.set(s * 0.24, 0.74, 0.06);
    group.add(armPost);
  });

  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  return group;
}

function addSewingCorner(x, z) {
  const group = new THREE.Group();

  const top = box(1.7, 0.07, 0.85, COLORS.wood, { roughness: 0.5 });
  top.position.y = 1.0;
  group.add(top);
  [[-0.75, -0.35], [0.75, -0.35], [-0.75, 0.35], [0.75, 0.35]].forEach(([lx, lz]) => {
    const leg = cyl(0.025, 0.025, 1.0, COLORS.wood, { roughness: 0.6 });
    leg.position.set(lx, 0.5, lz);
    group.add(leg);
  });

  // sewing machine (simplified)
  const body = box(0.5, 0.22, 0.28, 0xf4f4f2, { roughness: 0.4 });
  body.position.set(0.1, 1.14, -0.05);
  group.add(body);
  const arm = box(0.12, 0.26, 0.16, 0xf4f4f2, { roughness: 0.4 });
  arm.position.set(-0.12, 1.2, -0.05);
  group.add(arm);
  const needle = cyl(0.008, 0.008, 0.14, 0x555555, { metalness: 0.6 });
  needle.position.set(-0.1, 1.06, -0.02);
  group.add(needle);

  // lamp
  const lampBase = cyl(0.06, 0.07, 0.02, 0xd8d8d8, { metalness: 0.4 });
  lampBase.position.set(-0.7, 1.04, -0.25);
  group.add(lampBase);
  const lampArm = cyl(0.012, 0.012, 0.35, 0xd8d8d8, { metalness: 0.4 });
  lampArm.position.set(-0.7, 1.2, -0.25);
  lampArm.rotation.z = 0.3;
  group.add(lampArm);
  const lampHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.1, 12, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xfff7dc, emissive: 0xfff2b8, emissiveIntensity: 0.6, side: THREE.DoubleSide })
  );
  lampHead.position.set(-0.85, 1.36, -0.25);
  lampHead.rotation.z = Math.PI / 2 + 0.4;
  group.add(lampHead);
  const bulbLight = new THREE.PointLight(0xfff2c9, 0.35, 2.5);
  bulbLight.position.copy(lampHead.position);
  group.add(bulbLight);

  // thread spools
  const spoolColors = [0xec1e8f, 0xf4c60d, 0xff5a36];
  spoolColors.forEach((c, i) => {
    const spool = cyl(0.035, 0.035, 0.12, c, { roughness: 0.5 });
    spool.position.set(0.55 + i * 0.09, 1.1, 0.28);
    group.add(spool);
  });

  // fabric stack
  const fabricColors = [COLORS.orange, COLORS.yellow, COLORS.white];
  fabricColors.forEach((c, i) => {
    const f = box(0.32, 0.045, 0.24, c, { roughness: 0.8 });
    f.position.set(-0.75, 0.65 + i * 0.05, 0.5);
    group.add(f);
  });

  group.add(createChair(0.05, 0.75, 0, COLORS.pink));

  group.position.set(x, 0, z);
  scene.add(group);
}

function addShelvingUnit(x, z) {
  const group = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

  const height = 3.6;
  const width = 1.3;
  const depth = 0.42;
  const shelfCount = 5;

  const sideL = box(0.04, height, depth, 0xffffff, { roughness: 0.5 });
  sideL.position.set(-width / 2, height / 2, 0);
  group.add(sideL);
  const sideR = box(0.04, height, depth, 0xffffff, { roughness: 0.5 });
  sideR.position.set(width / 2, height / 2, 0);
  group.add(sideR);
  const back = box(width, height, 0.02, 0xf7f4ee, { roughness: 0.7 });
  back.position.set(0, height / 2, -depth / 2 + 0.01);
  group.add(back);

  const shelfColors = [];
  for (let i = 0; i <= shelfCount; i++) {
    const y = (i / shelfCount) * height;
    const shelf = box(width, 0.035, depth, 0xffffff, { roughness: 0.5 });
    shelf.position.set(0, y, 0);
    group.add(shelf);
  }

  const shelfYs = [];
  for (let i = 0; i < shelfCount; i++) {
    shelfYs.push((i / shelfCount) * height + height / shelfCount / 2 + 0.02);
  }

  // items per shelf, top to bottom mirrors the reference image
  addPouchWithStars(group, 0, shelfYs[4], COLORS.yellow, 0.42);
  addSmallBook(group, -0.32, shelfYs[3], COLORS.yellow);
  addTagCard(group, 0.28, shelfYs[3], COLORS.yellow);
  addPouch(group, 0, shelfYs[2], COLORS.orange, "FlyMingo");
  addNotebook(group, 0, shelfYs[1], COLORS.yellow);
  addGiftBox(group, 0, shelfYs[0], COLORS.yellow);

  group.position.set(x, 0, z);
  scene.add(group);
}

function addPouchWithStars(parent, x, y, color, w) {
  const tex = makeCanvasTexture(256, 200, (ctx, cw, ch) => {
    ctx.fillStyle = "#f4c60d";
    ctx.fillRect(0, 0, cw, ch);
    const stars = ["#ec1e8f", "#ff5a36", "#7ac6e0", "#ffffff"];
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = stars[i % stars.length];
      drawStar(ctx, Math.random() * cw, Math.random() * ch, 4 + Math.random() * 5);
    }
  });
  const geo = new THREE.CapsuleGeometry(0.16, w - 0.32, 4, 12);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
  const m = new THREE.Mesh(geo, mat);
  m.rotation.z = Math.PI / 2;
  m.position.set(x, y, 0);
  m.castShadow = true;
  parent.add(m);
}

function drawStar(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (i * Math.PI) / 5 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function addSmallBook(parent, x, y, color) {
  const b = box(0.16, 0.22, 0.03, color, { roughness: 0.6 });
  b.position.set(x, y, 0.05);
  parent.add(b);
}

function addTagCard(parent, x, y, color) {
  const t = box(0.1, 0.14, 0.02, color, { roughness: 0.6 });
  t.position.set(x, y, 0.05);
  parent.add(t);
  const hole = cyl(0.015, 0.015, 0.03, 0xffffff, { roughness: 0.5 });
  hole.rotation.x = Math.PI / 2;
  hole.position.set(x, y + 0.05, 0.06);
  parent.add(hole);
}

function addPouch(parent, x, y, color, label) {
  const tex = makeCanvasTexture(300, 160, (ctx, w, h) => {
    ctx.fillStyle = "#ff5a36";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ec1e8f";
    ctx.font = "italic 800 44px 'Segoe Script','Brush Script MT',cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, w / 2, h / 2);
  });
  const geo = new THREE.BoxGeometry(0.5, 0.24, 0.08);
  const mat = [
    new THREE.MeshStandardMaterial({ color: 0xff5a36, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0xff5a36, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0xff5a36, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0xff5a36, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0xff5a36, roughness: 0.5 }),
  ];
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, 0.06);
  m.castShadow = true;
  parent.add(m);
}

function addNotebook(parent, x, y, color) {
  const tex = makeCanvasTexture(200, 260, (ctx, w, h) => {
    ctx.fillStyle = "#f4c60d";
    ctx.fillRect(0, 0, w, h);
    drawFlamingoMark(ctx, w / 2, h / 2 - 20, 1.0, "#ec1e8f");
  });
  const geo = new THREE.BoxGeometry(0.34, 0.46, 0.06);
  const mat = [
    new THREE.MeshStandardMaterial({ color: 0xf4c60d, roughness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0xf4c60d, roughness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0xf4c60d, roughness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0xf4c60d, roughness: 0.6 }),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0xf4c60d, roughness: 0.6 }),
  ];
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, 0.05);
  m.castShadow = true;
  parent.add(m);
}

function addGiftBox(parent, x, y, color) {
  const b = box(0.3, 0.22, 0.18, 0xf4c60d, { roughness: 0.55 });
  b.position.set(x, y, 0.06);
  parent.add(b);
  const window = new THREE.Mesh(
    new THREE.CircleGeometry(0.06, 5),
    new THREE.MeshStandardMaterial({ color: 0xec1e8f, roughness: 0.5 })
  );
  window.position.set(x, y, 0.155);
  parent.add(window);
}

/* --------------------------- foreground table --------------------------- */

function addDrawingTable(x, z) {
  const group = new THREE.Group();

  const top = box(3.0, 0.08, 1.6, COLORS.wood, { roughness: 0.45 });
  top.position.y = 0.95;
  top.rotation.y = 0.06;
  group.add(top);

  [[-1.35, -0.65], [1.35, -0.65], [-1.35, 0.65], [1.35, 0.65]].forEach(([lx, lz]) => {
    const leg = box(0.07, 0.9, 0.07, COLORS.woodDeep, { roughness: 0.6 });
    leg.position.set(lx, 0.45, lz);
    group.add(leg);
  });

  // color swatch fan
  const fanColors = [
    0x7a1f8a, 0x3b3aa8, 0x2f6fd1, 0x3aa6d8, 0x38b8b0, 0x4bbf6a,
    0x9ed14e, 0xe7d23a, 0xf2a63a, 0xef7a2e, 0xe94f3c, 0xd93b5c,
  ];
  const fanCenter = new THREE.Vector3(-0.9, 1.0, -0.15);
  fanColors.forEach((c, i) => {
    const t = i / (fanColors.length - 1);
    const ang = -0.15 + t * 1.35;
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.62),
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, side: THREE.DoubleSide })
    );
    strip.position.set(
      fanCenter.x + Math.sin(ang) * 0.34,
      fanCenter.y,
      fanCenter.z - Math.cos(ang) * 0.34 + 0.02 * i
    );
    strip.rotation.x = -Math.PI / 2;
    strip.rotation.z = -ang;
    group.add(strip);
  });
  const fanHub = cyl(0.05, 0.05, 0.02, 0xffffff, { roughness: 0.6 });
  fanHub.position.set(fanCenter.x, fanCenter.y + 0.01, fanCenter.z);
  group.add(fanHub);

  // sketchbook with sketch texture
  const skTex = makeCanvasTexture(400, 300, (ctx, w, h) => {
    ctx.fillStyle = "#f4efe1";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#3a352f";
    ctx.lineWidth = 2;
    // pouch sketch
    roundRectStroke(ctx, 40, 70, 140, 90, 14);
    // tag sketch
    ctx.beginPath();
    ctx.moveTo(260, 60);
    ctx.lineTo(330, 60);
    ctx.lineTo(345, 90);
    ctx.lineTo(330, 150);
    ctx.lineTo(260, 150);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(300, 75, 8, 0, Math.PI * 2);
    ctx.stroke();
    // little figure sketch
    ctx.beginPath();
    ctx.ellipse(90, 220, 26, 34, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(90, 250);
    ctx.lineTo(75, 285);
    ctx.moveTo(90, 250);
    ctx.lineTo(105, 285);
    ctx.stroke();
    // spiral binding
    ctx.strokeStyle = "#9a948a";
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.arc(6, 12 + i * 20, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  const sketchbookGroup = new THREE.Group();
  const sketchbook = box(0.62, 0.03, 0.46, 0xf4efe1, { roughness: 0.8, receiveShadow: false });
  group.add(sketchbookGroup);
  sketchbookGroup.add(sketchbook);
  const sketchTop = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.44),
    new THREE.MeshStandardMaterial({ map: skTex, roughness: 0.9 })
  );
  sketchTop.rotation.x = -Math.PI / 2;
  sketchTop.position.y = 0.03;
  sketchTop.castShadow = false;
  sketchTop.receiveShadow = false;
  sketchbookGroup.add(sketchTop);
  sketchbookGroup.position.set(0.35, 1.0, -0.1);
  sketchbookGroup.rotation.y = -0.08;

  // pencils
  const pencilColors = [0x3a3a3a, 0x555555, 0x2b2b2b, 0x444444, 0x1f1f1f];
  pencilColors.forEach((c, i) => {
    const p = cyl(0.008, 0.008, 0.32, c, { roughness: 0.5 });
    p.rotation.z = Math.PI / 2;
    p.rotation.y = 0.4 + i * 0.06;
    p.position.set(0.75 + i * 0.05, 1.0, 0.25 - i * 0.03);
    group.add(p);
  });

  // markers (pink + yellow)
  [COLORS.pink, COLORS.yellow].forEach((c, i) => {
    const marker = cyl(0.014, 0.014, 0.26, c, { roughness: 0.4 });
    marker.rotation.z = Math.PI / 2.3;
    marker.position.set(1.15 + i * 0.07, 1.0, 0.55);
    group.add(marker);
  });

  // ruler
  const ruler = box(0.5, 0.01, 0.05, 0xdcd6c8, { roughness: 0.5 });
  ruler.position.set(0.95, 0.99, 0.35);
  ruler.rotation.y = 0.5;
  group.add(ruler);

  // fabric swatches
  const swatchColors = [COLORS.pink, COLORS.yellow];
  swatchColors.forEach((c, i) => {
    const s = box(0.34, 0.03, 0.34, c, { roughness: 0.9 });
    s.position.set(-0.15 + i * 0.03, 0.995 + i * 0.02, 0.42);
    s.rotation.y = 0.1 * i;
    group.add(s);
  });

  // small blank cards
  for (let i = 0; i < 3; i++) {
    const card = box(0.14, 0.01, 0.1, 0xfaf7f0, { roughness: 0.7 });
    card.position.set(-0.6 + i * 0.05, 0.985, 0.5 + i * 0.02);
    card.rotation.y = 0.15 * i;
    group.add(card);
  }

  group.add(createChair(-0.2, 1.35, Math.PI, COLORS.pink));

  group.position.set(x, 0, z);
  scene.add(group);
}

function roundRectStroke(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
}
