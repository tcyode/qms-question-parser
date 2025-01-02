# Create the README content
@"
# Test Coverage Reports

## Directory Structure
\`\`\`
test-reports/
├── README.md
├── 2025/
│   └── test-results-20250102.md
├── 2024/
│   └── archived-reports.md
└── templates/
    └── report-template.md
\`\`\`

## Naming Convention
- Format: \`test-results-YYYYMMDD.md\`
- Example: \`test-results-20250102.md\`

## Report Categories
- ✅ High Coverage (>80%)
- 🟨 Partial Coverage (40-80%)
- ❌ Failed Coverage (<40%)

## How to Generate Reports
1. Run test coverage: \`npm test\`
2. Generate report: \`npm run coverage\`
3. Save to appropriate year folder
"@ | Out-File "docs/test-reports/README.md"