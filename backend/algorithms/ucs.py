"""UCS — implementado (custo uniforme)."""

from __future__ import annotations

import heapq
from itertools import count

from .base import Search, SearchTrace
from backend.domain.maze import Maze2D

class UniformCostSearch(Search):
    
    def _search_impl(
        self,
        maze: Maze2D,
        start: tuple[int, int],
        goal: tuple[int, int],
        trace: SearchTrace,
    ) -> dict:
        pq: list[tuple[float, int, tuple[int, int]]] = []
        parent: dict[tuple[int, int], tuple[int, int] | None] = {start: None}
        best_cost: dict[tuple[int, int], float] = {start: 0.0}
        tie_breaker = count()

        heapq.heappush(pq, (0.0, next(tie_breaker), start))
        found = False

        while pq:
            cost, _, cur = heapq.heappop(pq)

            if cost != best_cost.get(cur, float("inf")):
                continue

            trace.current(cur, len(pq), cost)
            trace.visit(cur, len(pq), cost)

            if cur == goal:
                found = True
                break

            for nb in maze.neighbors(cur):
                new_cost = cost + 1.0

                if new_cost < best_cost.get(nb, float("inf")):
                    best_cost[nb] = new_cost
                    parent[nb] = cur
                    heapq.heappush(pq, (new_cost, next(tie_breaker), nb))
                    trace.frontier(nb, len(pq), new_cost)

        path = trace.path_from_parent(parent, goal) if found else []
        return {"path": path, "found": found, "visited_order": trace.visited_order}
