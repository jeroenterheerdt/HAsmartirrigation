[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=flat-square)](https://github.com/hacs/integration)
[![release][release-badge]][release-url]

[![Support the author on Patreon][patreon-shield]][patreon]

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

[patreon-shield]: https://frenck.dev/wp-content/uploads/2019/12/patreon.png
[patreon]: https://www.patreon.com/dutchdatadude

[buymeacoffee]: https://www.buymeacoffee.com/dutchdatadude
[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png
[release-url]: https://github.com/jeroenterheerdt/HASmartIrrigation/releases
[release-badge]: https://img.shields.io/github/v/release/jeroenterheerdt/HASmartIrrigation?style=flat-square
# Smart Irrigation

![](logo.png?raw=true)

```diff
- WARNING: upgrading from V1 (V0.0.X) to V2 (V2023.X.X)? Read the instructions below!
```

| :warning: WARNING Are you upgrading from v0.0.X (aka V1) to V2023.X.X (aka V2)? |
|:---------------------------|
| Stop what you're doing and [capture your V1 configuration](https://jeroenterheerdt.github.io/HAsmartirrigation/installation-migration.html) _before_ installing V2. V2 is a complete overhaul of this integration and there is no upgrade path. This means that effectively you will have to start over. See the [docs](https://jeroenterheerdt.github.io/HAsmartirrigation/installation-migration.html) for instructions. We will not be able to recover your V1 configuration if you don't capture it before installing V2. |

This integration calculates the time to run your irrigation system to compensate for moisture loss by [evapotranspiration](https://en.wikipedia.org/wiki/Evapotranspiration). Using this integration you water your garden, lawn or crops precisely enough to compensate what has evaporated. It takes into account precipitation (rain, snow) and moisture loss caused by evapotranspiration and adjusts accordingly.
If it rains or snows less than the amount of moisture lost, then irrigation is required. Otherwise, no irrigation is required.
The integration can take into account weather forecasts for the coming days and also keeps track of the total moisture lost or added ('bucket')
Multiple zones are supported with each zone having it own configuration and set up.

## Development

For contributors and developers:

### Quick Setup

```bash
# Clone and setup development environment
git clone <repository-url>
cd HAsmartirrigation
make setup
```

### Available Commands

```bash
make help        # Show all available commands
make test        # Run all tests
make test-knmi   # Test KNMI integration
make format      # Format code
make lint        # Run linting
```

### Testing

To run the tests for this Smart Irrigation custom component:

#### Prerequisites

1. Install test requirements:
   ```bash
   pip install -r requirements.test.txt
   ```

#### Running Tests

Run all tests:
```bash
pytest
```

Run specific test directories:
```bash
# Tests in the main tests/ directory
pytest tests/

# Tests in the custom component
pytest custom_components/smart_irrigation/tests/
```

Run specific test files:
```bash
pytest tests/test_services.py
pytest custom_components/smart_irrigation/tests/test_init.py
```

#### Test Structure

The project has two test directories:
- `tests/` - Integration tests and component behavior tests
- `custom_components/smart_irrigation/tests/` - Unit tests for the custom component

#### Troubleshooting Tests

If you encounter issues:

1. **Missing Home Assistant objects**: The test infrastructure includes mocks for Home Assistant core objects like `hass.config` and `hass.data`. If you get AttributeErrors, ensure the fixtures are properly imported.

2. **Import errors**: Make sure you're running tests from the repository root directory. The test configuration automatically adds the necessary paths.

3. **Module not found errors**: Ensure all test dependencies are installed:
   ```bash
   pip install -r requirements.test.txt
   ```

4. **Async/await issues**: Tests use pytest-asyncio. Make sure async test functions are properly marked and fixtures are compatible.

#### Known Test Limitations

Some test files reference modules that don't exist in the current codebase (e.g., `core.zone`, `core.updater`). These have been disabled with `.disabled` extensions until the corresponding functionality is implemented or the tests are updated.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development instructions.

## Read the docs: https://jeroenterheerdt.github.io/HAsmartirrigation/
