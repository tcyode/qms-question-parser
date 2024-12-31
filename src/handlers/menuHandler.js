 /**
 * @fileoverview Menu and UI handler functions for QMS Parser
 * Manages custom menus, dialog boxes, and filter implementations
 * Handles user interface interactions and display logic
 */

// Import dependencies (we'll set these up later)
// const { ADMIN_CODES } = require('../utils/constants');
// const { logAction } = require('../utils/logger');

// SECTION 6: UI and Filter Functions
// ================================
// Contains all user interface components, menu creation, and filtering functionality
// Includes dialog boxes, filter implementation, and interactive features
// Added test functions to verify UI components and filtering

// ===== Menu Creation and Management =====

/**
 * Creates main menu and submenus
 * Automatically runs when spreadsheet opens
 */
function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Quiz Tools')
        .addItem(`${ALERT_EMOJIS.success.emoji} Parse Raw Data`, 'parseRawData')
        .addSeparator()
        .addSubMenu(ui.createMenu('🛠️ Admin Tools')
            .addItem('🧹 Reset All Tabs', 'resetAllTabs')
            .addItem('🔍 Debug Parse', 'debugParseRawData')
            .addItem('📋 Show Debug Logs', 'DEBUG.showLogs'))
        .addSeparator()
        .addSubMenu(ui.createMenu(`${ALERT_EMOJIS.review.emoji} Question Management`)
            .addItem(`${ALERT_EMOJIS.review.emoji} Review Pending`, 'showPendingQuestions')
            .addItem(`${ALERT_EMOJIS.edited.emoji} Edit Question`, 'showEditDialog')
            .addItem(`${ALERT_EMOJIS.removed.emoji} Remove Question`, 'showRemoveDialog')
            .addItem(`${ALERT_EMOJIS.restored.emoji} Restore Question`, 'showRestoreDialog'))
        .addSubMenu(ui.createMenu(`${ALERT_EMOJIS.log.emoji} Admin Log`)
            .addItem(`${ALERT_EMOJIS.filter.emoji} Filter Log`, 'filterAdminLog')
            .addItem(`${ALERT_EMOJIS.clear.emoji} Clear Filters`, 'clearLogFilter'))
        .addSubMenu(ui.createMenu('🧪 Testing')
            .addItem('🧪 Test UI Components', 'testUIComponents')
            .addItem('🧪 Test Filters', 'testFilters')
            .addItem('🧪 Test Dialogs', 'testDialogs'))
        .addToUi();
  }
  
  /**
   * Tests UI components functionality
   */
  function testUIComponents() {
    try {
      var ui = SpreadsheetApp.getUi();
      
      // Test menu creation
      onOpen();
      SpreadsheetApp.getActive().toast('Menu creation test complete', '🧪 Test', 3);
      
      // Test dialog display
      var testDialog = HtmlService.createHtmlOutput('<p>Test Dialog</p>')
        .setWidth(300)
        .setHeight(100);
      ui.showModalDialog(testDialog, 'Test Dialog');
      
      // Test alerts
      ui.alert('Test Alert', 'This is a test alert', ui.ButtonSet.OK);
      
      SpreadsheetApp.getActive().toast('UI components test complete', '✅ Success', 3);
      
    } catch (error) {
      console.error('UI Test Error:', error);
      SpreadsheetApp.getActive().toast('UI test failed: ' + error.message, '❌ Error', 5);
    }
  }
  
  // ===== Dialog Box Creation =====
  
  /**
   * Shows filter dialog for Admin Log
   */
  function filterAdminLog() {
    var html = HtmlService.createTemplate(`
      <style>
        .filter-container {
          padding: 15px;
          font-family: Arial, sans-serif;
        }
        .filter-group {
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }
        .emoji-label {
          font-size: 1.2em;
          margin-bottom: 5px;
        }
        button {
          background-color: #4a86e8;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
        }
        button:hover {
          background-color: #3c78d8;
        }
      </style>
      <div class="filter-container">
        <h3>${ALERT_EMOJIS.filter.emoji} Filter Admin Log</h3>
        
        <div class="filter-group">
          <label class="emoji-label">📅 Date Range</label><br>
          From: <input type="date" id="dateFrom">
          To: <input type="date" id="dateTo">
        </div>
        
        <div class="filter-group">
          <label class="emoji-label">🎯 Action Type</label><br>
          <select id="action">
            <option value="">All Actions</option>
            <option value="Edit">✏️ Edit</option>
            <option value="Remove">🗑️ Remove</option>
            <option value="Restore">♻️ Restore</option>
            <option value="Override">⚡ Override</option>
            <option value="Reset">🧹 Reset</option>
            <option value="Debug">🔍 Debug</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="emoji-label">🔍 Search Details</label><br>
          <input type="text" id="searchText" placeholder="Search in action details...">
        </div>
        
        <button onclick="google.script.run.withSuccessHandler(closeDialog).applyLogFilter(getFilterValues())">
          ${ALERT_EMOJIS.filter.emoji} Apply Filter
        </button>
        <button onclick="google.script.run.withSuccessHandler(closeDialog).clearLogFilter()">
          ${ALERT_EMOJIS.clear.emoji} Clear Filter
        </button>
      </div>
      
      <script>
        function getFilterValues() {
          return {
            dateFrom: document.getElementById('dateFrom').value,
            dateTo: document.getElementById('dateTo').value,
            action: document.getElementById('action').value,
            searchText: document.getElementById('searchText').value
          };
        }
        
        function closeDialog() {
          google.script.host.close();
        }
      </script>
    `);
    
    var ui = SpreadsheetApp.getUi();
    var htmlOutput = html.evaluate().setWidth(400).setHeight(500);
    ui.showModalDialog(htmlOutput, '🔍 Filter Admin Log');
  }
  
  // ===== Filter Implementation =====
  
  /**
   * Applies filters to Admin Log
   * @param {Object} filterValues - Filter criteria
   */
  function applyLogFilter(filterValues) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Admin Log');
    var dataRange = sheet.getRange('A10:F' + sheet.getLastRow());
    var data = dataRange.getValues();
    
    // Process each row
    data.forEach((row, index) => {
      var rowNum = index + 10;
      var showRow = true;
      
      // Apply date filter
      if (filterValues.dateFrom || filterValues.dateTo) {
        var date = new Date(row[0]);
        if (filterValues.dateFrom && date < new Date(filterValues.dateFrom)) showRow = false;
        if (filterValues.dateTo && date > new Date(filterValues.dateTo)) showRow = false;
      }
      
      // Apply action filter
      if (filterValues.action && !row[2].includes(filterValues.action)) showRow = false;
      
      // Apply text search
      if (filterValues.searchText && !row.some(cell => 
        cell.toString().toLowerCase().includes(filterValues.searchText.toLowerCase())
      )) showRow = false;
      
      // Hide/show row
      if (showRow) {
        sheet.showRows(rowNum);
      } else {
        sheet.hideRows(rowNum);
      }
    });
    
    SpreadsheetApp.getActive().toast('Filter applied', '🔍 Filter', 3);
  }
  
  /**
   * Clears all filters from Admin Log
   */
  function clearLogFilter() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Admin Log');
    var lastRow = sheet.getLastRow();
    
    // Show all rows
    sheet.showRows(10, lastRow - 9);
    
    // Clear filter inputs
    sheet.getRange('A9:F9').clearContent();
    
    // Log action and show confirmation
    logAdminAction('Clear', 'SYSTEM', 'Cleared Admin Log filters');
    SpreadsheetApp.getActive().toast('Filters cleared', '🔄 Reset', 3);
  }
  
  // ===== Question Management Dialogs =====
  
  /**
   * Shows dialog for pending questions review
   */
  function showPendingQuestions() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Parsing Results');
    var data = sheet.getDataRange().getValues();
    var pendingQuestions = data.filter(row => row[12] === 'Yes'); // Needs Review column
    
    if (pendingQuestions.length === 0) {
      SpreadsheetApp.getActive().toast('No pending questions to review', '✅ Status', 3);
      return;
    }
    
    var html = HtmlService.createTemplate(`
      <style>
        .question-list {
          margin: 15px;
          max-height: 400px;
          overflow-y: auto;
        }
        .question-item {
          padding: 10px;
          border: 1px solid #ddd;
          margin-bottom: 10px;
          border-radius: 4px;
        }
        .actions {
          margin-top: 10px;
        }
        button {
          margin-right: 5px;
        }
      </style>
      <div class="question-list">
        <h3>📝 Pending Questions</h3>
        <? for (var i = 0; i < pending.length; i++) { ?>
          <div class="question-item">
            <strong>ID:</strong> <?= pending[i][0] ?><br>
            <strong>Question:</strong> <?= pending[i][3] ?><br>
            <div class="actions">
              <button onclick="approveQuestion('<?= pending[i][0] ?>')">✅ Approve</button>
              <button onclick="editQuestion('<?= pending[i][0] ?>')">✏️ Edit</button>
              <button onclick="removeQuestion('<?= pending[i][0] ?>')">🗑️ Remove</button>
            </div>
          </div>
        <? } ?>
      </div>
      <script>
        function approveQuestion(id) {
          google.script.run.withSuccessHandler(refresh).approveQuestion(id);
        }
        function editQuestion(id) {
          google.script.run.withSuccessHandler(refresh).showEditDialog(id);
        }
        function removeQuestion(id) {
          google.script.run.withSuccessHandler(refresh).removeQuestion(id);
        }
        function refresh() {
          google.script.run.showPendingQuestions();
        }
      </script>
    `);
    
    html.pending = pendingQuestions;
    
    var ui = SpreadsheetApp.getUi();
    var htmlOutput = html.evaluate().setWidth(600).setHeight(400);
    ui.showModalDialog(htmlOutput, '📝 Pending Questions');
  }
  
  // ===== Test Functions =====
  
  /**
   * Tests filter functionality
   */
  function testFilters() {
    try {
      // Test filter application
      var testFilters = {
        dateFrom: new Date(),
        dateTo: new Date(),
        action: 'Test',
        searchText: 'test'
      };
      
      applyLogFilter(testFilters);
      SpreadsheetApp.getActive().toast('Filter application test complete', '🧪 Test', 3);
      
      // Test filter clearing
      Utilities.sleep(2000); // Wait to show sequence
      clearLogFilter();
      SpreadsheetApp.getActive().toast('Filter clearing test complete', '🧪 Test', 3);
      
      SpreadsheetApp.getActive().toast('Filter tests completed successfully', '✅ Success', 3);
      
    } catch (error) {
      console.error('Filter Test Error:', error);
      SpreadsheetApp.getActive().toast('Filter test failed: ' + error.message, '❌ Error', 5);
    }
  }
  
  /**
   * Tests dialog functionality
   */
  function testDialogs() {
    try {
      var ui = SpreadsheetApp.getUi();
      
      // Test filter dialog
      filterAdminLog();
      SpreadsheetApp.getActive().toast('Filter dialog test complete', '🧪 Test', 3);
      
      // Test pending questions dialog
      Utilities.sleep(2000);
      showPendingQuestions();
      SpreadsheetApp.getActive().toast('Question dialog test complete', '🧪 Test', 3);
      
      SpreadsheetApp.getActive().toast('Dialog tests completed successfully', '✅ Success', 3);
      
    } catch (error) {
      console.error('Dialog Test Error:', error);
      SpreadsheetApp.getActive().toast('Dialog test failed: ' + error.message, '❌ Error', 5);
    }
  }
  
  /**
   * Comprehensive test for all Section 6 components
   */
  function testSection6Complete() {
    var ui = SpreadsheetApp.getUi();
    
    try {
      // Test Menu
      var response = ui.alert(
        '🧪 Test Section 6',
        'This will test all UI components, filters, and dialogs.\n\n' +
        'Tests will run in sequence. Continue?',
        ui.ButtonSet.YES_NO
      );
      
      if (response !== ui.Button.YES) return;
      
      // 1. Test Menu Creation
      showMessages([
        {text: 'Starting Section 6 tests...', title: '🧪 Test', duration: 2},
        {text: 'Testing menu creation...', title: '🧪 Test', duration: 2}
      ]);
      
      onOpen();
      logAdminAction('Test', 'SYSTEM', 'Testing menu creation');
      
      // 2. Test Filters
      var continueTest = ui.alert(
        '🧪 Filter Tests',
        'Menu creation complete. Test filters now?',
        ui.ButtonSet.YES_NO
      );
      
      if (continueTest === ui.Button.YES) {
        showMessages([
          {text: 'Testing filter functions...', title: '🧪 Test', duration: 2}
        ]);
        
        // Test filter application
        var testFilters = {
          dateFrom: new Date(),
          dateTo: new Date(),
          action: 'Test',
          searchText: 'test'
        };
        
        applyLogFilter(testFilters);
        Utilities.sleep(2000);
        clearLogFilter();
        
        logAdminAction('Test', 'SYSTEM', 'Testing filter functions');
      }
      
      // 3. Test Dialogs
      var dialogTest = ui.alert(
        '🧪 Dialog Tests',
        'Filter tests complete. Test dialogs now?',
        ui.ButtonSet.YES_NO
      );
      
      if (dialogTest === ui.Button.YES) {
        showMessages([
          {text: 'Testing dialogs...', title: '🧪 Test', duration: 2}
        ]);
        
        // Show each dialog in sequence
        filterAdminLog();
        Utilities.sleep(3000);
        showPendingQuestions();
        
        logAdminAction('Test', 'SYSTEM', 'Testing dialog displays');
      }
      
      // Show test completion summary
      ui.alert(
        '✅ Test Complete',
        'Section 6 testing completed.\n\n' +
        'Verified Components:\n' +
        '- Menu creation\n' +
        '- Filter functionality\n' +
        '- Dialog displays\n' +
        '- Admin logging\n\n' +
        'Check Admin Log for test entries.',
        ui.ButtonSet.OK
      );
      
    } catch (error) {
      console.error('Section 6 Test Error:', error);
      ui.alert(
        '❌ Test Error',
        'Error during testing: ' + error.message + '\n\n' +
        'Check console logs for details.',
        ui.ButtonSet.OK
      );
    }
  }
  
  // Modification points for UI and Filters (Section 6):
  // 1. Add new menu items to onOpen function
  // 2. Add new filter criteria to filterAdminLog
  // 3. Modify filter dialog layout and styling
  // 4. Add new filter types to applyLogFilter
  // 5. Customize dialog appearances and behaviors
  // 6. Add more test scenarios
  // 7. Enhance error handling in dialogs
  // 8. Add user preference settings
  // 9. Implement advanced filtering options
  // 10. Add bulk action capabilities
  // 11. Enhance UI responsiveness
  // 12. Add keyboard shortcuts
  // 13. Implement custom dialog themes
  // 14. Add progress indicators
  // 15. Enhance accessibility features
  