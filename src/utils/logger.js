/**
 * @fileoverview Admin Log functions for QMS Parser
 * Handles tracking system actions, changes, and maintaining admin log
 * Includes summary dashboard and filtering system
 */

// Import constants (we'll set this up later)
// const { ADMIN_CODES } = require('./constants');

// ==============================
// SECTION 3: Admin Log Functions
// ==============================

function setupAdminLog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName(SHEET_NAMES.ADMIN_LOG);
  
  if (!logSheet) {
    logSheet = ss.insertSheet(SHEET_NAMES.ADMIN_LOG);
    
    // Create Summary Dashboard
    setupSummaryDashboard(logSheet);
    
    // Add spacing
    logSheet.setRowHeight(7, 30);
    
    // Set up headers with explanations
    var headers = [[
      '📅 Timestamp',
      '👤 Admin (Who did it)',
      '🎯 Action (What was done)',
      '🔑 Question ID (Which question)',
      '📝 Details (Description of changes/actions)',
      '🚦 Status'
    ]];
    
    logSheet.getRange('A1:F1').setValues(headers);
    
    // Add filter row
    setupAdminLogFilters(logSheet);
    formatAdminLogHeaders(logSheet);
  }
  return logSheet;
}

function logAdminAction(action, questionId, details) {
  var logSheet = setupAdminLog();
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
  
  // Add entry and format
  var logRange = logSheet.getRange(newRow, 1, 1, 6);
  logRange.setValues([logEntry]);
  
  // Apply color coding
  var actionColor = ACTION_COLORS[action] || '#ffffff';
  logRange.setBackground(actionColor);
  
  // Update dashboard
  updateSummaryDashboard(logSheet);
}

function updateSummaryDashboard(sheet) {
  var today = new Date();
  var oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Get log data
  var logData = sheet.getRange('A10:F' + sheet.getLastRow()).getValues();
  
  // Calculate summaries
  var summaries = calculateSummaries(logData, today, oneWeekAgo);
  
  // Update summary sections
  updateSummarySections(sheet, summaries);
}

// Helper function for summary calculations
function calculateSummaries(logData, today, oneWeekAgo) {
  var summaries = {
    today: 0,
    week: 0,
    actions: {},
    admins: {}
  };
  
  logData.forEach(row => {
    var date = new Date(row[0]);
    if (isSameDay(date, today)) summaries.today++;
    if (date >= oneWeekAgo) summaries.week++;
    
    var action = row[2].split(' ')[1];
    summaries.actions[action] = (summaries.actions[action] || 0) + 1;
    
    var admin = row[1];
    summaries.admins[admin] = (summaries.admins[admin] || 0) + 1;
  });
  
  return summaries;
}

function updateSummarySections(sheet, summaries) {
  // Update each summary section
  sheet.getRange('A2').setValue(
    `${SUMMARY_SECTIONS['Today'].emoji} Today's Activities: ${summaries.today}`
  );
  
  sheet.getRange('A3').setValue(
    `${SUMMARY_SECTIONS['This Week'].emoji} This Week: ${summaries.week}`
  );
  
  // Format action counts
  var actionSummary = Object.entries(summaries.actions)
    .map(([action, count]) => `${action}(${count})`)
    .join(', ');
  sheet.getRange('A4').setValue(
    `${SUMMARY_SECTIONS['By Action Type'].emoji} Actions: ${actionSummary}`
  );
  
  // Format admin counts
  var adminCount = Object.keys(summaries.admins).length;
  sheet.getRange('A5').setValue(
    `${SUMMARY_SECTIONS['By Admin'].emoji} Active Admins: ${adminCount}`
  );
}

// Modification points for Admin Log (Section 3):
// 1. Add new columns to log structure in setupAdminLog
// 2. Add new summary metrics to updateSummaryDashboard
// 3. Modify log entry format in logAdminAction
// 4. Add new calculation types to calculateSummaries
// 5. Customize dashboard layout in setupSummaryDashboard
