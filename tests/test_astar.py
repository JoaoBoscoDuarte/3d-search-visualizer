import pytest

from backend.domain.maze import Maze2D
from backend.algorithms.astar import AStarSearch


def test_astar_simple():
    """Teste simples: caminho direto."""
    grid = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ]
    maze = Maze2D(grid, 3, 3, (0, 0), (2, 2))
    
    search = AStarSearch()
    result = search.search(maze)
    
    assert result["metrics"]["found"] is True
    assert len(result["path"]) > 0
    # Caminho ótimo: (0,0) -> (1,0) -> (2,0) -> (2,1) -> (2,2) = 5 passos
    # ou (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2) = 5 passos (ambos ótimos)
    assert result["metrics"]["pathLength"] == 5


def test_astar_with_obstacles():
    """Teste com obstáculos."""
    grid = [
        [0, 1, 0],
        [0, 1, 0],
        [0, 0, 0],
    ]
    maze = Maze2D(grid, 3, 3, (0, 0), (0, 2))
    
    search = AStarSearch()
    result = search.search(maze)
    
    assert result["metrics"]["found"] is True
    assert len(result["path"]) > 0


def test_astar_unreachable():
    """Teste sem caminho possível."""
    grid = [
        [0, 1],
        [1, 0],
    ]
    maze = Maze2D(grid, 2, 2, (0, 0), (1, 1))
    
    search = AStarSearch()
    result = search.search(maze)
    
    assert result["metrics"]["found"] is False
    assert len(result["path"]) == 0


def test_astar_start_equals_goal():
    """Teste quando início e fim são o mesmo."""
    grid = [
        [0, 0],
        [0, 0],
    ]
    maze = Maze2D(grid, 2, 2, (0, 0), (0, 0))
    
    search = AStarSearch()
    result = search.search(maze)
    
    assert result["metrics"]["found"] is True
    # Caminho deve ser só o próprio ponto
    assert result["metrics"]["pathLength"] == 1
