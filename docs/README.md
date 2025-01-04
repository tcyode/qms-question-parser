# Documentation 📚

💡 Think of it as a complete manual set:
- `Setup/` = Getting Started
- `User Guide/` = Daily Operations
- `Admin Guide/` = Behind the Scenes
  
## Contents
- Setup Guide
- User Manual
- Admin Guide
- Troubleshooting

## Quick Start
1. Sheet Structure
2. Parser Configuration
3. Common Issues

## Reference
- Data Formats
- Function Documentation
- Error Codes

# Mock Data Structure 🔧

## Purpose
Centralized location for all mock data used in testing. This structure ensures:
- Consistent test data across all tests
- Single source of truth for mock responses
- Easy maintenance and updates
- Reduced duplication

## Mock Files
1. `mockDiscordApi.js`
   - Discord message formats
   - API response structures
   - Error scenarios
   - Webhook payloads

2. `mockSheetsData.js`
   - Sheet responses
   - Question bank data
   - Raw input examples
   - Processing results

3. `mockParsingData.js`
   - Input/output pairs
   - Edge cases
   - Invalid formats
   - Special characters

## Usage Guidelines
- Import only needed mock data
- Use destructuring for partial imports
- Keep mock data immutable
- Document any mock data changes

## Example Usage