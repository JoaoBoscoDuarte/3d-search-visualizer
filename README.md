# 3D Search Visualizer

Labirinto **2D** (4 direções) com visualização **3D** (Three.js) e backend Python (FastAPI).

## Rodar com Docker (recomendado)

Pré-requisito: [Docker](https://docs.docker.com/get-docker/) e Docker Compose.

```bash
cd 3d-search-visualizer
docker compose up --build
```

Abra **http://localhost:8000**

Parar:

```bash
docker compose down
```

### Desenvolvimento (hot-reload)

```bash
docker compose --profile dev up --build
```

Ou: `make dev`

## Rodar sem Docker

```bash
cd 3d-search-visualizer
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn backend.api.app:app --reload --port 8000
```

## Estrutura

```
backend/
  api/           # FastAPI
  domain/        # Maze2D
  algorithms/    # BFS, DFS, DLS (prontos) + stubs IDS/UCS
  services/      # Registry de algoritmos
frontend/public/ # HTML, CSS, JS (módulos separados)
tests/
docs/ALGORITMOS.md
```

## Testes

```bash
pip install -r requirements-dev.txt
PYTHONPATH=. pytest tests/ -v
```
