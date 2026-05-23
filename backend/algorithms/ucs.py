"""UCS — a implementar pelo integrante responsável."""

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
        raise NotImplementedError(
            "Implemente busca de custo uniforme (fila de prioridade por g(n)). "
            "Custo de cada passo pode ser 1. Use trace.frontier(nb, ..., cost=g)."
        )
