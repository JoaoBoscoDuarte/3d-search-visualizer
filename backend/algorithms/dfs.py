"""DFS — Implementado por Guilherme Lopes"""

from .base import Search, SearchTrace
from backend.domain.maze import Maze2D

class DepthFirstSearch(Search):
    
    def _search_impl(
        self,
        maze: Maze2D,
        start: tuple[int, int],
        goal: tuple[int, int],
        trace: SearchTrace,
    ) -> dict:
        stack: list[tuple[int, int]] = [start]
        parent: dict[tuple[int, int], tuple[int, int] | None] = {start: None}
        visited: set[tuple[int, int]] = {start}
        found = False

        while stack:
            cur = stack.pop()
            trace.current(cur, len(stack))
            trace.visit(cur, len(stack))

            if cur == goal:
                found = True
                break

            for nb in maze.neighbors(cur):
                if nb not in visited:
                    visited.add(nb)
                    parent[nb] = cur
                    stack.append(nb)
                    trace.frontier(nb, len(stack))

        path = trace.path_from_parent(parent, goal) if found else []
        return {"path": path, "found": found, "visited_order": trace.visited_order}
