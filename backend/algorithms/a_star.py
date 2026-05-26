from __future__ import annotations

import heapq
from itertools import count

from .base import Search, SearchTrace
from backend.domain.maze import Maze2D

class AStarSearch(Search):
    """
    A* usa uma heurística para guiar a busca.
    f(n) = g(n) + h(n)
    - g(n): custo real do caminho até n
    - h(n): heurística (distância Manhattan até o objetivo)
    """

    @staticmethod
    def heuristic(pos: tuple[int, int], goal: tuple[int, int]) -> float:
        """Heurística Manhattan: distância de taxi até o objetivo."""
        return abs(pos[0] - goal[0]) + abs(pos[1] - goal[1])

    def _search_impl(
        self,
        maze: Maze2D,
        start: tuple[int, int],
        goal: tuple[int, int],
        trace: SearchTrace,
    ) -> dict:
        # Priority queue: (f_score, tie_breaker, pos)
        pq: list[tuple[float, int, tuple[int, int]]] = []
        parent: dict[tuple[int, int], tuple[int, int] | None] = {start: None}
        g_score: dict[tuple[int, int], float] = {start: 0.0}  # Custo real
        tie_breaker = count()

        h_start = self.heuristic(start, goal)
        f_start = 0.0 + h_start
        heapq.heappush(pq, (f_start, next(tie_breaker), start))
        found = False

        while pq:
            f_score, _, cur = heapq.heappop(pq)
            
            # Pula se já encontramos um caminho melhor
            g_cur = g_score.get(cur, float("inf"))
            h_cur = self.heuristic(cur, goal)
            if f_score != g_cur + h_cur:
                continue

            trace.current(cur, len(pq), g_cur)
            trace.visit(cur, len(pq), g_cur)

            if cur == goal:
                found = True
                break

            for nb in maze.neighbors(cur):
                new_g = g_cur + 1.0  # Custo uniforme entre vizinhos
                
                if new_g < g_score.get(nb, float("inf")):
                    g_score[nb] = new_g
                    parent[nb] = cur
                    h_nb = self.heuristic(nb, goal)
                    f_nb = new_g + h_nb
                    heapq.heappush(pq, (f_nb, next(tie_breaker), nb))
                    trace.frontier(nb, len(pq), new_g)

        path = trace.path_from_parent(parent, goal) if found else []
        return {"path": path, "found": found, "visited_order": trace.visited_order}
