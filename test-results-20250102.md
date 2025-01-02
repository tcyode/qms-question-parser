# Remove the PowerShell commands from the content
@"
# Test Coverage Report - $(Get-Date -Format 'yyyy-MM-dd')
## Branch: $(git rev-parse --abbrev-ref HEAD)
## Commit: $(git rev-parse --short HEAD)

### High Coverage Components ✅
1. Question Parser
   - Functions: 100% (6/6)
   - Lines: 87.27% (48/55)
   - Status: PASSING

### Partial Coverage Components 🟨
1. Sheets Integration
   - Functions: 11.11% (1/9)
   - Lines: 12.5% (5/40)
   - Status: NEEDS ATTENTION

### Failed Components ❌
1. reorganizeTests.js (0/38 lines)
2. validateDependencies.js (0/21 lines)
3. checkMockDeps.js (0/19 lines)
4. cleanup.js (0/37 lines)
5. generateDependencyGraph.js (0/20 lines)

## Action Items
1. Investigate why utility scripts have 0% coverage
2. Focus on improving Sheets Integration tests
3. Document any error messages or failures
4. Consider reverting to previous version

## Notes
- Most utility scripts are completely untested
- Only Question Parser shows acceptable coverage
- Integration layer needs significant work
"@ | Out-File "test-results-$(Get-Date -Format 'yyyyMMdd').md"
