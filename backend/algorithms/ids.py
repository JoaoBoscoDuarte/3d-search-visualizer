"""IDS — a implementar pelo integrante responsável."""

from .base import Search, SearchTrace
from backend.domain.maze import Maze2D

class IterativeDeepeningSearch(Search):
    
    def __init__(self, max_depth: int = 50):
        self.max_depth = max_depth

    def _search_impl(
        self,
        maze: Maze2D,
        start: tuple[int, int],
        goal: tuple[int, int],
        trace: SearchTrace,
    ) -> dict:
        found = False
        parent: dict[tuple[int, int], tuple[int, int] | None] = {}

        def dls(limit: int) -> bool:
            nonlocal parent, found
            parent = {start: None}
            on_path: set[tuple[int, int]] = {start}

            def dfs(node: tuple[int, int], depth: int) -> bool:
                nonlocal found
                trace.current(node, len(on_path))
                trace.visit(node, len(on_path))

                if node == goal:
                    found = True
                    return True

                if depth >= limit:
                    return False

                for nb in maze.neighbors(node):
                    if nb in on_path:
                        continue
                    trace.frontier(nb, len(on_path) + 1)
                    parent[nb] = node
                    on_path.add(nb)
                    if dfs(nb, depth + 1):
                        return True
                    on_path.remove(nb)

                return False

            return dfs(start, 0)

        for depth_limit in range(0, self.max_depth + 1):
            if dls(depth_limit):
                break

        path = trace.path_from_parent(parent, goal) if found else []
        return {"path": path, "found": found, "visited_order": trace.visited_order}
