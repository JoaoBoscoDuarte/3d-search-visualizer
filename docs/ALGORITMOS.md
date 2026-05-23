# Guia para implementar seu algoritmo

## Contrato

1. Herde de `Search` em `backend/algorithms/base.py`.
2. Implemente `_search_impl(maze, start, goal, trace)`.
3. Retorne `{"path": [...], "found": bool, "visited_order": [...]}`.

## Animação no visualizador

Use o objeto `trace` durante a busca:

```python
trace.current(pos, tamanho_fila)   # nó sendo expandido (bolinha)
trace.visit(pos, tamanho_fila)     # célula visitada (roxo)
trace.frontier(pos, tamanho_fila)  # entrou na fila/pilha (amarelo)
# ao encontrar a meta:
path = trace.path_from_parent(parent, goal)
```

O **BFS** em `bfs.py` é o exemplo completo.

## Movimento no labirinto

- `maze.neighbors(pos)` → lista de `(row, col)` livres (4 direções).
- `maze.is_free(pos)`, `maze.start`, `maze.goal`.

## DLS / IDS

Recebem `depth_limit` no construtor (injetado pela API via `dls_limit`).

## Erro esperado até implementar

A API responde **501** com `NotImplementedError` — o frontend mostra a mensagem.
