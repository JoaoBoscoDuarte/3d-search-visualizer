"""BFS — implementado por você (referência para o grupo)."""

from collections import deque

from .base import Search, SearchTrace
from backend.domain.maze import Maze2D

class BreadthFirstSearch(Search):
    
    def _search_impl(
        self,
        maze: Maze2D,
        start: tuple[int, int],
        goal: tuple[int, int],
        trace: SearchTrace,
    ) -> dict:
        queue = deque([start])
        parent: dict[tuple[int, int], tuple[int, int] | None] = {start: None}
        visited: set[tuple[int, int]] = {start}
        found = False

        while queue:
            cur = queue.popleft()
            trace.current(cur, len(queue))
            trace.visit(cur, len(queue))

            if cur == goal:
                found = True
                break

            for nb in maze.neighbors(cur):
                if nb not in visited:
                    visited.add(nb)
                    parent[nb] = cur
                    queue.append(nb)
                    trace.frontier(nb, len(queue))

        path = trace.path_from_parent(parent, goal) if found else []
        return {"path": path, "found": found, "visited_order": trace.visited_order}
