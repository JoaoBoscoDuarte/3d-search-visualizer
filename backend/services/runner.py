from backend.algorithms import (
    AStarSearch,
    BreadthFirstSearch,
    DepthFirstSearch,
    DepthLimitedSearch,
    IterativeDeepeningSearch,
    UniformCostSearch,
)
from backend.domain.maze import Maze2D

_REGISTRY: dict[str, type] = {
    "ASTAR": AStarSearch,
    "BFS": BreadthFirstSearch,
    "DFS": DepthFirstSearch,
    "DLS": DepthLimitedSearch,
    "IDS": IterativeDeepeningSearch,
    "UCS": UniformCostSearch,
}

def create_runner(algorithm: str, depth_limit: int = 50):
    cls = _REGISTRY.get(algorithm)

    if cls is None:
        raise ValueError(f"Algoritmo desconhecido: {algorithm}")
    
    if algorithm in ("DLS", "IDS"):
        return cls(depth_limit)
    
    return cls()

def run_algorithm(maze_data: dict, algorithm: str, depth_limit: int = 50) -> dict:
    maze = Maze2D.from_json(maze_data)
    runner = create_runner(algorithm, depth_limit)
    return runner.search(maze)

def compare_all(
    maze_data: dict,
    depth_limit: int = 50,
    selected_algorithms: list[str] | None = None,
    limits: dict[str, int] | None = None,
) -> dict:
    results = {}
    selected = selected_algorithms or list(_REGISTRY.keys())
    algo_limits = limits or {}

    for name in selected:
        try:
            current_limit = int(algo_limits.get(name, depth_limit))
            full = run_algorithm(maze_data, name, current_limit)
            steps = full.get("steps", [])
            results[name] = {
                "metrics": full["metrics"],
                "steps": steps,
                "stepCount": len(steps),
            }

        except NotImplementedError as e:
            results[name] = {
                "metrics": {
                    "visited": 0,
                    "pathLength": 0,
                    "elapsedMs": 0,
                    "found": False,
                },
                "steps": [],
                "stepCount": 0,
                "error": str(e),
            }

        except Exception as e:
            results[name] = {
                "metrics": {
                    "visited": 0,
                    "pathLength": 0,
                    "elapsedMs": 0,
                    "found": False,
                },
                "steps": [],
                "stepCount": 0,
                "error": str(e),
            }
    return results
