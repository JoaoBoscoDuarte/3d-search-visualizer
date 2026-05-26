from pydantic import BaseModel, Field

class MazePayload(BaseModel):
    grid: list
    size: dict
    start: list | None = None
    goal: list | None = None

class RunRequest(MazePayload):
    algorithm: str = Field(..., description="ASTAR | BFS | DFS | DLS | IDS | UCS")
    dls_limit: int = Field(50, description="Limite de profundidade para DLS/IDS")

class CompareRequest(MazePayload):
    dls_limit: int = 50
    selected_algorithms: list[str] | None = None
    limits: dict[str, int] | None = None
