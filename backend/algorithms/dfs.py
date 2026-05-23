"""DFS — a implementar pelo integrante responsável."""

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
        raise NotImplementedError(
            "Implemente a busca em profundidade (pilha/LIFO). "
            "Use trace.current(), trace.visit(), trace.frontier() e "
            "trace.path_from_parent(parent, goal) ao encontrar a meta."
        )
