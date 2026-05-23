.PHONY: up down dev build logs test

up:
	docker compose up --build -d

down:
	docker compose down

dev:
	docker compose --profile dev up --build

build:
	docker compose build

logs:
	docker compose logs -f app

test:
	pip install -q -r requirements-dev.txt
	PYTHONPATH=. pytest tests/ -v
