/**
 * @fileoverview Main parsing functions for QMS Parser
 * Handles parsing of raw quiz data into structured format
 * Includes question processing, ID generation, and validation
*/

// Import constants (we'll set this up later)
// const { ADMIN_CODES, REQUIRED_COLUMNS } = require('./utils/constants');
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
  
