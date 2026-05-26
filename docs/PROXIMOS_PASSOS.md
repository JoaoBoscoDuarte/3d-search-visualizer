# Guia do projeto — o que já está pronto e próximos passos

Este documento é para o grupo: resume o que já foi feito na base do **3D Search Visualizer** e sugere tarefas para continuar o trabalho em conjunto.

Para implementar um algoritmo específico, use também [ALGORITMOS.md](ALGORITMOS.md).

---

## O que já está feito

### Infraestrutura e execução

| Item | Descrição |
|------|-----------|
| **Docker + Compose** | Imagem Python, serviço na porta 8000, `docker compose up --build` |
| **Perfil de desenvolvimento** | Hot-reload do backend e do frontend (`docker compose --profile dev` ou `make dev`) |
| **Makefile** | Atalhos: `up`, `down`, `dev`, `build`, `logs`, `test` |
| **FastAPI** | API REST + servir o frontend estático na mesma origem |
| **CORS** | Liberado para facilitar testes locais |
| **Health check** | `GET /api/health` |

### Backend — domínio e serviços

| Item | Descrição |
|------|-----------|
| **Modelo do labirinto (`Maze2D`)** | Grade 2D, início/meta, vizinhos nas 4 direções, serialização JSON |
| **Contrato dos algoritmos** | Classe base `Search`, `SearchTrace` (passos para animação), métricas automáticas |
| **Registry de algoritmos** | BFS, DFS, DLS, IDS, UCS registrados em `runner.py` |
| **Endpoint `/api/run`** | Executa um algoritmo no labirinto enviado pelo front |
| **Endpoint `/api/compare`** | Roda todos os algoritmos e devolve métricas (útil para comparação; ainda sem UI) |
| **Tratamento de erro 501** | Algoritmos não implementados retornam mensagem clara para o frontend |

### Algoritmos

| Algoritmo | Arquivo | Status |
|-----------|---------|--------|
| **BFS** | `backend/algorithms/bfs.py` | Implementado (referência para o grupo) |
| **DFS** | `backend/algorithms/dfs.py` | Implementado (referência: `tests/test_dfs.py`) |
| **DLS** | `backend/algorithms/dls.py` | Implementado (recebe `depth_limit`; ver `tests/test_dls.py`) |
| **IDS** | `backend/algorithms/ids.py` | Implementado (recebe `depth_limit`; ver `tests/test_ids.py`) |
| **UCS** | `backend/algorithms/ucs.py` | Implementado (custo uniforme; ver `tests/test_ucs.py`) |

### Testes

| Item | Descrição |
|------|-----------|
| **`tests/test_bfs.py`** | BFS encontra a meta em labirinto de exemplo |
| **`tests/test_dfs.py`** | DFS encontra a meta (novo teste) |
| **`tests/test_dls.py`** | DLS encontra a meta com limite suficiente (novo teste) |
| **`tests/test_ids.py`** | IDS encontra a meta e falha com limite baixo (novo teste) |
| **`tests/test_ucs.py`** | UCS encontra a meta (novo teste) |

### Frontend — visualização e UX

| Item | Descrição |
|------|-----------|
| **Editor de labirinto** | Clique nas células: caminho, parede, início, meta |
| **Tamanho da grade** | Linhas/colunas ímpares (5–21), botão “Aplicar tamanho” |
| **Labirinto aleatório** | Geração automática para testes rápidos |
| **Renderização 3D (Three.js)** | Paredes, chão, cores por estado da busca |
| **Animação da busca** | Bolinha (nó atual), fronteira (amarelo), visitado (roxo), caminho final (laranja) |
| **Controles** | Executar, animar, reiniciar animação, controle de velocidade |
| **Métricas básicas** | Visitados, tamanho do caminho, tempo (ms), meta encontrada ou não |
| **Seleção de algoritmo** | Dropdown BFS/DFS/DLS/IDS/UCS; limite de profundidade visível para DLS/IDS |
| **Módulos JS separados** | `maze-model`, `scene3d`, `search-api`, `app` |

### Documentação existente

- [README.md](../README.md) — como rodar o projeto
- [ALGORITMOS.md](ALGORITMOS.md) — contrato e uso do `trace` na implementação

## Próximos passos (prioridade sugerida)

### 2. Visualização da comparação de métricas (média prioridade)

O backend já expõe `POST /api/compare`, mas o frontend **ainda não chama** esse endpoint.

Sugestões para quem for cuidar do front:

- Botão **“Comparar todos”** que chama `/api/compare` com o labirinto atual.
- Painel ou tabela com colunas: algoritmo, visitados, tamanho do caminho, tempo (ms), encontrou?, erro.
- Destacar o “melhor” em cada métrica (ex.: menor número de visitados, caminho mais curto).
- Tratar `error: "Não implementado"` sem quebrar a UI (mostrar “—” ou badge “pendente”).

Arquivos prováveis: `frontend/public/js/search-api.js`, `app.js`, `index.html`, `main.css`.

### 3. Ajustes e melhorias no frontend (média / baixa prioridade)

- **Responsividade:** header e HUD em telas menores.
- **Feedback visual:** loading durante a requisição; desabilitar “Executar” enquanto calcula.
- **Comparação lado a lado:** após comparar, permitir clicar em um algoritmo e carregar a animação dele (reutilizar `steps` de um novo `/api/run` se necessário).
- **Legenda / acessibilidade:** tooltips nos modos de edição; contraste das cores.
- **Persistência opcional:** salvar labirinto no `localStorage` para não perder ao recarregar a página.

### 4. Expandir testes e CI (média prioridade)

- Testes unitários para cada algoritmo implementado.
- Casos: labirinto sem solução, meta igual ao início, grade mínima.
- (Opcional) GitHub Actions: `pytest` em todo push/PR.

### 5. Melhorias no backend (baixa prioridade)

- Validar labirinto na API (início/meta em célula livre, grade consistente).
- Documentar OpenAPI (`/docs`) com exemplos de payload.
- Limitar tamanho máximo da grade na API para evitar buscas muito lentas.

### 6. Ideias extras (se sobrar tempo)

- Exportar/importar labirinto (JSON).
- Modo “passo a passo” manual (avançar um `step` por clique).
- Gráfico de barras das métricas da comparação (Chart.js ou canvas simples).
- Heurísticas / A* (novo algoritmo, fora do escopo inicial).
- Vídeo ou GIF curto no README mostrando BFS + comparação.

## Comandos úteis

```bash
# Subir o projeto
docker compose up --build
# ou: make up

# Desenvolvimento com reload
docker compose --profile dev up --build
# ou: make dev

# Testes
pip install -r requirements-dev.txt
PYTHONPATH=. pytest tests/ -v
# ou: make test
```

Abrir: **http://localhost:8000**

---

## Ordem sugerida para o grupo

1. **Todos:** rodar o projeto uma vez e ver o BFS animado.
2. **Cada um:** implementar seu algoritmo + teste.
3. **1–2 pessoas:** UI de comparação (`/api/compare`).
4. **Opcional:** polish do front, CI, documentação no README.

Dúvidas sobre o contrato dos algoritmos → [ALGORITMOS.md](ALGORITMOS.md).  
Dúvidas sobre como rodar → [README.md](../README.md).
