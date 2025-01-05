# Source Code Structure 🔧

💡 **How The Core Modules Work Together:**
User clicks menu → Main coordinates →
Handler activates → Parser processes data →
Config provides settings → Integration handles I/O →
Handler updates sheets

(Utils, Tests, and Mocks support throughout)

## Folders
- `config/`: Configuration files and settings management
- `data/`: Data storage and retrieval
- `handlers/`: Event handlers for Google Sheets triggers
- `integration/`: Platform-specific integrations and external system connectors
- `mocks/`: Test data and mock objects for testing
- `parsing/`: Core parsing logic and data transformation rules
- `tests/`: Test files for unit testing
- `utils/`: Helper functions and common utilities

## Main Functions
- Question parsing and validation
- Image attachment handling
- Data transformation and storage
- Error handling and logging
