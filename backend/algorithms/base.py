from __future__ import annotations

import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Literal

from backend.domain.maze import Maze2D

StepType = Literal["visit", "frontier", "path", "current"]

@dataclass
class SearchStep:
    type: StepType
    pos: tuple[int, int]
    queue_size: int = 0
    cost: float = 0.0

@dataclass
class SearchTrace:
    """Registra passos para o visualizador 3D (bolinha + cores)."""

    steps: list[SearchStep] = field(default_factory=list)
    visited_order: list[tuple[int, int]] = field(default_factory=list)

    def current(self, pos: tuple[int, int], queue_size: int = 0, cost: float = 0.0) -> None:
        self.steps.append(SearchStep("current", pos, queue_size, cost))

    def visit(self, pos: tuple[int, int], queue_size: int = 0, cost: float = 0.0) -> None:
        self.visited_order.append(pos)
        self.steps.append(SearchStep("visit", pos, queue_size, cost))

    def frontier(self, pos: tuple[int, int], queue_size: int = 0, cost: float = 0.0) -> None:
        self.steps.append(SearchStep("frontier", pos, queue_size, cost))

    def path_from_parent(
        self, parent: dict[tuple[int, int], tuple[int, int] | None], goal: tuple[int, int]
    ) -> list[tuple[int, int]]:
        
        if goal not in parent:
            return []
        
        path: list[tuple[int, int]] = []
        node: tuple[int, int] | None = goal

        while node is not None:
            path.insert(0, node)
            node = parent[node]

        for pos in path:
            self.steps.append(SearchStep("path", pos, 0))
            
        return path

class Search(ABC):
    """Classe base — implemente `_search_impl` no seu algoritmo."""

    def search(self, maze: Maze2D) -> dict[str, Any]:
        trace = SearchTrace()
        t0 = time.perf_counter()
        result = self._search_impl(maze, maze.start, maze.goal, trace)
        elapsed_ms = (time.perf_counter() - t0) * 1000

        path = result.get("path", [])
        found = result.get("found", False)
        visited_order = result.get("visited_order", trace.visited_order)

        return {
            "path": [list(p) for p in path],
            "visited_order": [list(p) for p in visited_order],
            "steps": [
                {
                    "type": s.type,
                    "pos": list(s.pos),
                    "queueSize": s.queue_size,
                    "cost": s.cost,
                }
                for s in trace.steps
            ],
            "metrics": {
                "visited": len(set(tuple(p) for p in visited_order)),
                "pathLength": len(path),
                "elapsedMs": round(elapsed_ms, 2),
                "found": found,
            },
        }

    @abstractmethod
    def _search_impl(
        self,
        maze: Maze2D,
        start: tuple[int, int],
        goal: tuple[int, int],
        trace: SearchTrace,
    ) -> dict[str, Any]:
        """
        Retorne um dict com:
          - path: list[tuple[int, int]]
          - found: bool
          - visited_order: list[tuple[int, int]]  (opcional se usar trace.visit)
        Use trace.current / trace.visit / trace.frontier durante a busca.
        """
        raise NotImplementedError
