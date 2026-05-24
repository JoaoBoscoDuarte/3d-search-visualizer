"""DLS — a implementar pelo integrante responsável."""

from .base import Search, SearchTrace
from backend.domain.maze import Maze2D

class DepthLimitedSearch(Search):
    
    def __init__(self, depth_limit: int = 50):
        self.depth_limit = depth_limit

    def _search_impl(
        self,
        maze: Maze2D,
        start: tuple[int, int],
        goal: tuple[int, int],
        trace: SearchTrace,
    ) -> dict:
        parent: dict[tuple[int, int], tuple[int, int] | None] = {start: None}
        found = False

        def dfs(node: tuple[int, int], depth: int, on_path: set[tuple[int, int]]) -> bool:
            nonlocal found
            trace.current(node, len(on_path))
            trace.visit(node, len(on_path))

            if node == goal:
                found = True
                return True

            if depth >= self.depth_limit:
                return False

            for nb in maze.neighbors(node):
                if nb in on_path:
                    continue
                trace.frontier(nb, len(on_path) + 1)
                parent[nb] = node
                on_path.add(nb)
                if dfs(nb, depth + 1, on_path):
                    return True
                on_path.remove(nb)

            return False

        on_path: set[tuple[int, int]] = {start}
        dfs(start, 0, on_path)

        path = trace.path_from_parent(parent, goal) if found else []
        return {"path": path, "found": found, "visited_order": trace.visited_order}
