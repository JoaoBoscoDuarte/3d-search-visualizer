from __future__ import annotations

from dataclasses import dataclass

@dataclass
class Maze2D:
    grid: list
    rows: int
    cols: int
    start: tuple[int, int]
    goal: tuple[int, int]

    FREE, WALL = 0, 1

    @classmethod
    def from_json(cls, data: dict) -> Maze2D:
        size = data["size"]
        rows = int(size["rows"])
        cols = int(size["cols"])
        start = tuple(data.get("start", [0, 0]))
        goal = tuple(data.get("goal", [rows - 1, cols - 1]))
        grid = data["grid"]

        if grid and isinstance(grid[0][0], list):
            grid = grid[0]
            
        return cls(grid, rows, cols, start, goal)

    def in_bounds(self, pos: tuple[int, int]) -> bool:
        r, c = pos
        return 0 <= r < self.rows and 0 <= c < self.cols

    def is_free(self, pos: tuple[int, int]) -> bool:
        if not self.in_bounds(pos):
            return False
        
        r, c = pos
        return self.grid[r][c] == self.FREE

    def neighbors(self, pos: tuple[int, int]) -> list[tuple[int, int]]:
        """Vizinhos válidos: frente, trás, esquerda, direita."""
        r, c = pos
        result = []
        
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nb = (r + dr, c + dc)

            if self.is_free(nb):
                result.append(nb)

        return result

    def to_json(self) -> dict:
        return {
            "grid": self.grid,
            "size": {"rows": self.rows, "cols": self.cols},
            "start": list(self.start),
            "goal": list(self.goal),
        }
