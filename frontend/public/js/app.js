import { createMazeModel } from "./maze-model.js";
import { createScene3D } from "./scene3d.js";
import { runSearch } from "./search-api.js";

const maze = createMazeModel(11, 11);
const scene = createScene3D(document.getElementById("canvas-wrap"), maze);

let compareView = null;
let viewMode = "single";
let steps = [];
let stepIdx = { value: 0 };
let frameAcc = { value: 0 };
let playing = false;
let compareLoading = false;

const $ = (id) => document.getElementById(id);

function getSelectedCompareAlgorithms() {
  return [...document.querySelectorAll(".compare-algo:checked")].map(
    (el) => el.value,
  );
}

function getCompareLimits() {
  const limits = {};
  const dls = Number(
    $("compare-limit-dls")?.value || $("dls-limit")?.value || 80,
  );
  const ids = Number(
    $("compare-limit-ids")?.value || $("dls-limit")?.value || 80,
  );
  if (Number.isFinite(dls)) limits.DLS = dls;
  if (Number.isFinite(ids)) limits.IDS = ids;
  return limits;
}

function setViewMode(mode) {
  viewMode = mode;
  const isCompare = mode === "compare";
  const viewSingle = $("view-single");
  const viewCompare = $("view-compare");

  if (!viewSingle || !viewCompare) {
    console.error(
      "HTML desatualizado: faltam #view-single ou #view-compare. Recarregue a página (Ctrl+Shift+R).",
    );
    alert(
      "Interface de comparação não encontrada. Faça um hard refresh (Ctrl+Shift+R) ou reinicie o Docker com build recente.",
    );
    return false;
  }

  viewSingle.classList.toggle("hidden", isCompare);
  viewCompare.classList.toggle("hidden", !isCompare);
  $("btn-exit-compare").style.display = isCompare ? "inline-block" : "none";
  $("btn-run").style.display = isCompare ? "none" : "inline-block";

  const btnCompare = $("btn-compare");

  if (btnCompare)
    btnCompare.style.display = isCompare ? "none" : "inline-block";
  const compareSetup = $("compare-setup");

  if (compareSetup)
    compareSetup.style.display = isCompare ? "none" : "inline-block";
  $("algo").disabled = isCompare;

  if (isCompare) {
    viewCompare.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (compareView) compareView.resizeAll();
  } else {
    scene.resize();
  }
  return true;
}

function setPhase(p) {
  maze.setPhase(p);

  const labels = {
    edit: "Montar labirinto",
    viz: "Visualizar busca",
    compare: "Comparar algoritmos",
  };
  $("phase-label").textContent = labels[p] || p;

  const compareHint = $("compare-hint");
  if (p === "edit") {
    const t =
      "Clique nas células: caminho, parede, início ou meta. Depois execute um algoritmo ou compare todos.";
    if ($("hint")) $("hint").textContent = t;

    if (compareHint) compareHint.textContent = t;
  } else if (p === "compare") {
    const t =
      "Comparação simultânea — use ▶ Animar para ver todos em paralelo; métricas na tabela abaixo.";

    if ($("hint")) $("hint").textContent = t;

    if (compareHint) compareHint.textContent = t;
  } else {
    const t =
      "▶ Animar — bolinha, amarelo = fronteira, roxo = visitado, laranja = caminho final.";

    if ($("hint")) $("hint").textContent = t;

    if (compareHint) compareHint.textContent = t;
  }
}

function setCompareButtonLoading(loading) {
  compareLoading = loading;
  const btn = $("btn-compare");
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? "Calculando…" : "Comparar todos";
}

function setMetrics(m, algo) {
  const el = $("metrics");
  if (!el) return;
  if (!m) {
    el.textContent = "Aguardando execução…";
    return;
  }
  el.innerHTML = `<strong>${algo}</strong><br>
    Visitados: ${m.visited}<br>
    Caminho: ${m.pathLength || "—"}<br>
    Tempo: ${m.elapsedMs} ms<br>
    ${m.found ? "✓ Meta encontrada" : "✗ Sem caminho"}`;
}

async function onRun() {
  const algo = $("algo").value;
  const dlsLimit = +$("dls-limit").value;
  $("metrics").textContent = "Calculando…";
  setViewMode("single");

  try {
    const data = await runSearch(maze.toJSON(), algo, dlsLimit);
    steps = data.steps || [];
    stepIdx.value = 0;
    frameAcc.value = 0;
    playing = false;
    scene.resetColors();
    scene.hideBall();
    setPhase("viz");
    setMetrics(data.metrics, algo);

    const first = steps.find((s) => s.type === "current" || s.type === "visit");
    if (first) scene.moveBallTo(first.pos[0], first.pos[1], true);
  } catch (e) {
    $("metrics").textContent = e.message || "Erro na API";
    console.error(e);
  }
}

async function onCompareAll() {
  if (!compareView) {
    alert(
      "Modo comparação indisponível. Verifique se o arquivo js/compare-view.js existe e recarregue a página (Ctrl+Shift+R).",
    );
    return;
  }

  if (compareLoading) return;

  const dlsLimit = +$("dls-limit").value;
  const selectedAlgorithms = getSelectedCompareAlgorithms();
  if (!selectedAlgorithms.length) {
    alert("Selecione pelo menos 1 algoritmo para visualizar.");
    return;
  }
  const limits = getCompareLimits();
  playing = false;
  setCompareButtonLoading(true);

  if (!setViewMode("compare")) {
    setCompareButtonLoading(false);
    return;
  }
  setPhase("compare");

  const resultsEl = $("compare-results");
  if (resultsEl) {
    resultsEl.innerHTML =
      '<p class="compare-loading">Calculando todos os algoritmos… (pode levar alguns segundos)</p>';
  }

  try {
    await compareView.loadAndRun(maze.toJSON(), {
      dlsLimit,
      selectedAlgorithms,
      limits,
    });
    requestAnimationFrame(() => {
      compareView.resizeAll();
      $("view-compare")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } catch (e) {
    if (resultsEl) {
      resultsEl.innerHTML = `<p class="compare-loading compare-error">${e.message || "Erro na API"}</p>`;
    }
    console.error(e);
  } finally {
    setCompareButtonLoading(false);
  }
}

function exitCompare() {
  if (compareView) {
    compareView.destroyPanels();
    compareView.resetAnimation();
  }
  setViewMode("single");
  setPhase(maze.state.phase === "viz" ? "viz" : "edit");
  scene.resize();
}

function bindUI() {
  $("btn-resize").onclick = () => {
    let rows = +$("rows").value | 1;
    let cols = +$("cols").value | 1;
    if (rows % 2 === 0) rows++;
    if (cols % 2 === 0) cols++;
    $("rows").value = rows;
    $("cols").value = cols;
    maze.resize(rows, cols);
    scene.rebuild();
    setPhase("edit");
    steps = [];
    scene.hideBall();
    if (viewMode === "compare") exitCompare();
  };

  $("btn-random").onclick = () => {
    maze.carveRandom();
    scene.rebuild();
    setPhase("edit");
    steps = [];
    scene.hideBall();
    setMetrics(null);
    if (viewMode === "compare") exitCompare();
  };

  $("btn-run").onclick = onRun;
  const btnCompare = $("btn-compare");
  if (btnCompare) btnCompare.onclick = onCompareAll;
  else console.warn("Botão #btn-compare não encontrado no HTML");

  $("btn-exit-compare").onclick = exitCompare;

  $("btn-play").onclick = () => {
    if (viewMode === "compare") {
      if (!compareView) return;
      playing = compareView.startAnimation();
    } else if (steps.length) {
      playing = true;
    }
  };

  $("btn-reset-viz").onclick = () => {
    if (viewMode === "compare") {
      if (compareView) compareView.resetAnimation();
      playing = false;
      return;
    }
    stepIdx.value = 0;
    frameAcc.value = 0;
    playing = false;
    scene.resetColors();
    const first = steps.find((s) => s.type === "current" || s.type === "visit");
    if (first) scene.moveBallTo(first.pos[0], first.pos[1], true);
    else scene.hideBall();
  };

  ["path", "wall", "start", "goal"].forEach((id) => {
    $(`mode-${id}`).onclick = () => {
      maze.setMode(id);
      ["path", "wall", "start", "goal"].forEach((x) =>
        $(`mode-${x}`).classList.toggle("active", x === id),
      );
      setPhase("edit");
      if (viewMode === "compare") exitCompare();
    };
  });

  $("algo").onchange = () => {
    const a = $("algo").value;
    $("limit-wrap").style.display =
      a === "DLS" || a === "IDS" ? "inline" : "none";
  };

  scene.domElement.addEventListener("pointerdown", (ev) => {
    if (maze.state.phase !== "edit" || viewMode === "compare") return;
    const cell = scene.pickCell(ev);
    if (!cell) return;
    maze.applyCellEdit(cell.r, cell.c);
    scene.rebuild();
  });

  window.addEventListener("resize", () => {
    if (viewMode === "compare" && compareView) compareView.resizeAll();
    else scene.resize();
  });
}

function loop() {
  requestAnimationFrame(loop);
  const speed = +$("speed").value;

  if (viewMode === "compare" && compareView) {
    playing = compareView.tickAnimation(speed);
  } else {
    playing = scene.tickAnimation(playing, steps, stepIdx, speed, frameAcc);
  }
}

async function init() {
  try {
    const { createCompareView } = await import("./compare-view.js");
    const gridEl = $("compare-grid");
    const tableEl = $("compare-results");
    if (!gridEl || !tableEl) {
      console.error("Faltam #compare-grid ou #compare-results no HTML");
    } else {
      compareView = createCompareView(gridEl, tableEl);
    }
  } catch (e) {
    console.error("Falha ao carregar compare-view.js:", e);
    const btn = $("btn-compare");
    if (btn) {
      btn.disabled = true;
      btn.title =
        "Módulo de comparação não carregou — verifique o console (F12)";
    }
  }

  bindUI();
  scene.rebuild();
  scene.resize();
  setPhase("edit");
  setViewMode("single");
  loop();
}

init();
