# Smart Irrigation Development Makefile

.PHONY: help setup test lint format clean install-dev

# Default target
help:
	@echo "Smart Irrigation Development Commands:"
	@echo ""
	@echo "Setup:"
	@echo "  setup       - Create virtual environment and install dependencies"
	@echo "  install-dev - Install development dependencies (assumes venv exists)"
	@echo ""
	@echo "Testing:"
	@echo "  test        - Run all tests"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint        - Run linting (flake8)"
	@echo "  format      - Format code (black + isort)"
	@echo "  type-check  - Run type checking (mypy)"
	@echo ""
	@echo "Utilities:"
	@echo "  clean       - Remove virtual environment and cache files"

# Setup virtual environment
setup:
	python3 -m venv venv
	./venv/bin/pip install --upgrade pip
	./venv/bin/pip install -r requirements-dev.txt
	@echo ""
	@echo "✅ Setup complete! Activate with: source venv/bin/activate"

# Install development dependencies (assumes venv exists)
install-dev:
	./venv/bin/pip install --upgrade pip
	./venv/bin/pip install -r requirements-dev.txt

# Run all tests (exclude integration tests which have fixtures)
test:
	./venv/bin/python -m pytest tests/ -v --ignore=tests/integration/

# Code formatting
format:
	./venv/bin/black .
	./venv/bin/isort .
	@echo "✅ Code formatted"

# Linting
lint:
	./venv/bin/flake8 custom_components/smart_irrigation/
	@echo "✅ Linting complete"

# Type checking
type-check:
	./venv/bin/mypy custom_components/smart_irrigation/ --ignore-missing-imports
	@echo "✅ Type checking complete"

# Clean up
clean:
	rm -rf venv/
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	@echo "✅ Cleaned up"

# Run all quality checks
check: lint type-check
	@echo "✅ All checks passed"
