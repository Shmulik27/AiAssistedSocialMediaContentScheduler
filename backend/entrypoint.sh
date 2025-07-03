#!/bin/bash
set -e

# Run migrations (if using Alembic)
# alembic upgrade head

exec gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 --workers 2 