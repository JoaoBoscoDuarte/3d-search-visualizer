from backend.algorithms import (
    BreadthFirstSearch,
    DepthFirstSearch,
    DepthLimitedSearch,
    IterativeDeepeningSearch,
    UniformCostSearch,
)
from backend.domain.maze import Maze2D

_REGISTRY: dict[str, type] = {
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

def compare_all(maze_data: dict, depth_limit: int = 50) -> dict:
    results = {}

    for name in _REGISTRY:
        try:
            results[name] = run_algorithm(maze_data, name, depth_limit)["metrics"]
            
        except NotImplementedError:
            results[name] = {
                "visited": 0,
                "pathLength": 0,
                "elapsedMs": 0,
                "found": False,
                "error": "Não implementado",
            }
    return results
