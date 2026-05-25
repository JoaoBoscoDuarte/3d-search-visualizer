import pytest

from backend.algorithms.ucs import UniformCostSearch
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


def test_ucs_finds_goal():
    maze = Maze2D.from_json(MAZE_JSON)
    result = UniformCostSearch().search(maze)
    assert result["metrics"]["found"] is True
    assert result["metrics"]["pathLength"] > 0
    assert len(result["steps"]) > 0
