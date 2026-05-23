import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { COLORS, SCENE } from './config.js';

export function createScene3D(container, mazeModel) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e14);
  scene.fog = new THREE.Fog(0x0a0e14, 28, 55);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2.05;

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLight.position.set(8, 14, 6);
  scene.add(dirLight, new THREE.AmbientLight(0x556677, 0.45));
  scene.add(new THREE.GridHelper(30, 30, 0x2a3544, 0x1a2230));

  const cells = new Map();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(SCENE.ballRadius, 24, 24),
    new THREE.MeshStandardMaterial({
      color: 0xffeb3b,
      emissive: 0x665500,
      metalness: 0.3,
      roughness: 0.4,
    }),
  );
  ball.visible = false;
  scene.add(ball);
  const ballTarget = new THREE.Vector3();

  function key(r, c) {
    return `${r},${c}`;
  }

  function worldPos(r, c, y = 0.05) {
    const { rows, cols } = mazeModel.state;
    return new THREE.Vector3(c - cols / 2 + 0.5, y, r - rows / 2 + 0.5);
  }

  function rebuild() {
    const { rows, cols } = mazeModel.state;
    cells.forEach((m) => scene.remove(m));
    cells.clear();

    const floorGeo = new THREE.BoxGeometry(SCENE.cellSize * 0.96, 0.12, SCENE.cellSize * 0.96);
    const wallGeo = new THREE.BoxGeometry(SCENE.cellSize * 0.96, SCENE.wallHeight, SCENE.cellSize * 0.96);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isWall = mazeModel.state.grid[r][c] === 1;
        const geo = isWall ? wallGeo : floorGeo;
        const mat = new THREE.MeshLambertMaterial({
          color: mazeModel.baseColor(r, c, COLORS),
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(worldPos(r, c, isWall ? SCENE.wallHeight / 2 : 0.06));
        mesh.userData = { r, c, isWall };
        scene.add(mesh);
        cells.set(key(r, c), mesh);
      }
    }

    const mid = worldPos(rows / 2, cols / 2, 0);
    camera.position.set(mid.x + cols * 0.65, rows * 0.9, mid.z + rows * 0.85);
    controls.target.set(mid.x, 0.4, mid.z);
  }

  function setCellColor(r, c, hex) {
    const m = cells.get(key(r, c));
    if (m && !m.userData.isWall) m.material.color.setHex(hex);
  }

  function resetColors() {
    const { rows, cols } = mazeModel.state;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const m = cells.get(key(r, c));
        if (m) m.material.color.setHex(mazeModel.baseColor(r, c, COLORS));
      }
    }
  }

  function moveBallTo(r, c, instant = false) {
    ballTarget.copy(worldPos(r, c, SCENE.ballRadius + 0.15));
    if (instant) ball.position.copy(ballTarget);
    ball.visible = true;
  }

  function applyStep(step) {
    const [r, c] = step.pos;
    if (mazeModel.state.grid[r][c] === 1) return;

    if (step.type === 'current') {
      setCellColor(r, c, COLORS.current);
      moveBallTo(r, c);

    } else if (step.type === 'visit') {
      setCellColor(r, c, COLORS.visit);

    } else if (step.type === 'frontier') {
      setCellColor(r, c, COLORS.frontier);

    } else if (step.type === 'path') {
      setCellColor(r, c, COLORS.path);
      moveBallTo(r, c);
    }
  }

  function pickCell(ev) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects([...cells.values()]);
    if (hits.length) return hits[0].object.userData;

    const pt = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(floorPlane, pt)) {
      const { rows, cols } = mazeModel.state;
      const c = Math.floor(pt.x + cols / 2);
      const r = Math.floor(pt.z + rows / 2);

      if (r >= 0 && r < rows && c >= 0 && c < cols) return { r, c };
    }
    return null;
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function tickAnimation(playing, steps, stepIdxRef, speed, frameAccRef) {
    let playingNow = playing;
    let idx = stepIdxRef.value;
    let acc = frameAccRef.value;

    if (playingNow && idx < steps.length) {
      acc++;

      if (acc >= Math.max(1, 28 - speed)) {
        acc = 0;
        applyStep(steps[idx]);
        idx++;
        
        if (idx >= steps.length) playingNow = false;
      }
    }

    if (ball.visible) {
      ball.position.lerp(ballTarget, 0.22);
      ball.position.y = SCENE.ballRadius + 0.15 + Math.sin(performance.now() * 0.006) * 0.04;
    }

    controls.update();
    renderer.render(scene, camera);

    stepIdxRef.value = idx;
    frameAccRef.value = acc;
    return playingNow;
  }

  function hideBall() {
    ball.visible = false;
  }

  return {
    rebuild,
    resetColors,
    applyStep,
    pickCell,
    resize,
    moveBallTo,
    hideBall,
    tickAnimation,
    domElement: renderer.domElement,
  };
}
