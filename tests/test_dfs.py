import pytest

from backend.algorithms.dfs import DepthFirstSearch
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


def test_dfs_finds_goal():
    maze = Maze2D.from_json(MAZE_JSON)
    result = DepthFirstSearch().search(maze)
    assert result["metrics"]["found"] is True
    assert result["metrics"]["pathLength"] > 0
    assert len(result["steps"]) > 0
