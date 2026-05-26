import { createMazeModel } from './maze-model.js';
import { createScene3D } from './scene3d.js';
import { compareAll } from './search-api.js';

const ALGO_ORDER = ['ASTAR', 'BFS', 'DFS', 'DLS', 'IDS', 'UCS'];

const ALGO_LABELS = {
  ASTAR: 'A*',
  BFS: 'BFS',
  DFS: 'DFS',
  DLS: 'DLS',
  IDS: 'IDS',
  UCS: 'UCS',
};

function fmtMs(v) {
  if (v == null || Number.isNaN(v)) return '—';
  return `${v} ms`;
}

function bestKey(results, key, activeAlgorithms, higherIsBetter = false) {
  let best = null;
  let bestVal = null;

  for (const name of activeAlgorithms) {
    const row = results[name];
    if (!row || row.error || !row.metrics?.found) continue;
    const v = row.metrics[key];
    if (v == null) continue;
    
    if (
      bestVal === null ||
      (higherIsBetter ? v > bestVal : v < bestVal)
    ) {
      bestVal = v;
      best = name;
    }
  }
  return best;
}

export function createCompareView(gridEl, tableEl) {
  if (!gridEl || !tableEl) {
    throw new Error('Elementos #compare-grid e #compare-results são obrigatórios');
  }

  const panels = new Map();
  let playing = false;

  function destroyPanels() {
    panels.clear();
    gridEl.innerHTML = '';
  }

  function renderTable(results, activeAlgorithms) {
    const bestVisited = bestKey(results, 'visited', activeAlgorithms);
    const bestPath = bestKey(results, 'pathLength', activeAlgorithms);
    const bestTime = bestKey(results, 'elapsedMs', activeAlgorithms);

    const rows = activeAlgorithms.map((name) => {
      const row = results[name];
      if (!row) return '';

      const m = row.metrics || {};
      const err = row.error;
      const status = err
        ? 'Não implementado'
        : m.found
          ? 'Meta encontrada'
          : 'Sem caminho';

      const cls = [
        bestVisited === name ? 'best-visited' : '',
        bestPath === name ? 'best-path' : '',
        bestTime === name ? 'best-time' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `<tr class="${cls}">
        <td><strong>${ALGO_LABELS[name] || name}</strong></td>
        <td>${status}</td>
        <td>${err ? '—' : row.stepCount ?? 0}</td>
        <td>${err ? '—' : m.visited ?? '—'}</td>
        <td>${err ? '—' : m.pathLength || '—'}</td>
        <td>${err ? '—' : fmtMs(m.elapsedMs)}</td>
      </tr>`;
    }).join('');

    tableEl.innerHTML = `
      <table class="compare-table">
        <thead>
          <tr>
            <th>Algoritmo</th>
            <th>Resultado</th>
            <th>Passos</th>
            <th>Visitados</th>
            <th>Caminho</th>
            <th>Tempo</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="compare-note">Destaque: menor visitados, menor caminho e menor tempo (entre os que encontraram a meta).</p>`;
  }

  function computeGridCols(count) {
    if (count <= 1) return 1;
    if (count <= 4) return 2;
    return 3;
  }

  function buildPanel(name, mazePayload) {
    const container = document.createElement('div');
    container.className = 'compare-panel';
    container.innerHTML = `<span class="compare-panel-title">${ALGO_LABELS[name] || name}</span>`;
    gridEl.appendChild(container);

    const panel = {
      name,
      container,
      maze: null,
      scene: null,
      steps: [],
      stepIdx: { value: 0 },
      frameAcc: { value: 0 },
      done: false,
      error: null,
    };
    panels.set(name, panel);

    try {
      const maze = createMazeModel(mazePayload.size.rows, mazePayload.size.cols);
      maze.fromJSON(mazePayload);
      maze.setPhase('viz');

      const scene = createScene3D(container, maze, { interactive: true });
      scene.rebuild();
      scene.resize();

      panel.maze = maze;
      panel.scene = scene;
    } catch (e) {
      panel.error = e.message || 'Erro ao criar visualização 3D';
      container.classList.add('compare-panel--error');
      const msg = document.createElement('p');
      msg.className = 'compare-panel-msg';
      msg.textContent = panel.error;
      container.appendChild(msg);
      console.error(`Painel ${name}:`, e);
    }
  }

  async function loadAndRun(mazePayload, options = {}) {
    const {
      dlsLimit = 50,
      selectedAlgorithms = [...ALGO_ORDER],
      limits = {},
    } = options;
    const activeAlgorithms = selectedAlgorithms.filter((a) => ALGO_ORDER.includes(a));

    if (!activeAlgorithms.length) {
      throw new Error('Selecione pelo menos 1 algoritmo para comparar.');
    }

    destroyPanels();
    tableEl.innerHTML = '<p class="compare-loading">Calculando todos os algoritmos…</p>';
    playing = false;
    gridEl.style.setProperty('--compare-cols', String(computeGridCols(activeAlgorithms.length)));

    const results = await compareAll(mazePayload, dlsLimit, activeAlgorithms, limits);

    for (const name of activeAlgorithms) {
      buildPanel(name, mazePayload);
      const panel = panels.get(name);
      const row = results[name];

      if (!row) {
        panel.error = 'Sem resposta';
        panel.container.classList.add('compare-panel--error');
        continue;
      }

      if (row.error) {
        panel.error = row.error;
        panel.container.classList.add('compare-panel--error');
        const msg = document.createElement('p');
        msg.className = 'compare-panel-msg';
        msg.textContent = row.error.includes('implement') ? 'Não implementado' : row.error;
        panel.container.appendChild(msg);
        continue;
      }

      if (panel.error || !panel.scene) continue;

      panel.steps = row.steps || [];
      panel.metrics = row.metrics;
      const first = panel.steps.find((s) => s.type === 'current' || s.type === 'visit');
      if (first) panel.scene.moveBallTo(first.pos[0], first.pos[1], true);
    }

    renderTable(results, activeAlgorithms);
    requestAnimationFrame(() => {
      panels.forEach((p) => p.scene?.resize());
    });
    return results;
  }

  function resetAnimation() {
    playing = false;
    panels.forEach((p) => {
      if (p.error || !p.scene) return;
      p.stepIdx.value = 0;
      p.frameAcc.value = 0;
      p.done = false;
      p.container.classList.remove('compare-panel--done');
      p.scene.resetColors();
      const first = p.steps.find((s) => s.type === 'current' || s.type === 'visit');
      if (first) p.scene.moveBallTo(first.pos[0], first.pos[1], true);
      else p.scene.hideBall();
    });
  }

  function startAnimation() {
    const runnable = [...panels.values()].some((p) => !p.error && p.steps.length);
    if (runnable) playing = true;
    return playing;
  }

  function tickAnimation(speed) {
    if (!playing) {
      panels.forEach((p) => {
        if (!p.error && p.scene) {
          p.scene.tickAnimation(false, p.steps, p.stepIdx, speed, p.frameAcc);
        }
      });
      return false;
    }

    let anyPlaying = false;

    panels.forEach((p) => {
      if (p.error || !p.scene || p.done || !p.steps.length) {
        if (p.scene) p.scene.tickAnimation(false, p.steps, p.stepIdx, speed, p.frameAcc);
        return;
      }

      const still = p.scene.tickAnimation(true, p.steps, p.stepIdx, speed, p.frameAcc);
      if (!still) {
        p.done = true;
        p.container.classList.add('compare-panel--done');
      } else {
        anyPlaying = true;
      }
    });

    playing = anyPlaying;
    return playing;
  }

  function resizeAll() {
    panels.forEach((p) => p.scene?.resize());
  }

  return {
    loadAndRun,
    resetAnimation,
    startAnimation,
    tickAnimation,
    resizeAll,
    destroyPanels,
  };
}
