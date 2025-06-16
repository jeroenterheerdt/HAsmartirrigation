# Contributing to Smart Irrigation

## Development Setup

### Prerequisites
- Python 3.11 or higher
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HAsmartirrigation
   ```

2. **Create and activate virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install development dependencies**
   ```bash
   pip install --upgrade pip
   pip install -r requirements-dev.txt
   ```

4. **Set up environment variables** (for testing)
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

### Running Tests

```bash
# Run all tests
pytest

# Run KNMI integration test
make test-knmi

# Run specific test file
python tests/integration/test_knmi_integration.py
```

### Code Quality

We use several tools to maintain code quality:

```bash
# Format code
black .

# Sort imports
isort .

# Lint code
flake8 .

# Type checking
mypy custom_components/smart_irrigation/
```

### Pre-commit Hooks

Install pre-commit hooks to automatically run checks:

```bash
pre-commit install
```

### Deactivating Environment

When you're done developing:

```bash
deactivate
```

## Project Structure

- `custom_components/smart_irrigation/` - Main component code
- `tests/` - Unit tests
- `test_*.py` - Integration test scripts
- `requirements-dev.txt` - Development dependencies
- `requirements.test.txt` - Testing dependencies

## Testing Weather Modules

Each weather module can be tested independently:

```bash
# Test KNMI integration
python test_knmi_with_env.py

# Test other integrations
python test_knmi_standalone.py
```

Make sure to set up your `.env` file with the required API keys before running integration tests.
