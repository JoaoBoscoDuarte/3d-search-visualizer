import pytest

from backend.algorithms.ids import IterativeDeepeningSearch
from backend.domain.maze import Maze2D

MAZE_JSON = {
    "grid": [
        [0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
    ],
    "size": {"rows": 5, "cols": 5},
    "start": [0, 0],
    "goal": [4, 4],
}


def test_ids_finds_goal():
    maze = Maze2D.from_json(MAZE_JSON)
    result = IterativeDeepeningSearch(max_depth=50).search(maze)
    assert result["metrics"]["found"] is True
    assert result["metrics"]["pathLength"] > 0
    assert len(result["steps"]) > 0


def test_ids_fails_with_low_limit():
    maze = Maze2D.from_json(MAZE_JSON)
    result = IterativeDeepeningSearch(max_depth=3).search(maze)
    assert result["metrics"]["found"] is False
    assert result["metrics"]["pathLength"] == 0
    assert len(result["steps"]) > 0
