#!/bin/bash
echo "Running migrations..."
alembic upgrade head

echo "Running seed..."
python -m src.seed

echo "Starting server..."
uvicorn src.main:app --host 0.0.0.0 --port 8000