 /**
 * @fileoverview Helper functions for QMS Parser
 * Contains utility functions used throughout the application
 * Includes date formatting, ID generation, and validation checks
 */

// Import constants (we'll set this up later)
// const { ADMIN_CODES, REQUIRED_COLUMNS } = require('./constants');

// =========================
// SECTION 5: Helper Functions
// =========================
// Collection of utility functions for the Quiz Management System
// Includes data formatting, validation, reset capabilities, and system utilities
// All functions are designed to work together to support core functionality

// ===== Basic Helper Functions =====

/**
 * Pads numbers with leading zeros
 * @param {number} num - Number to pad
 * @param {number} size - Desired length after padding
 * @return {string} Padded number
 */
function padNumber(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length - size);
  }
  
  /**
   * Checks if two dates are the same day
   * @param {Date} date1 - First date to compare
   * @param {Date} date2 - Second date to compare
   * @return {boolean} True if same day
   */
  function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  /**
   * Formats date for consistent display
   * @param {Date} date - Date to format
   * @return {string} Formatted date string
   */
  function formatDate(date) {
    return Utilities.formatDate(
      date, 
      Session.getScriptTimeZone(), 
      'MM/dd/yyyy HH:mm:ss'
    );
  }
  
  /**
   * Shows success message with emoji
   * @param {string} message - Message to display
   */
  function showSuccessMessage(message) {
    SpreadsheetApp.getUi().alert(
      `${ALERT_EMOJIS.success.emoji} Success`,
      message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
  
  /**
   * Shows error message with emoji
   * @param {string} message - Error message to display
   */
  function showErrorMessage(message) {
    SpreadsheetApp.getUi().alert(
      `${ALERT_EMOJIS.error.emoji} Error`,
      message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
  
  /**
   * Calculates similarity between two strings
   * Used for duplicate detection
   * @param {string} str1 - First string to compare
   * @param {string} str2 - Second string to compare
   * @return {number} Similarity score (0-1)
   */
  function calculateSimilarity(str1, str2) {
    str1 = str1.toLowerCase().trim();
    str2 = str2.toLowerCase().trim();
    
    // Remove common words
    var commonWords = ['what', 'how', 'why', 'when', 'where', 'is', 'are', 'the', 'a', 'an'];
    commonWords.forEach(word => {
      str1 = str1.replace(new RegExp('\\b' + word + '\\b', 'g'), '');
      str2 = str2.replace(new RegExp('\\b' + word + '\\b', 'g'), '');
    });
    
    // Count matching words
    var words1 = str1.split(/\s+/);
    var words2 = str2.split(/\s+/);
    var matchingWords = words1.filter(word => words2.includes(word));
    
    // Calculate similarity ratio
    return matchingWords.length / Math.max(words1.length, words2.length);
  }
  
  /**
   * Cleans and standardizes input text
   * @param {string} text - Text to clean
   * @return {string} Cleaned text
   */
  function cleanInput(text) {
    return text.toString()
              .trim()
              .replace(/[\r\n]+/g, ' ')
              .replace(/\s+/g, ' ');
  }
  
  /**
   * Shows messages in sequence with proper timing
   * @param {Array} messages - Array of message objects
   */
  function showMessages(messages) {
    messages.forEach(function(msg, index) {
      SpreadsheetApp.getActive().toast(
        msg.text,
        msg.title,
        msg.duration
      );
      if (index < messages.length - 1) {
        Utilities.sleep(msg.duration * 1000);
      }
    });
  }
  
  // ===== Reset Functions =====
  
  /**
   * Master reset function for all tabs
   * Preserves headers and structure while clearing data
   */
  
  function resetAllTabs() {
    try {
      var ui = SpreadsheetApp.getUi();
      var response = ui.alert(
        '⚠️ Reset All Tabs',
        'This will clear Raw Data, Parsing Results, and Image Library, while preserving all Admin Log data. Continue?',
        ui.ButtonSet.YES_NO
      );
      
      if (response !== ui.Button.YES) {
        return;
      }
  
      // Log the start of reset
      logAdminAction('Reset', 'SYSTEM', 'Starting system reset (preserving Admin Log)');
      
      // Reset data tabs only
      resetRawData();
      resetParsingResults();
      resetImageLibrary();
      
      // Show sequential messages
      showMessages([
        {text: 'Starting reset...', title: '🔄 Reset', duration: 2},
        {text: 'Raw Data cleared', title: '🧹 Reset', duration: 2},
        {text: 'Parsing Results cleared', title: '🧹 Reset', duration: 2},
        {text: 'Image Library cleared', title: '🧹 Reset', duration: 2},
        {text: 'Reset complete! (Admin Log preserved)', title: '✅ Success', duration: 3}
      ]);
      
      // Log completion
      logAdminAction('Reset', 'SYSTEM', 'System reset completed (Admin Log preserved)');
      
      // Update summary dashboard automatically
      updateSummaryDashboard(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Admin Log'));
      
    } catch (error) {
      showErrorMessage('Reset error: ' + error.message);
      console.error('Reset error:', error);
    }
  }
  
  /**
   * Resets the Summary Dashboard to default state
   */
   // function removed by tye, no longer wanting to reset the summary dashboard or the admin log
  
  /**
   * Resets Raw Data tab while preserving header
   */
  function resetRawData() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Raw Data');
    if (sheet && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).clearContent();
    }
  }
  
  /**
   * Resets Parsing Results tab while preserving header
   */
  function resetParsingResults() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Parsing Results');
    if (sheet && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
  }
  
  /**
   * Resets Image Library tab while preserving header
   */
  function resetImageLibrary() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Image Library');
    if (sheet && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
  }
  
  /**
   * Resets Admin Log including summary dashboard
   */
   //this function has been removed by tye, no longer clearing the Admin log, we want to keep this record
  
  /**
   * Logs admin actions and updates summary
   */
  function logAdminAction(action, questionId, details) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName('Admin Log');
    
    if (!logSheet) return;
    
    var lastRow = Math.max(logSheet.getLastRow(), 9);
    var newRow = lastRow + 1;
    
    // Create log entry
    var logEntry = [
      new Date(),
      Session.getActiveUser().getEmail(),
      `${ALERT_EMOJIS[action.toLowerCase()]?.emoji || '📝'} ${action}`,
      questionId,
      details,
      'Active'
    ];
    
    // Add entry
    logSheet.getRange(newRow, 1, 1, 6).setValues([logEntry]);
    
    // Update summary dashboard
    updateSummaryDashboard(logSheet);
  }
  
  /**
   * Updates the summary dashboard statistics
   */
  function updateSummaryDashboard(sheet) {
    var today = new Date();
    var oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    var data = sheet.getRange('A10:F' + sheet.getLastRow()).getValues();
    
    var todayCount = 0;
    var weekCount = 0;
    var actions = {};
    var admins = new Set();
    
    data.forEach(row => {
      var date = new Date(row[0]);
      if (isSameDay(date, today)) todayCount++;
      if (date >= oneWeekAgo) weekCount++;
      
      var action = row[2].split(' ')[1];
      actions[action] = (actions[action] || 0) + 1;
      admins.add(row[1]);
    });
    
    // Update summary
    sheet.getRange('A2').setValue(`📅 Today's Activities: ${todayCount}`);
    sheet.getRange('A3').setValue(`📊 This Week: ${weekCount}`);
    sheet.getRange('A4').setValue(`🎯 Actions: ${Object.entries(actions).map(([k,v]) => `${k}(${v})`).join(', ')}`);
    sheet.getRange('A5').setValue(`👤 Active Admins: ${admins.size}`);
  }
  
  /**
   * Tests all major components of Section 5
   */
  function testSection5() {
    var ui = SpreadsheetApp.getUi();
    
    // Show test menu
    var testMenu = ui.alert(
      '🧪 Test Section 5',
      'Choose what to test:\n\n' +
      '1. Reset All Tabs (clears data)\n' +
      '2. Admin Log Functions\n' +
      '3. Helper Functions\n\n' +
      'Start with test #1?',
      ui.ButtonSet.YES_NO
    );
    
    if (testMenu === ui.Button.YES) {
      // Test 1: Reset Functions
      showMessages([
        {text: 'Starting Section 5 tests...', title: '🧪 Test', duration: 2},
        {text: 'Testing reset functions...', title: '🧪 Test', duration: 2}
      ]);
      
      resetAllTabs();
      
      // Test 2: Admin Log
      var continueTest = ui.alert(
        '🧪 Continue Testing?',
        'Test Admin Log functions next?',
        ui.ButtonSet.YES_NO
      );
      
      if (continueTest === ui.Button.YES) {
        logAdminAction('Test', 'SYSTEM', 'Testing Admin Log functions');
        updateSummaryDashboard(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Admin Log'));
        
        // Test 3: Helper Functions
        var finalTest = ui.alert(
          '🧪 Final Test',
          'Test helper functions?',
          ui.ButtonSet.YES_NO
        );
        
        if (finalTest === ui.Button.YES) {
          // Test various helper functions
          var paddedNum = padNumber(5, 2);
          var formattedDate = formatDate(new Date());
          var cleanedText = cleanInput("  test  \n text  ");
          
          showMessages([
            {text: 'Padded number: ' + paddedNum, title: '🧪 Test', duration: 2},
            {text: 'Formatted date: ' + formattedDate, title: '🧪 Test', duration: 2},
            {text: 'Cleaned text: ' + cleanedText, title: '🧪 Test', duration: 2}
          ]);
        }
      }
      
      // Show test completion
      ui.alert(
        '✅ Test Complete',
        'All selected tests completed.\n\n' +
        'Check:\n' +
        '1. Admin Log for test entries\n' +
        '2. Summary Dashboard updates\n' +
        '3. Toast messages displayed correctly',
        ui.ButtonSet.OK
      );
    }
  }
  
  // Modification points for Helper Functions (Section 5):
  // 1. Add new date formatting options
  // 2. Modify similarity calculation algorithm
  // 3. Add new message types to show[Type]Message functions
  // 4. Customize input cleaning rules
  // 5. Add new utility functions as needed
  // 6. Enhance reset functionality
  // 7. Add undo capability for resets
  // 8. Add selective reset options
  // 9. Improve error handling and reporting
  // 10. Add data validation checks
  // 11. Enhance summary dashboard calculations
  // 12. Add backup functionality before reset
  // 13. Add custom reset options for specific data types
  // 14. Implement progressive reset capabilities
  // 15. Add reset scheduling options