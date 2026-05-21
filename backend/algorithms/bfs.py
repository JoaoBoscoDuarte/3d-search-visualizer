from .base import Search
from collections import deque

class BreadthFirstSearch(Search):
    def _search_impl(self, maze, start, goal):
        queue = deque([start])
        came_from = {start: None}
        visited_order = []

        while queue:
            current = queue.popleft()
            visited_order.append(current)

            if current == goal:
                break

            for neighbor in maze.neighbors(current):
                if neighbor not in came_from:
                    came_from[neighbor] = current
                    queue.append(neighbor)

        found = goal in came_from
        path = []

        if found:
            node = goal
            
            while node is not None:
                path.append(node)
                node = came_from[node]
            path.reverse()

        return {
            "path": path,
            "visited_order": visited_order,
            "found": found,
        }