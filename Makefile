.PHONY: run start test build install lint docker-up docker-down

run:
	python main.py

start:
	python main.py

test:
	pytest backend/tests -v

build:
	cd frontend && npm run build

install:
	pip install -r backend/requirements.txt
	cd frontend && npm install

lint:
	ruff check backend

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down
