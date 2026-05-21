# 3d-search-visualizer

Ótimo projeto para a disciplina! Vou montar o fluxo de trabalho completo e já te entregar um diagrama visual da arquitetura.Clique em qualquer bloco do diagrama para aprofundar aquele tópico. Aqui está o plano completo:

---

## Stack tecnológica recomendada

**Backend (Python — majoritário):**
- `FastAPI` — servidor da API com endpoints para rodar os algoritmos
- `numpy` — representar o grid 3D como array multidimensional
- `asyncio` / `concurrent.futures` — rodar todos os algoritmos em paralelo para comparação justa
- `tracemalloc` + `time` — coleta de métricas de memória e tempo
- `pytest` — testes dos algoritmos

**Frontend (mínimo necessário):**
- `Streamlit` — opção mais simples, toda em Python, ideal para disciplina
- `Plotly` (via Streamlit) — visualização 3D do labirinto e dos caminhos encontrados
- Alternativa mais elaborada: `Three.js` em React, se quiser uma UI mais impressionante

---

## Estrutura de pastas sugerida

```
comparador-algoritmos/
├── backend/
│   ├── models/
│   │   └── maze.py          # Classe Maze3D com numpy
│   ├── algorithms/
│   │   ├── base.py          # AbstractSearch (interface comum)
│   │   ├── bfs.py
│   │   ├── dfs.py
│   │   ├── dls.py
│   │   ├── ids.py
│   │   └── ucs.py
│   ├── metrics/
│   │   └── collector.py     # Coleta tempo, nós visitados, memória
│   └── main.py              # FastAPI app
├── frontend/
│   └── app.py               # Streamlit UI
├── tests/
│   └── test_algorithms.py
└── requirements.txt
```

---

## Fases de desenvolvimento

**Fase 1 — Modelagem do labirinto (2–3 dias):** Criar a classe `Maze3D` usando `numpy` com um grid `NxMxP` onde cada célula é livre (0), parede (1), início (S) ou destino (G). Implementar o editor onde o usuário clica para adicionar/remover paredes e define start/goal.

**Fase 2 — Implementação dos algoritmos (3–4 dias):** Todos implementam a mesma interface `solve(maze) -> result` retornando o caminho encontrado, lista de nós visitados na ordem, e metadados para as métricas. O DLS e IDS têm um parâmetro extra de profundidade limite.

**Fase 3 — Visualização 3D (2–3 dias):** Com Plotly 3D scatter/surface, renderizar o labirinto e colorir o caminho de cada algoritmo com uma cor distinta. Animar os nós visitados em ordem para mostrar a "varredura" de cada algoritmo.

**Fase 4 — Comparação de métricas (1–2 dias):** Painel com tabela comparativa e gráficos de barras mostrando para cada algoritmo: tempo de execução (ms), nós visitados, comprimento do caminho encontrado, uso de memória (KB), e se encontrou ou não a solução ótima.

---

## Métricas para comparação

| Métrica | O que revela |
|---|---|
| Tempo total (ms) | Eficiência prática |
| Nós visitados | Custo de busca |
| Comprimento do caminho | Qualidade da solução |
| Memória máxima (KB) | Custo espacial |
| Encontrou caminho ótimo? | Completude e otimalidade |

---

## Por onde começar agora

O ponto de entrada ideal é a classe `Maze3D` e a interface `AbstractSearch` — elas sustentam tudo o mais. Quer que eu gere o código inicial dessa estrutura base, ou prefere começar pela implementação de um algoritmo específico como o BFS?