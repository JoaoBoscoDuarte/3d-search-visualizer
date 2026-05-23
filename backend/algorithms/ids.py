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
        raise NotImplementedError(
            f"Implemente aprofundamento iterativo (0..{self.max_depth}). "
            "Repita DLS aumentando o limite até encontrar a meta."
        )
