import { createMazeModel } from './maze-model.js';
import { createScene3D } from './scene3d.js';
import { runSearch } from './search-api.js';

const maze = createMazeModel(11, 11);
const scene = createScene3D(document.getElementById('canvas-wrap'), maze);

let steps = [];
let stepIdx = { value: 0 };
let frameAcc = { value: 0 };
let playing = false;

const $ = (id) => document.getElementById(id);

function setPhase(p) {
  maze.setPhase(p);
  $('phase-label').textContent = p === 'edit' ? 'Montar labirinto' : 'Visualizar busca';
  $('hint').textContent =
    p === 'edit'
      ? 'Clique nas células: caminho, parede, início ou meta. Depois escolha o algoritmo e Execute.'
      : '▶ Animar — a bolinha percorre a busca; amarelo = fronteira, roxo = visitado, laranja = caminho.';
}

function setMetrics(m, algo) {
  const el = $('metrics');
  if (!m) {
    el.textContent = 'Aguardando execução…';
    return;
  }
  el.innerHTML = `<strong>${algo}</strong><br>
    Visitados: ${m.visited}<br>
    Caminho: ${m.pathLength || '—'}<br>
    Tempo: ${m.elapsedMs} ms<br>
    ${m.found ? '✓ Meta encontrada' : '✗ Sem caminho'}`;
}

async function onRun() {
  const algo = $('algo').value;
  const dlsLimit = +$('dls-limit').value;
  $('metrics').textContent = 'Calculando…';

  try {
    const data = await runSearch(maze.toJSON(), algo, dlsLimit);
    steps = data.steps || [];
    stepIdx.value = 0;
    frameAcc.value = 0;
    playing = false;
    scene.resetColors();
    scene.hideBall();
    setPhase('viz');
    setMetrics(data.metrics, algo);

    const first = steps.find((s) => s.type === 'current' || s.type === 'visit');
    if (first) scene.moveBallTo(first.pos[0], first.pos[1], true);
  } catch (e) {
    $('metrics').textContent = e.message || 'Erro na API';
    console.error(e);
  }
}

function bindUI() {
  $('btn-resize').onclick = () => {
    let rows = +$('rows').value | 1;
    let cols = +$('cols').value | 1;
    if (rows % 2 === 0) rows++;
    if (cols % 2 === 0) cols++;
    $('rows').value = rows;
    $('cols').value = cols;
    maze.resize(rows, cols);
    scene.rebuild();
    setPhase('edit');
    steps = [];
    scene.hideBall();
  };

  $('btn-random').onclick = () => {
    maze.carveRandom();
    scene.rebuild();
    setPhase('edit');
    steps = [];
    scene.hideBall();
    setMetrics(null);
  };

  $('btn-run').onclick = onRun;
  $('btn-play').onclick = () => {
    if (steps.length) playing = true;
  };

  $('btn-reset-viz').onclick = () => {
    stepIdx.value = 0;
    frameAcc.value = 0;
    playing = false;
    scene.resetColors();
    const first = steps.find((s) => s.type === 'current' || s.type === 'visit');
    if (first) scene.moveBallTo(first.pos[0], first.pos[1], true);
    else scene.hideBall();
  };

  ['path', 'wall', 'start', 'goal'].forEach((id) => {
    $(`mode-${id}`).onclick = () => {
      maze.setMode(id);
      ['path', 'wall', 'start', 'goal'].forEach((x) =>
        $(`mode-${x}`).classList.toggle('active', x === id),
      );
      setPhase('edit');
    };
  });

  $('algo').onchange = () => {
    const a = $('algo').value;
    $('limit-wrap').style.display = a === 'DLS' || a === 'IDS' ? 'inline' : 'none';
  };

  scene.domElement.addEventListener('pointerdown', (ev) => {
    if (maze.state.phase !== 'edit') return;
    const cell = scene.pickCell(ev);
    if (!cell) return;
    maze.applyCellEdit(cell.r, cell.c);
    scene.rebuild();
  });

  window.addEventListener('resize', () => scene.resize());
}

function loop() {
  requestAnimationFrame(loop);
  const speed = +$('speed').value;
  playing = scene.tickAnimation(playing, steps, stepIdx, speed, frameAcc);
}

bindUI();
scene.rebuild();
scene.resize();
setPhase('edit');
loop();
