/** Estado e geração do labirinto 2D (grid lógico). */

export function createMazeModel(initialRows = 11, initialCols = 11) {
  const state = {
    rows: initialRows,
    cols: initialCols,
    grid: [],
    start: [0, 0],
    goal: [initialRows - 1, initialCols - 1],
    mode: 'path',
    phase: 'edit',
  };

  function carveRandom() {
    const { rows, cols } = state;
    state.grid = Array.from({ length: rows }, () => Array(cols).fill(1));
    const stack = [[0, 0]];
    state.grid[0][0] = 0;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    while (stack.length) {
      const [r, c] = stack[stack.length - 1];
      const opts = [];

      for (const [dr, dc] of dirs) {
        const nr = r + dr * 2;
        const nc = c + dc * 2;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && state.grid[nr][nc] === 1) {
          opts.push([dr, dc, nr, nc]);
        }
      }

      if (!opts.length) {
        stack.pop();
        continue;
      }

      const [dr, dc, nr, nc] = opts[Math.floor(Math.random() * opts.length)];
      state.grid[r + dr][c + dc] = 0;
      state.grid[nr][nc] = 0;
      stack.push([nr, nc]);
    }

    state.start = [0, 0];
    state.goal = [rows - 1, cols - 1];
    state.grid[state.start[0]][state.start[1]] = 0;
    state.grid[state.goal[0]][state.goal[1]] = 0;
  }

  function ensureOddDimensions() {
    if (state.rows % 2 === 0) state.rows++;
    if (state.cols % 2 === 0) state.cols++;
  }

  function resize(rows, cols) {
    state.rows = rows;
    state.cols = cols;
    ensureOddDimensions();
    carveRandom();
  }

  function setMode(mode) {
    state.mode = mode;
  }

  function setPhase(phase) {
    state.phase = phase;
  }

  function applyCellEdit(r, c) {
    if (state.mode === 'start') {
      state.start = [r, c];
      state.grid[r][c] = 0;

    } else if (state.mode === 'goal') {
      state.goal = [r, c];
      state.grid[r][c] = 0;

    } else if (state.mode === 'wall') {
      state.grid[r][c] = 1;
      
    } else {
      state.grid[r][c] = 0;
    }
  }

  function toJSON() {
    return {
      grid: state.grid,
      size: { rows: state.rows, cols: state.cols },
      start: state.start,
      goal: state.goal,
    };
  }

  function baseColor(r, c, COLORS) {
    if (r === state.start[0] && c === state.start[1]) return COLORS.start;
    if (r === state.goal[0] && c === state.goal[1]) return COLORS.goal;
    return state.grid[r][c] === 1 ? COLORS.wall : COLORS.floor;
  }

  carveRandom();

  return {
    state,
    carveRandom,
    resize,
    setMode,
    setPhase,
    applyCellEdit,
    toJSON,
    baseColor,
    ensureOddDimensions,
  };
}
