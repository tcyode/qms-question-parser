/**
 * @fileoverview Jest setup configuration for QMS Question Parser
 * @author [Your Name]
 * @version 1.0.0
 */

// 🔄 MODIFIED: Removed redundant jest declaration and import
// Initialize Google Apps Script Global Services Mocks
global.SpreadsheetApp = {
  getActiveSpreadsheet: jest.fn().mockReturnValue({
      getSheetByName: jest.fn().mockReturnValue({
          getRange: jest.fn().mockReturnThis(),
          getValues: jest.fn().mockReturnValue([]),
          setValues: jest.fn(),
          setValue: jest.fn(),
          appendRow: jest.fn(),
          getLastRow: jest.fn().mockReturnValue(0),
          getLastColumn: jest.fn().mockReturnValue(0),
          clear: jest.fn(),
          deleteRow: jest.fn(),
          getDataRange: jest.fn().mockReturnThis()
      })
  })
};

global.Logger = {
  log: jest.fn()
};

global.Session = {
  getActiveUser: jest.fn().mockReturnValue({
      getEmail: jest.fn().mockReturnValue('test@example.com')
  })
};

global.PropertiesService = {
  getScriptProperties: jest.fn().mockReturnValue({
      getProperty: jest.fn(),
      setProperty: jest.fn()
  }),
  getUserProperties: jest.fn().mockReturnValue({
      getProperty: jest.fn(),
      setProperty: jest.fn()
  })
};

global.HtmlService = {
  createHtmlOutput: jest.fn().mockReturnValue({
      setTitle: jest.fn().mockReturnThis(),
      setWidth: jest.fn().mockReturnThis(),
      setHeight: jest.fn().mockReturnThis()
  }),
  createTemplate: jest.fn()
};

global.UrlFetchApp = {
  fetch: jest.fn().mockReturnValue({
      getContentText: jest.fn().mockReturnValue('{}'),
      getResponseCode: jest.fn().mockReturnValue(200)
  })
};

// Helper functions for testing
global.testHelpers = {
  createMockSheet: () => ({
      getRange: jest.fn().mockReturnThis(),
      getValues: jest.fn().mockReturnValue([]),
      setValues: jest.fn(),
      setValue: jest.fn(),
      appendRow: jest.fn(),
      getLastRow: jest.fn().mockReturnValue(0),
      getLastColumn: jest.fn().mockReturnValue(0),
      clear: jest.fn(),
      deleteRow: jest.fn(),
      getDataRange: jest.fn().mockReturnThis()
  }),
  
  createMockSpreadsheet: (mockSheet) => ({
      getSheetByName: jest.fn().mockReturnValue(mockSheet)
  }),

  mockGoogleService: (serviceName, mockImplementation) => {
      global[serviceName] = mockImplementation;
  }
};

// Custom matchers
expect.extend({
  toBeValidSheet(received) {
      const pass = received && 
                  typeof received.getRange === 'function' &&
                  typeof received.getValues === 'function';
      return {
          pass,
          message: () => 
              `expected ${received} to be a valid Google Sheet object`
      };
  }
});

// Console output formatting
const originalLog = console.log;
console.log = (...args) => {
  originalLog('\x1b[36m%s\x1b[0m', '[TEST]', ...args);
};

// Error handling for unhandled promises
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});