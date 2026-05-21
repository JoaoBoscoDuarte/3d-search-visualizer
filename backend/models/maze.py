# backend/models/maze.py
import numpy as np
import json

class Maze3D:
    # Constantes: representam os diferentes tipos de células
    FREE, WALL, START, GOAL = 0, 1, 2, 3

    # Contrutor, define a quantidade de linhas (largura), colunas (comprimento), altura (layers), 
    # self.grid = ... Criar uma matriz tridimensional  
    def __init__(self, cols: int, rows: int, layers: int):
        self.cols = cols
        self.rows = rows
        self.layers = layers
        self.grid = np.zeros((layers, rows, cols), dtype=int)
        self.start = None
        self.goal = None

    # Verifica se uma cordenada pertence a região espacial válida do labirinto
    def in_bounds(self, pos: tuple) -> bool:
        z, r, c = pos
        return 0 <= z < self.layers and 0 <= r < self.rows and 0 <= c < self.cols

    # erifica se uma posição está livre para o algoritmo caminhar. 
    # Para estar livre, a posição precisa estar dentro dos limites (in_bounds) 
    #                      e o valor ali dentro não pode ser uma parede (WALL).
    def is_free(self, pos: tuple) -> bool:
        return self.in_bounds(pos) and self.grid[pos[0]][pos[1]][pos[2]] != self.WALL

    # Método para criar o labirinto diretamente a partir de um dicionário de dados
    @classmethod
    def from_json(cls, data: dict) -> "Maze3D":
        """
        O método lê o tamanho do labirinto, cria uma instância vazia e depois faz três loops "aninharados" (
        (for) para varrer cada andar (z), cada linha (r) e cada coluna (c). Conforme ele mapeia os valores na 
        matriz self.grid, ele aproveita para salvar automaticamente onde fica o ponto de partida (START) e o 
        ponto de chegada (GOAL).
        """
        s = data["size"]
        maze = cls(s["cols"], s["rows"], s["layers"])

        for z, layer in enumerate(data["grid"]):
            for r, row in enumerate(layer):
                for c, val in enumerate(row):
                    maze.grid[z][r][c] = val

                    if val == cls.START:
                        maze.start = (z, r, c)

                    elif val == cls.GOAL:
                        maze.goal = (z, r, c)
        return maze


    def neighbors(self, pos: tuple) -> list[tuple]:
        """Retorna vizinhos válidos (6-conectividade: cima/baixo/frente/trás/esq/dir)"""
        z, r, c = pos
        result = []
        
        directions = [
            (0, 0, 1),  # Direita
            (0, 0, -1), # Esquerda
            (0, 1, 0),  # Frente
            (0, -1, 0), # Trás
            (1, 0, 0),  # Subir andar
            (-1, 0, 0)  # Descer andar
        ]

        for dz, dr, dc in directions:
            nz, nr, nc = z + dz, r + dr, c + dc

            if self.in_bounds((nz, nr, nc)) and self.grid[nz][nr][nc] != self.WALL:
                result.append((nz, nr, nc))

        return result