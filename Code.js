/*
TABLE OF CONTENTS
================
SETUP INSTRUCTIONS
- Required Tabs
- Initial Configuration
- Permissions Required

SECTION 1: Constants and Configuration
- Alert Emojis
- Topic Categories
- Action Colors
- Summary Dashboard Settings

SECTION 2: Core Parsing Functions
- Main Parsing Function
- Question Processing
- Duplicate Detection

SECTION 3: Admin Log Functions
- Log Setup
- Action Tracking
- Summary Dashboard
- Filtering System

SECTION 4: Image Library Functions
- Library Setup
- Image Processing
- URL Management

SECTION 5: Helper Functions
- Date Formatting
- ID Generation
- Validation Checks

SECTION 6: UI and Filter Functions
- Menu Creation
- Dialog Boxes
- Filter Implementation

MODIFICATION GUIDELINES
- How to Add New Topics
- How to Modify Colors
- How to Add New Features

TROUBLESHOOTING TIPS
- Common Errors
- Debug Process
- Support Information
*/

/*
SETUP INSTRUCTIONS
=================
1. Required Tabs:
   - Raw Data (for input)
   - Parsing Results (for processed questions)
   - Admin Log (created automatically)
   - Image Library (created automatically)

2. Initial Configuration:
   - Enable Advanced Services: None required
   - Required Permissions: Will prompt on first run
   - Google Drive access: Required for images

3. First-Time Setup:
   a. Copy entire script to Apps Script editor
   b. Save project
   c. Refresh spreadsheet
   d. Look for "Quiz Tools" menu
   e. Run initial parse to create necessary tabs
*/

/*
MODIFICATION GUIDELINES
======================
1. Adding New Topics:
   - Add to topicCategories constant
   - Include emoji, keywords
   - Update detection logic if needed

2. Color Changes:
   - Modify ACTION_COLORS constant
   - Update dashboard colors in SUMMARY_SECTIONS

3. Adding Features:
   - Add new constants if needed
   - Create new function section
   - Update relevant existing functions
   - Add to menu if required
*/

/*
TROUBLESHOOTING TIPS
===================
1. Common Errors:
   - "Range not found": Check tab names
   - "Permission denied": Run authorization
   - "Invalid argument": Check data format

2. Debug Process:
   - Check Logger.log outputs
   - Verify tab names match exactly
   - Confirm data format in Raw Data

3. Support:
   - Check comments for function purpose
   - Use Logger.log for debugging
   - Review modification guidelines
*/
// =====================================
// SECTION 1: Constants and Configuration
// =====================================

// ====================================
// Core configuration settings and detection functions for the Quiz Management System
// Includes emoji definitions, topic categories, detection rules, and testing functions

// ===== System Constants =====

// Alert Emojis for various system actions and states
const ALERT_EMOJIS = {
  duplicate: { emoji: '🚫', text: 'Duplicate' },
  similar: { emoji: '⚠️', text: 'Similar' },
  edited: { emoji: '✏️', text: 'Edited' },
  removed: { emoji: '🗑️', text: 'Removed' },
  restored: { emoji: '♻️', text: 'Restored' },
  override: { emoji: '⚡', text: 'Override' },
  warning: { emoji: '⚠️', text: 'Warning' },
  success: { emoji: '✅', text: 'Success' },
  error: { emoji: '❌', text: 'Error' },
  review: { emoji: '👀', text: 'Review' },
  log: { emoji: '📋', text: 'Log' },
  filter: { emoji: '🔍', text: 'Filter' },
  clear: { emoji: '🔄', text: 'Clear' }
};

// Sheet names and configuration
const SHEET_NAMES = {
  RAW_DATA: 'Raw Data',
  PARSING_RESULTS: 'Parsing Results',
  ADMIN_LOG: 'Admin Log',
  IMAGE_LIBRARY: 'Image Library'
};

// Column configurations for each sheet
const COLUMN_CONFIG = {
  PARSING_RESULTS: {
    QUESTION_ID: 0,
    DATE: 1,
    AUTHOR: 2,
    QUESTION_TEXT: 3,
    ANSWER_TEXT: 4,
    SCREENSHOTS: 5,
    TOPIC_EMOJI: 6,
    TOPIC: 7,
    TYPE_EMOJI: 8,
    QUESTION_TYPE: 9,
    STATUS: 10,
    PARSE_CONFIDENCE: 11,
    NEEDS_REVIEW: 12,
    SET: 13,
    DAY: 14
  }
};

// Topic categories with emojis and keywords for detection
const topicCategories = {
  'QBO': { 
    display: '📚 QBO', 
    keywords: ['quickbooks', 'qbo', 'invoice', 'bill', 'reconcile', 'bank feed', 'transaction', 'vendor', 'customer']
  },
  'Excel': { 
    display: '📊 Excel', 
    keywords: ['excel', 'spreadsheet', 'formula', 'calculation', 'worksheet', 'cell', 'pivot']
  },
  'Bkpg/Actg': { 
    display: '💰 Bkpg/Actg', 
    keywords: ['journal entry', 'debit', 'credit', 'balance', 'account', 'ledger', 'reconciliation']
  },
  'Vocab/Terms': { 
    display: '📖 Vocab/Terms', 
    keywords: ['define', 'what is', 'term', 'meaning', 'definition', 'explain term']
  },
  'TGB Internal': { 
    display: '⚙️ TGB Internal', 
    keywords: ['process', 'internal', 'tgb', 'procedure', 'policy', 'workflow']
  },
  'PBS': { 
    display: '🏢 PBS', 
    keywords: ['pbs', 'review', 'checklist', 'month end', 'verification']
  },
  'Client': { 
    display: '👥 Client', 
    keywords: ['cwp', 'bd', 'avc', 'client', 'customer specific']
  }
};

// Question type definitions and patterns
const questionTypes = {
  'Sequential': {
    patterns: ['next step', 'following', 'sequence', 'first', 'then', 'after'],
    emoji: '1️⃣'
  },
  'Multiple Choice': {
    patterns: ['choose', 'select', 'which of the following', 'options'],
    emoji: '📝'
  },
  'True/False': {
    patterns: ['true or false', 'true/false', 't/f'],
    emoji: '✅'
  },
  'Fill in Blank': {
    patterns: ['fill in', 'complete', 'enter the'],
    emoji: '⬜'
  },
  'Excel Exercise': {
    patterns: ['excel', 'spreadsheet', 'formula', 'calculate'],
    emoji: '📊'
  },
  'Short Answer': {
    patterns: ['explain', 'describe', 'how do you', 'what is', 'why'],
    emoji: '✍️'
  }
};

// ===== Detection Functions =====

/**
 * Detects topic based on question content
 * @param {string} questionText - The question to analyze
 * @return {Object} Topic information including emoji
 */
function detectTopic(questionText) {
  questionText = questionText.toLowerCase();
  
  for (let topic in topicCategories) {
    if (topicCategories[topic].keywords.some(keyword => 
        questionText.includes(keyword.toLowerCase()))) {
      return {
        topic: topic,
        emoji: topicCategories[topic].display.split(' ')[0],
        display: topicCategories[topic].display
      };
    }
  }
  
  return {
    topic: 'General',
    emoji: '📝',
    display: '📝 General'
  };
}

/**
 * Detects question type based on content
 * @param {string} questionText - The question text to analyze
 * @return {Object} Question type and emoji
 */
function detectQuestionType(questionText) {
  questionText = questionText.toLowerCase();
  
  for (let type in questionTypes) {
    if (questionTypes[type].patterns.some(pattern => 
        questionText.includes(pattern))) {
      return {
        type: type,
        emoji: questionTypes[type].emoji
      };
    }
  }
  
  // Default to Short Answer if no other type matches
  return {
    type: 'Short Answer',
    emoji: '✍️'
  };
}

// ===== Testing Functions =====

/**
 * Tests all Section 1 components
 */
function testSection1() {
  try {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(
      '🧪 Test Section 1',
      'This will test constants, detection functions, and configurations. Continue?',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) return;
    
    // Test cases
    var testCases = [
      {
        text: "How do you create an invoice in QuickBooks Online?",
        expectedTopic: "QBO",
        expectedType: "Short Answer"
      },
      {
        text: "What is the next step after reconciling the bank feed?",
        expectedTopic: "QBO",
        expectedType: "Sequential"
      },
      {
        text: "Create a formula in Excel to calculate the total.",
        expectedTopic: "Excel",
        expectedType: "Excel Exercise"
      }
    ];
    
    // Run tests
    var results = [];
    testCases.forEach((test, index) => {
      // Test topic detection
      var topicResult = detectTopic(test.text);
      var topicPass = topicResult.topic === test.expectedTopic;
      
      // Test question type detection
      var typeResult = detectQuestionType(test.text);
      var typePass = typeResult.type === test.expectedType;
      
      results.push({
        case: index + 1,
        topicPass: topicPass,
        typePass: typePass,
        details: `Topic: ${topicResult.topic}, Type: ${typeResult.type}`
      });
      
      // Show progress
      SpreadsheetApp.getActive().toast(
        `Testing case ${index + 1}: ${topicPass && typePass ? '✅' : '❌'}`,
        '🧪 Test Progress',
        3
      );
    });
    
    // Show results
    var summary = results.map(r => 
      `Case ${r.case}: ${r.topicPass && r.typePass ? 'Pass' : 'Fail'}\n${r.details}`
    ).join('\n\n');
    
    ui.alert(
      '🧪 Test Results',
      `Section 1 Testing Complete\n\n${summary}`,
      ui.ButtonSet.OK
    );
    
    // Log test completion
    logAdminAction('Test', 'SYSTEM', 'Section 1 components tested');
    
  } catch (error) {
    console.error('Section 1 Test Error:', error);
    SpreadsheetApp.getActive().toast('Test failed: ' + error.message, '❌ Error', 5);
  }
}

/**
 * Tests emoji handling
 */
function testEmojis() {
  try {
    // Test emoji constants
    for (let key in ALERT_EMOJIS) {
      console.log(`Testing emoji: ${key} = ${ALERT_EMOJIS[key].emoji}`);
      if (!ALERT_EMOJIS[key].emoji) {
        throw new Error(`Missing emoji for ${key}`);
      }
    }
    
    // Test topic emojis
    for (let topic in topicCategories) {
      console.log(`Testing topic emoji: ${topic} = ${topicCategories[topic].display}`);
      if (!topicCategories[topic].display.match(/^[^\w\s]/)) {
        throw new Error(`Invalid emoji format for topic: ${topic}`);
      }
    }
    
    // Test question type emojis
    for (let type in questionTypes) {
      console.log(`Testing question type emoji: ${type} = ${questionTypes[type].emoji}`);
      if (!questionTypes[type].emoji) {
        throw new Error(`Missing emoji for question type: ${type}`);
      }
    }
    
    SpreadsheetApp.getActive().toast('Emoji tests passed', '✅ Success', 3);
    
  } catch (error) {
    console.error('Emoji Test Error:', error);
    SpreadsheetApp.getActive().toast('Emoji test failed: ' + error.message, '❌ Error', 5);
  }
}

// Modification points for Constants and Configuration (Section 1):
// 1. Add new emoji definitions to ALERT_EMOJIS
// 2. Add new topics to topicCategories with keywords
// 3. Add new question types with patterns
// 4. Enhance detection algorithms
// 5. Add new test cases
// 6. Customize emoji assignments
// 7. Add new category types
// 8. Enhance keyword matching
// 9. Add pattern recognition improvements
// 10. Implement machine learning for detection
// 11. Add support for multiple languages
// 12. Enhance test coverage
// 13. Add performance optimizations
// 14. Implement custom detection rules
// 15. Add category relationships

// ==================================
// SECTION 2: Core Parsing Functions
// ================================
// Handles parsing of raw quiz data into structured format
// Includes question processing, ID generation, and validation
// Added admin tracking and enhanced error checking

// ===== Constants =====
const ADMIN_CODES = {
  'Tye': 'A01',
  'Lois': 'A02'
};

const REQUIRED_COLUMNS = {
  QUESTION_ID: 0,
  DATE: 1,
  AUTHOR: 2,
  QUESTION_TEXT: 3,
  ANSWER_TEXT: 4,
  SCREENSHOTS: 5,
  TOPIC_EMOJI: 6,
  TOPIC: 7,
  TYPE_EMOJI: 8,
  QUESTION_TYPE: 9,
  STATUS: 10,
  PARSE_CONFIDENCE: 11,
  NEEDS_REVIEW: 12,
  SET: 13,
  DAY: 14
};

// ===== Core Parsing Functions =====

/**
 * Main parsing function for raw quiz data
 * Processes Discord messages into structured format
 */
function parseRawData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var rawSheet = ss.getSheetByName(SHEET_NAMES.RAW_DATA);
    var parsingSheet = ss.getSheetByName(SHEET_NAMES.PARSING_RESULTS);
    
    // Initialize required sheets
    createImageLibrary();
    setupAdminLog();
    setupParsingResults(parsingSheet);
    
    DEBUG.log('Starting raw data parsing...');
    
    // Get raw data
    var rawData = rawSheet.getRange("A:A").getValues();
    var currentRow = 2; // Start after headers
    
    // Initialize tracking variables
    var currentAuthor = "";
    var currentDate = "";
    var currentDay = "";
    var currentSet = "S1";
    var currentScreenshot = "";
    var processedQuestions = 0;
    
    // Process each line
    for (var i = 1; i < rawData.length; i++) {
      var line = rawData[i][0].toString().trim();
      
      if (line === "") continue;
      
      DEBUG.log(`Processing line: ${line}`);
      
      // Check for author line
      if (line.includes("—")) {
        var parts = line.split("—");
        currentAuthor = parts[0].trim();
        currentDate = parts[1].trim();
        DEBUG.log(`Author: ${currentAuthor}, Date: ${currentDate}`);
        continue;
      }
      
      // Check for screenshot URL
      if (line.includes("http") && 
          (line.includes("drive.google.com") || 
           line.includes(".jpg") || 
           line.includes(".png"))) {
        currentScreenshot = line;
        DEBUG.log(`Screenshot URL found: ${currentScreenshot}`);
        continue;
      }
      
      // Process questions
      if (line.includes("Question #")) {
        DEBUG.log('Processing question line...');
        
        // Check for day information
        if (line.toLowerCase().includes("day")) {
          var dayMatch = line.match(/day\s+(\d+)/i);
          if (dayMatch) {
            currentDay = padNumber(parseInt(dayMatch[1]), 2);
            DEBUG.log(`Day updated to: ${currentDay}`);
          }
        }
        
        // Extract admin code
        var adminCode = getAdminCode(currentAuthor);
        DEBUG.log(`Admin code: ${adminCode}`);
        
        // Process each question in the line
        var questions = line.split("Question #");
        for (var q = 1; q < questions.length; q++) {
          var questionText = questions[q].trim();
          questionText = questionText.replace(/^(\d+:?\s*)/i, '').trim();
      
          var questionNum = padNumber(q, 2);
          var questionId = generateQuestionId(currentSet, currentDay, questionNum, adminCode);
          
          DEBUG.log(`Processing Question ID: ${questionId}`);
          
          // Check for duplicates
          if (!isDuplicateQuestion(questionId, parsingSheet)) {
            processQuestion({
              id: questionId,
              text: questionText,
              author: currentAuthor,
              date: currentDate,
              day: currentDay,
              set: currentSet,
              screenshot: currentScreenshot,
              row: currentRow
            }, parsingSheet);
            
            processedQuestions++;
            currentRow++;
            DEBUG.log(`Question processed successfully`);
          } else {
            DEBUG.log(`Duplicate question ID detected: ${questionId}`);
          }
        }
        
        currentScreenshot = ""; // Clear screenshot after processing
      }
    }
    
    // Log completion and show success message
    var summary = `Processed ${processedQuestions} questions\n` +
                 `Current row: ${currentRow}\n` +
                 `Screenshots found: ${currentScreenshot ? "Yes" : "No"}`;
    
    DEBUG.log('Parsing complete: ' + summary);
    logAdminAction('Parse', 'SYSTEM', summary);
    showSuccessMessage(`Parsing complete! ${processedQuestions} questions processed.`);
    
  } catch (error) {
    DEBUG.log(`ERROR in parseRawData: ${error.message}`);
    logAdminAction('Error', 'SYSTEM', `Parsing error: ${error.message}`);
    showErrorMessage(error.message);
  }
}

/**
 * Generates standardized question ID
 * Format: S[Set]D[Day]Q[Question]A[Admin]
 */
function generateQuestionId(set, day, questionNum, adminCode) {
  return `${set}D${day}Q${questionNum}${adminCode}`;
}

/**
 * Gets admin code from author name
 */
function getAdminCode(author) {
  // Extract name before any underscores or spaces
  var baseName = author.split(/[_\s]/)[0];
  return ADMIN_CODES[baseName] || 'A00';
}

/**
 * Checks for duplicate question IDs
 */
function isDuplicateQuestion(questionId, sheet) {
  var data = sheet.getDataRange().getValues();
  return data.some(row => row[REQUIRED_COLUMNS.QUESTION_ID] === questionId);
}

/**
 * Processes individual question
 */
function processQuestion(questionData, sheet) {
  try {
    DEBUG.log(`Processing question: ${questionData.id}`);
    
    // Detect topic and type
    var topicInfo = detectTopic(questionData.text);
    var typeInfo = detectQuestionType(questionData.text);
    
    // Prepare row data
    var rowData = [
      questionData.id,              // Question ID
      questionData.date,            // Date
      questionData.author,          // Author
      questionData.text,            // Question Text
      "",                          // Answer Text
      questionData.screenshot,      // Screenshots
      topicInfo.emoji,             // Topic Emoji
      topicInfo.topic,             // Topic
      typeInfo.emoji,              // Type Emoji
      typeInfo.type,               // Question Type
      "Active",                    // Status
      "100%",                      // Parse Confidence
      "No",                        // Needs Review
      questionData.set,            // Set
      "Day " + questionData.day    // Day
    ];
    
    // Write to sheet
    sheet.getRange(questionData.row, 1, 1, rowData.length).setValues([rowData]);
    
    // Process screenshot if exists
    if (questionData.screenshot) {
      addToImageLibrary(questionData.screenshot, questionData.id);
    }
    
    DEBUG.log(`Question processed successfully: ${questionData.id}`);
    return true;
    
  } catch (error) {
    DEBUG.log(`ERROR processing question: ${error.message}`);
    throw new Error(`Failed to process question ${questionData.id}: ${error.message}`);
  }
}

/**
 * Sets up Parsing Results sheet with headers and formatting
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The Parsing Results sheet
 */
function setupParsingResults(sheet) {
  DEBUG.log('Setting up Parsing Results sheet...');
  
  try {
    // Set up headers
    var headers = [
      "Question ID",
      "Date",
      "Author",
      "Question Text",
      "Answer Text",
      "Screenshots",
      "Topic Emoji",
      "Topic",
      "Type Emoji",
      "Question Type",
      "Status",
      "Parse Confidence",
      "Needs Review",
      "Set",
      "Day"
    ];
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground("#4a86e8")
              .setFontColor("white")
              .setFontWeight("bold");
              
    // Clear old data
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clear();
    }
    
    DEBUG.log('Parsing Results sheet setup complete');
    
  } catch (error) {
    DEBUG.log('ERROR in setupParsingResults: ' + error.message);
    throw new Error('Failed to setup Parsing Results: ' + error.message);
  }
}

// ===== Testing Functions =====

/**
 * Tests parsing functionality
 */
function testParsing() {
  var ui = SpreadsheetApp.getUi();
  
  try {
    var response = ui.alert(
      '🧪 Test Parsing',
      'This will test parsing functionality with sample data.\nContinue?',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) return;
    
    DEBUG.log('Starting parsing test...');
    
    // Test ID generation
    testIdGeneration();
    
    // Test question processing
    testQuestionProcessing();
    
    // Test duplicate detection
    testDuplicateDetection();
    
    DEBUG.log('All parsing tests completed');
    ui.alert('✅ Tests Complete', 'Check execution log for details', ui.ButtonSet.OK);
    
  } catch (error) {
    DEBUG.log(`Test Error: ${error.message}`);
    ui.alert('❌ Test Error', error.message, ui.ButtonSet.OK);
  }
}

/**
 * Tests ID generation
 */
function testIdGeneration() {
  DEBUG.log('\nTesting ID generation...');
  
  var testCases = [
    {set: 'S1', day: '01', question: '01', admin: 'Tye', expected: 'S1D01Q01A01'},
    {set: 'S1', day: '27', question: '02', admin: 'Lois', expected: 'S1D27Q02A02'}
  ];
  
  testCases.forEach((test, index) => {
    var adminCode = getAdminCode(test.admin);
    var result = generateQuestionId(test.set, test.day, test.question, adminCode);
    DEBUG.log(`Test ${index + 1}: ${result} ${result === test.expected ? '✅' : '❌'}`);
  });
}

/**
 * Tests question processing
 */
function testQuestionProcessing() {
  DEBUG.log('\nTesting question processing...');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.PARSING_RESULTS);
  
  var testQuestion = {
    id: 'TEST_Q01A01',
    text: 'How do you create a new invoice in QBO?',
    author: 'Test_Admin',
    date: new Date().toLocaleDateString(),
    day: '01',
    set: 'TEST',
    screenshot: '',
    row: sheet.getLastRow() + 1
  };
  
  try {
    processQuestion(testQuestion, sheet);
    DEBUG.log('Question processing test passed ✅');
  } catch (error) {
    DEBUG.log(`Question processing test failed: ${error.message} ❌`);
  }
}

/**
 * Tests duplicate detection
 */
function testDuplicateDetection() {
  DEBUG.log('\nTesting duplicate detection...');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.PARSING_RESULTS);
  
  // Test with new ID
  var uniqueId = 'TEST_' + new Date().getTime();
  DEBUG.log(`Testing unique ID: ${uniqueId}`);
  var isUniqueDuplicate = isDuplicateQuestion(uniqueId, sheet);
  DEBUG.log(`Unique ID test: ${!isUniqueDuplicate ? '✅' : '❌'}`);
  
  // Test with existing ID
  var existingId = sheet.getRange('A2').getValue();
  DEBUG.log(`Testing existing ID: ${existingId}`);
  var isExistingDuplicate = isDuplicateQuestion(existingId, sheet);
  DEBUG.log(`Existing ID test: ${isExistingDuplicate ? '✅' : '❌'}`);
}

/**
 * Removes test entries before parsing real data
 */
function cleanupTestEntries() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var parsingSheet = ss.getSheetByName(SHEET_NAMES.PARSING_RESULTS);
  
  DEBUG.log('Starting test data cleanup...');
  
  try {
    var data = parsingSheet.getDataRange().getValues();
    var rowsToDelete = [];
    
    // Find test entries (starting from bottom)
    for (var i = data.length - 1; i > 0; i--) {
      if (data[i][0].toString().startsWith('TEST_')) {
        rowsToDelete.push(i + 1);
        DEBUG.log(`Found test entry in row ${i + 1}: ${data[i][0]}`);
      }
    }
    
    // Delete test rows from bottom up
    for (var i = 0; i < rowsToDelete.length; i++) {
      parsingSheet.deleteRow(rowsToDelete[i]);
      DEBUG.log(`Deleted row ${rowsToDelete[i]}`);
    }
    
    DEBUG.log(`Cleanup complete. Removed ${rowsToDelete.length} test entries`);
    SpreadsheetApp.getActive().toast(`Removed ${rowsToDelete.length} test entries`, '✅ Cleanup');
    
  } catch (error) {
    DEBUG.log(`ERROR: ${error.message}`);
    SpreadsheetApp.getActive().toast('Cleanup error: ' + error.message, '❌ Error');
  }
}

// Modification points for Core Parsing (Section 2):
// 1. Add support for different question formats
// 2. Enhance ID generation for multiple admins
// 3. Add more sophisticated duplicate detection
// 4. Implement answer parsing
// 5. Add validation for required fields
// 6. Enhance error handling
// 7. Add support for batch processing
// 8. Implement version tracking
// 9. Add data validation rules
// 10. Enhance testing coverage

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

// ==================================
// SECTION 4: Image Library Functions
// ================================
// Handles all image processing, storage, and management
// Includes preview generation, URL formatting, and library maintenance
// Added duplicate prevention and enhanced testing

// ===== Debug Configuration =====
const DEBUG = {
  logs: [],
  
  log: function(message) {
    this.logs.push({
      timestamp: new Date(),
      message: message
    });
    console.log(message);
  },
  
  showLogs: function() {
    var ui = SpreadsheetApp.getUi();
    if (this.logs.length === 0) {
      ui.alert('📝 Debug Logs', 'No logs to display', ui.ButtonSet.OK);
      return;
    }
    
    var logText = this.logs
      .map(log => `${log.timestamp.toLocaleTimeString()}: ${log.message}`)
      .join('\n');
    
    var html = HtmlService.createHtmlOutput(`<pre>${logText}</pre>`)
      .setWidth(600)
      .setHeight(400);
    
    ui.showModelessDialog(html, '📝 Debug Logs');
  },
  
  clear: function() {
    this.logs = [];
  }
};

// ===== Core Image Library Setup =====
/**
 * Creates and initializes Image Library tab if it doesn't exist
 * @return {GoogleAppsScript.Spreadsheet.Sheet} The Image Library sheet
 */
function createImageLibrary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var imageLib = ss.getSheetByName('Image Library');
  
  if (!imageLib) {
    imageLib = ss.insertSheet('Image Library');
    
    // Set up headers
    var headers = [[
      'Image ID',
      'URL',
      'Preview',
      'Used in Questions',
      'Description',
      'Topic/Category',
      'Date Added'
    ]];
    
    // Apply headers and formatting
    var headerRange = imageLib.getRange('A1:G1');
    headerRange.setValues(headers);
    formatImageLibraryHeaders(imageLib);
    setImageLibraryColumnWidths(imageLib);
  }
  
  return imageLib;
}

function formatImageLibraryHeaders(sheet) {
  var headerRange = sheet.getRange('A1:G1');
  headerRange.setBackground('#4a86e8')
            .setFontColor('white')
            .setFontWeight('bold');
}

function setImageLibraryColumnWidths(sheet) {
  sheet.setColumnWidth(1, 100);  // Image ID
  sheet.setColumnWidth(2, 250);  // URL
  sheet.setColumnWidth(3, 300);  // Preview
  sheet.setColumnWidth(4, 200);  // Used In Questions
  sheet.setColumnWidth(5, 200);  // Description
  sheet.setColumnWidth(6, 150);  // Topic/Category
  sheet.setColumnWidth(7, 100);  // Date Added
}

// ===== Image Processing Functions =====
function formatDriveImageUrl(url) {
  if (!url) return '';
  
  try {
    if (url.includes('drive.google.com/file/d/')) {
      var fileId = url.match(/\/d\/(.*?)\/view/)[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return url;
  } catch (error) {
    DEBUG.log('URL Format Error: ' + error.message);
    return url;
  }
}

function validateImageUrl(url) {
  if (!url) return false;
  
  try {
    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com')) {
      return url.includes('/file/d/') && url.includes('/view');
    }
    
    // Check if it's a direct image URL
    if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return true;
    }
    
    DEBUG.log(`Invalid URL format: ${url}`);
    return false;
    
  } catch (error) {
    DEBUG.log(`URL validation error: ${error.message}`);
    return false;
  }
}

function addToImageLibrary(imageUrl, questionId, isTest = false) {
  DEBUG.log(`Adding image to library - URL: ${imageUrl}, ID: ${questionId}, isTest: ${isTest}`);
  
  if (!imageUrl || !questionId) {
    DEBUG.log('Missing required parameters');
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var imageLib = ss.getSheetByName('Image Library');
  
  try {
    // Extract file ID first
    var fileId = imageUrl.match(/\/d\/(.*?)\/view/)[1];
    DEBUG.log(`File ID: ${fileId}`);
    
    // Check if this file ID already exists in library
    var data = imageLib.getDataRange().getValues();
    var existingEntry = null;
    
    for (var i = 1; i < data.length; i++) {
      var urlCell = imageLib.getRange(i + 1, 2).getFormula();
      if (urlCell && urlCell.includes(fileId)) {
        existingEntry = {row: i + 1, questions: data[i][3]};
        DEBUG.log(`Found existing image at row ${i + 1}`);
        break;
      }
    }
    
    if (existingEntry) {
      // Update existing entry with new question ID if needed
      if (!existingEntry.questions.includes(questionId)) {
        var updatedQuestions = existingEntry.questions ? 
          existingEntry.questions + ', ' + questionId : questionId;
        imageLib.getRange(existingEntry.row, 4).setValue(updatedQuestions);
        DEBUG.log(`Updated question IDs for existing image: ${updatedQuestions}`);
      } else {
        DEBUG.log('Question ID already associated with this image');
      }
      return; // Exit function - no need to add new entry
    }
    
    // If we get here, this is a new image
    DEBUG.log('Adding new image entry');
    
    // Get question details
    var details = isTest ? {
      topic: 'Test Category',
      topicEmoji: '🧪',
      questionText: 'Test Question',
      description: `Test image for ${questionId}`
    } : getQuestionDetails(questionId);
    
    if (!details) {
      throw new Error('Question details not found for ID: ' + questionId);
    }
    
    // Add new entry
    var newRow = imageLib.getLastRow() + 1;
    var imageId = 'IMG_' + padNumber(newRow - 1, 3);
    
    var rowData = [
      imageId,
      imageUrl,
      '', // Preview formula will be set separately
      questionId,
      details.description,
      `${details.topicEmoji} ${details.topic}`,
      new Date().toLocaleDateString()
    ];
    
    DEBUG.log('Setting values for new entry');
    imageLib.getRange(newRow, 1, 1, 7).setValues([rowData]);
    
    // Set preview
    setImagePreview(imageLib, newRow, imageUrl);
    DEBUG.log('New entry added successfully');
    
  } catch (error) {
    DEBUG.log(`ERROR in addToImageLibrary: ${error.message}`);
    console.error('Error in addToImageLibrary:', error);
    SpreadsheetApp.getActive().toast('Error adding image: ' + error.message, '❌ Error');
    throw error;
  }
}

function getQuestionDetails(questionId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var parsingSheet = ss.getSheetByName('Parsing Results');
  var data = parsingSheet.getDataRange().getValues();
  
  // Find question in Parsing Results
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === questionId) {
      return {
        topic: data[i][7],        // Topic column
        topicEmoji: data[i][6],   // Topic Emoji column
        questionText: data[i][3],  // Question Text column
        description: `Image for ${data[i][7]} question: ${data[i][3].substring(0, 100)}...`
      };
    }
  }
  return null;
}

function setImagePreview(sheet, row, imageUrl) {
  try {
    DEBUG.log(`Setting preview for row ${row}`);
    DEBUG.log(`Original URL: ${imageUrl}`);
    
    // Extract file ID
    var fileId = imageUrl.match(/\/d\/(.*?)\/view/)[1];
    DEBUG.log(`File ID: ${fileId}`);
    
    // Get file and check permissions
    var file = DriveApp.getFileById(fileId);
    DEBUG.log(`File name: ${file.getName()}`);
    
    // Update sharing if needed
    if (file.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK) {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      DEBUG.log('Updated sharing settings');
    }
    
    // Try different preview URL format
    var previewUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w200-h200`;
    DEBUG.log(`Preview URL: ${previewUrl}`);
    
    // Set preview formula
    var formula = `=IMAGE("${previewUrl}")`;
    DEBUG.log(`Setting formula: ${formula}`);
    
    var cell = sheet.getRange(row, 3);
    cell.setFormula(formula);
    
    // Set row height and width
    sheet.setRowHeight(row, 100);
    sheet.setColumnWidth(3, 200);
    
    // Force refresh
    SpreadsheetApp.flush();
    
    // Verify formula was set
    var setFormula = cell.getFormula();
    DEBUG.log(`Verified formula in cell: ${setFormula}`);
    
  } catch (error) {
    DEBUG.log(`Preview Error: ${error.message}`);
    sheet.getRange(row, 3)
      .setValue('Preview Error')
      .setNote('Error: ' + error.message);
  }
}

// ===== Testing Functions =====
/**
 * Updates sharing permissions for all image files
 */
function updateImagePermissions() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var imageLib = ss.getSheetByName('Image Library');
  
  DEBUG.log('Starting permission updates...');
  
  try {
    // Get all URLs
    var data = imageLib.getDataRange().getValues();
    
    // Skip header row
    for (var i = 1; i < data.length; i++) {
      var urlCell = data[i][1];
      if (urlCell && urlCell.includes('HYPERLINK')) {
        // Extract URL from HYPERLINK formula
        var url = urlCell.match(/HYPERLINK\("([^"]+)"/)[1];
        var fileId = url.match(/\/d\/(.*?)\/view/)[1];
        
        DEBUG.log(`Processing file ID: ${fileId}`);
        
        try {
          var file = DriveApp.getFileById(fileId);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          DEBUG.log(`Updated permissions for file: ${file.getName()}`);
        } catch (error) {
          DEBUG.log(`Error updating file ${fileId}: ${error.message}`);
        }
      }
    }
    
    SpreadsheetApp.getActive().toast('Permissions updated', '✅ Success');
    
  } catch (error) {
    DEBUG.log(`Error: ${error.message}`);
    SpreadsheetApp.getActive().toast('Error updating permissions', '❌ Error');
  }
}

/**
 * Tests Image Library functionality
 */
function testImageLibrary() {
  var ui = SpreadsheetApp.getUi();
  
  try {
    var response = ui.alert(
      '🧪 Test Image Library',
      'This will test image processing and preview generation.\nContinue?',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) return;
    
    // Get test image from Parsing Results
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var parsingSheet = ss.getSheetByName('Parsing Results');
    
    // Look for first row with URL
    var urls = parsingSheet.getRange('F2:F' + parsingSheet.getLastRow()).getValues();
    var firstUrlRow = -1;
    
    for (var i = 0; i < urls.length; i++) {
      if (urls[i][0] && urls[i][0].includes('drive.google.com')) {
        firstUrlRow = i + 2; // Add 2 for 1-based index and header row
        break;
      }
    }
    
    if (firstUrlRow === -1) {
      throw new Error('No valid URLs found in Parsing Results');
    }
    
    var testUrl = parsingSheet.getRange('F' + firstUrlRow).getValue();
    var questionId = parsingSheet.getRange('A' + firstUrlRow).getValue();
    
    DEBUG.log(`Testing with URL: ${testUrl}`);
    DEBUG.log(`Question ID: ${questionId}`);
    
    // Update permissions first
    var fileId = testUrl.match(/\/d\/(.*?)\/view/)[1];
    var file = DriveApp.getFileById(fileId);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    DEBUG.log('Updated file permissions');
    
    // Try to add image
    addToImageLibrary(testUrl, questionId);
    
    ui.alert('✅ Test Complete', 'Check Image Library for results', ui.ButtonSet.OK);
    
  } catch (error) {
    DEBUG.log('Test Error: ' + error.message);
    ui.alert('❌ Test Error', error.message, ui.ButtonSet.OK);
  }
}

/**
 * Verifies and displays current permission settings with detailed preview logging
 */
function verifyPermissions() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var imageLib = ss.getSheetByName('Image Library');
  
  DEBUG.log('Starting detailed permission and preview check...');
  
  try {
    var data = imageLib.getDataRange().getValues();
    DEBUG.log(`Found ${data.length - 1} image entries to process`);
    
    // Skip header
    for (var i = 1; i < data.length; i++) {
      var urlCell = imageLib.getRange(i + 1, 2).getFormula(); // Get formula instead of value
      DEBUG.log(`\nProcessing row ${i + 1}`);
      DEBUG.log(`URL cell formula: ${urlCell}`);
      
      if (urlCell && urlCell.includes('HYPERLINK')) {
        // Extract URL from HYPERLINK formula
        var url = urlCell.match(/HYPERLINK\("([^"]+)"/)[1];
        DEBUG.log(`Extracted URL: ${url}`);
        
        var fileId = url.match(/\/d\/(.*?)\/view/)[1];
        DEBUG.log(`File ID: ${fileId}`);
        
        // Check file permissions
        var file = DriveApp.getFileById(fileId);
        DEBUG.log(`File name: ${file.getName()}`);
        DEBUG.log(`Before - Access: ${file.getSharingAccess()}`);
        DEBUG.log(`Before - Permission: ${file.getSharingPermission()}`);
        
        // Update permissions
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        DEBUG.log(`After - Access: ${file.getSharingAccess()}`);
        DEBUG.log(`After - Permission: ${file.getSharingPermission()}`);
        
        // Update preview
        setImagePreview(imageLib, i + 1, url);
        DEBUG.log('Preview updated');
      }
    }
    
    DEBUG.log('\nAll entries processed');
    SpreadsheetApp.getActive().toast('Permissions and previews updated', '✅ Success');
    
  } catch (error) {
    DEBUG.log(`ERROR: ${error.message}`);
    SpreadsheetApp.getActive().toast('Error updating permissions and previews', '❌ Error');
  }
}

/**
 * Tests duplicate prevention in Image Library
 */
function testDuplicatePrevention() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var imageLib = ss.getSheetByName('Image Library');
  var parsingSheet = ss.getSheetByName('Parsing Results');
  
  DEBUG.log('Starting duplicate prevention test...');
  
  try {
    // First, get current state
    var currentRows = imageLib.getLastRow();
    DEBUG.log(`Current Image Library rows: ${currentRows}`);
    
    // Get a test image URL from Parsing Results
    var testUrl = parsingSheet.getRange('F5').getValue();
    var questionId = parsingSheet.getRange('A5').getValue();
    
    DEBUG.log(`\nTest 1: Adding image first time`);
    DEBUG.log(`URL: ${testUrl}`);
    DEBUG.log(`Question ID: ${questionId}`);
    
    // Try to add the image
    addToImageLibrary(testUrl, questionId);
    
    // Try to add the same image again with same question ID
    DEBUG.log(`\nTest 2: Adding same image/ID again`);
    addToImageLibrary(testUrl, questionId);
    
    // Try to add same image with different question ID
    DEBUG.log(`\nTest 3: Adding same image with different ID`);
    addToImageLibrary(testUrl, 'TEST_' + questionId);
    
    // Check final state
    var finalRows = imageLib.getLastRow();
    DEBUG.log(`\nFinal Image Library rows: ${finalRows}`);
    DEBUG.log(`New rows added: ${finalRows - currentRows}`);
    
    // Show results
    SpreadsheetApp.getActive().toast('Duplicate prevention test complete', '✅ Test');
    
  } catch (error) {
    DEBUG.log(`ERROR: ${error.message}`);
    SpreadsheetApp.getActive().toast('Test error: ' + error.message, '❌ Error');
  }
}

/**
 * Cleans up existing duplicate images in Image Library
 * Combines question IDs and removes duplicate entries
 */
function cleanupExistingDuplicates() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var imageLib = ss.getSheetByName('Image Library');
  
  DEBUG.log('Starting cleanup of existing duplicates...');
  
  try {
    var data = imageLib.getDataRange().getValues();
    var fileIdMap = new Map(); // Track unique file IDs
    var rowsToDelete = [];
    
    DEBUG.log(`Processing ${data.length - 1} entries...`);
    
    // Skip header row, process each entry
    for (var i = 1; i < data.length; i++) {
      var urlCell = imageLib.getRange(i + 1, 2).getFormula();
      if (!urlCell) continue;
      
      // Extract file ID from URL
      var match = urlCell.match(/\/d\/(.*?)\/view/);
      if (match) {
        var fileId = match[1];
        DEBUG.log(`\nProcessing row ${i + 1}, File ID: ${fileId}`);
        
        if (fileIdMap.has(fileId)) {
          // Found a duplicate
          var originalRow = fileIdMap.get(fileId);
          DEBUG.log(`Duplicate found - Original in row ${originalRow + 1}`);
          
          // Combine question IDs
          var originalQuestions = data[originalRow][3];
          var newQuestions = data[i][3];
          var allQuestions = originalQuestions.split(', ').concat(newQuestions.split(', '));
          var uniqueQuestions = [...new Set(allQuestions)].join(', ');
          
          // Update original entry
          imageLib.getRange(originalRow + 1, 4).setValue(uniqueQuestions);
          DEBUG.log(`Updated questions: ${uniqueQuestions}`);
          
          // Mark duplicate for deletion
          rowsToDelete.push(i + 1);
          DEBUG.log(`Marked row ${i + 1} for deletion`);
        } else {
          // First instance of this file ID
          fileIdMap.set(fileId, i);
          DEBUG.log(`New unique image recorded`);
        }
      }
    }
    
    // Delete duplicates from bottom up
    rowsToDelete.sort((a, b) => b - a);
    for (var i = 0; i < rowsToDelete.length; i++) {
      imageLib.deleteRow(rowsToDelete[i]);
      DEBUG.log(`Deleted row ${rowsToDelete[i]}`);
    }
    
    DEBUG.log(`\nCleanup complete:`);
    DEBUG.log(`- Removed ${rowsToDelete.length} duplicate entries`);
    DEBUG.log(`- Remaining unique entries: ${data.length - 1 - rowsToDelete.length}`);
    
    SpreadsheetApp.getActive().toast(
      `Removed ${rowsToDelete.length} duplicates`,
      '✅ Cleanup Complete'
    );
    
  } catch (error) {
    DEBUG.log(`ERROR: ${error.message}`);
    SpreadsheetApp.getActive().toast('Cleanup error: ' + error.message, '❌ Error');
  }
}

/**
 * Removes test IDs from Question references
 */
function cleanupTestQuestionIds() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var imageLib = ss.getSheetByName('Image Library');
  
  DEBUG.log('Starting cleanup of test question IDs...');
  
  try {
    var data = imageLib.getDataRange().getValues();
    var updatesCount = 0;
    
    // Skip header row
    for (var i = 1; i < data.length; i++) {
      var questionIds = data[i][3].toString(); // Column D: Used in Questions
      if (questionIds.includes('TEST_')) {
        DEBUG.log(`\nProcessing row ${i + 1}`);
        DEBUG.log(`Original IDs: ${questionIds}`);
        
        // Remove any TEST_ IDs
        var cleanedIds = questionIds.split(', ')
          .filter(id => !id.includes('TEST_'))
          .join(', ');
        
        DEBUG.log(`Cleaned IDs: ${cleanedIds}`);
        
        // Update cell
        imageLib.getRange(i + 1, 4).setValue(cleanedIds);
        updatesCount++;
      }
    }
    
    DEBUG.log(`\nCleanup complete:`);
    DEBUG.log(`- Updated ${updatesCount} entries`);
    
    SpreadsheetApp.getActive().toast(
      `Removed test IDs from ${updatesCount} entries`,
      '✅ Cleanup Complete'
    );
    
  } catch (error) {
    DEBUG.log(`ERROR: ${error.message}`);
    SpreadsheetApp.getActive().toast('Cleanup error: ' + error.message, '❌ Error');
  }
}

// Modification points for Image Library (Section 4):
// 1. Add support for different image hosting services
// 2. Enhance preview functionality
// 3. Add image metadata extraction
// 4. Implement image caching
// 5. Add bulk image processing
// 6. Enhance error handling
// 7. Add image validation
// 8. Implement preview size options
// 9. Add image categorization
// 10. Enhance testing coverage

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
