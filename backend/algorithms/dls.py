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
        raise NotImplementedError(
            f"Implemente busca com limite de profundidade ({self.depth_limit}). "
            "Use backtracking (on_path) para não revisitar nós no mesmo ramo."
        )
