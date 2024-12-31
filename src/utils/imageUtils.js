 /**
 * @fileoverview Image Library functions for QMS Parser
 * Handles processing and management of screenshots and attachments
 * Includes URL management and image processing
 */

// Import constants (we'll set this up later)
// const { REQUIRED_COLUMNS } = require('./constants');

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
  