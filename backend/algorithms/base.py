from abc import ABC, abstractmethod
import time
from typing import Any, Dict, List

class Search(ABC):

    def search(self, maze: Any) -> Dict[str, Any]:
        """Executa o algoritmo e retorna resultados padronizados."""
        start = maze.start                               # Pega o bloco de início
        goal = maze.goal                                 # Pega o bloco de finalização
        t0 = time.time()                                 # Inicia profundidade de tempo
        result = self._search_impl(maze, start, goal)    # Chama o algorítmo específico
        duration_ms = (time.time() - t0) * 1000          # Finaliza o calculo de profundidade de tempo

        visited_order = result.get('visited_order', [])  # Lugares visitados
        path = result.get('path', [])                    # Caminho percorrido
        found = result.get('found', False)               # Se o caminho foi encontrado

        # Retorna todos os atributos anteriores
        return {
            'path': path,
            'visited_order': visited_order,
            'metrics': {
                'nodes_visited': len(visited_order),
                'cost': len(path) - 1 if found else None,
                'found': found,
                'time_ms': duration_ms,
            },
        }
    
    # Metodo abstrato para implementação dos algorítmos de busca
    @abstractmethod
    def _search_impl(self, maze: Any, start: Any, goal: Any) -> Dict[str, Any]:
        """Implementar o algoritmo específico de busca."""
        pass
