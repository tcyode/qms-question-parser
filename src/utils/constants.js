/**
    * @fileoverview Constants and configuration values for QMS Parser
    * Contains alert emojis, topic categories, action colors, and dashboard settings
    */

// ======================================
// SECTION 1: Constants and Configuration
// ======================================

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

